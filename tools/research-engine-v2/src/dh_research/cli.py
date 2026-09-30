from __future__ import annotations
import argparse, json, os, sys
from .config import Config
from . import discover, enrich, dedupe, classify, verify, generate, quality, ndjson
from .errors import TransportUnavailable, RateLimited, AuthError

def _manifest(path): return json.load(open(path))["repositories"]

def main(argv=None) -> int:
    ap = argparse.ArgumentParser(prog="dh-research",
        description="Evidence-first GitHub repository content factory. VERIFIED=observed. UNKNOWN preserved. 50=ceiling.")
    sub = ap.add_subparsers(dest="cmd", required=True)

    r = sub.add_parser("repo", help="research ONE repository")
    r.add_argument("--manifest", default="portfolio-manifest.json")
    r.add_argument("--repo", required=True)
    r.add_argument("--portfolio-dir", default=".")
    r.add_argument("--offline", action="store_true")

    s = sub.add_parser("selftest", help="offline fixture-based invariant check")
    a = ap.parse_args(argv)

    if a.cmd == "selftest":
        return _selftest()

    cfg = Config(offline=a.offline)
    if a.cmd == "repo":
        repos = {x["name"]: x for x in _manifest(a.manifest)}
        if a.repo not in repos:
            print(f"unknown repo {a.repo}", file=sys.stderr); return 2
        repo = dict(repos[a.repo])
        target = repo.get("targetProjects", 50)
        niche = repo["niche"]
        pair = repo.get("pair", "")

        out = os.path.join(a.portfolio_dir, "out", repo["name"])
        os.makedirs(os.path.join(out, "data"), exist_ok=True)

        taxonomy = {}
        try: taxonomy = json.load(open(os.path.join(a.portfolio_dir, "taxonomy.json")))
        except: pass
        tax_entry = taxonomy.get(niche, {})
        synonyms = tax_entry.get("synonyms", [])
        categories = tax_entry.get("categories", [])

        client = __import__("dh_research.github_client", fromlist=["GitHubClient"]).GitHubClient(cfg)
        try:
            cands = discover.discover(client, niche, synonyms, max_candidates=200)
        except (TransportUnavailable, RateLimited, AuthError):
            cands = []

        cands, dupes = dedupe.dedupe(cands)
        records = []
        for c in cands:
            if not cfg.offline:
                try: enrich.enrich(client, c)
                except (TransportUnavailable, RateLimited, AuthError): pass
            cat, sub = classify.classify(c, categories)
            r = verify.to_record(c, cat, sub, niche)
            records.append(r)
            ndjson.append(os.path.join(a.portfolio_dir, "evidence", "projects.ndjson"), r.to_dict())

        json.dump([r.to_dict() for r in records], open(os.path.join(out, "data", "projects.json"), "w"), indent=2)
        open(os.path.join(out, "README.md"), "w").write(generate.render_readme(niche, repo["name"], records, pair))
        open(os.path.join(out, "llms.txt"), "w").write(generate.render_llms(niche, repo["name"], pair, records))

        q = quality.evaluate(out, records, target, len(repo.get("related", [])))
        os.makedirs(os.path.join(out, "reports"), exist_ok=True)
        json.dump(q, open(os.path.join(out, "reports", "quality.json"), "w"), indent=2)
        print(json.dumps(q, indent=2))
        return 0 if q["status"] == "COMPLETE" else 1

def _selftest() -> int:
    from .models import VERIFIED, UNKNOWN, SIMULATED, Candidate, Evidence
    from . import verify, dedupe

    assert dedupe.canonical_url("https://github.com/Org/Repo.git/") == "https://github.com/org/repo"
    c = Candidate(full_name="org/repo", html_url="https://github.com/org/repo",
                  description="x"*30, topics=["mcp"])
    c.evidence.append(Evidence("repository", "https://github.com/org/repo", "unavailable:TransportUnavailable"))
    rec = verify.to_record(c, "MCP", None, "MCP")
    assert rec.verification.status == UNKNOWN, rec.verification.status

    c2 = Candidate(full_name="org/repo2", html_url="https://github.com/org/repo2",
                   description="A real tool."*5, topics=["mcp"], readme_raw="# Docs\nDocker compose up")
    c2.evidence.append(Evidence("repository", "https://github.com/org/repo2"))
    c2.evidence.append(Evidence("readme", "https://github.com/org/repo2/blob/HEAD/README.md"))
    rec2 = verify.to_record(c2, "MCP", None, "MCP")
    assert rec2.verification.status == VERIFIED

    rec3 = verify.to_record(c2, "MCP", None, "MCP", from_fixture=True)
    assert rec3.verification.status == SIMULATED
    
    print("✓ SELFTEST PASSED — anti-fabrication invariants hold.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
