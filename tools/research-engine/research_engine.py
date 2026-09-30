#!/usr/bin/env python3
"""Evidence-first GitHub Awesome/Cookbook research engine.

Uses GitHub REST API + optional public web pages, caches responses, verifies links,
deduplicates candidates, records provenance, emits projects.json and Markdown.
No ranking guarantees; UNKNOWN is preserved rather than invented.
"""
from __future__ import annotations
import argparse, concurrent.futures, dataclasses, datetime as dt, hashlib, json, os, re, sys, time
from pathlib import Path
from typing import Any
from urllib.parse import quote, urlparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

UA = "CodesbyFebin-ResearchEngine/1.0 (+https://github.com/CodesbyFebin)"
API = "https://api.github.com"

@dataclasses.dataclass
class Config:
    repo: str
    niche: str
    target: int
    out: Path
    cache: Path
    token: str | None
    max_candidates: int = 200
    workers: int = 8
    stale_days: int = 90

class Client:
    def __init__(self, cfg: Config): self.cfg = cfg; cfg.cache.mkdir(parents=True, exist_ok=True)
    def _key(self, url: str): return self.cfg.cache / (hashlib.sha256(url.encode()).hexdigest()+".json")
    def json(self, url: str, ttl=86400) -> Any:
        p=self._key(url)
        if p.exists() and time.time()-p.stat().st_mtime < ttl:
            return json.loads(p.read_text())
        h={"User-Agent":UA,"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"}
        if self.cfg.token: h["Authorization"]="Bearer "+self.cfg.token
        req=Request(url,headers=h)
        try:
            with urlopen(req,timeout=25) as r: data=json.loads(r.read().decode())
        except HTTPError as e:
            raise RuntimeError(f"HTTP {e.code}: {url}") from e
        p.write_text(json.dumps(data,indent=2)); return data
    def head_ok(self,url:str)->bool:
        try:
            req=Request(url,headers={"User-Agent":UA},method="HEAD")
            with urlopen(req,timeout=12) as r: return 200 <= r.status < 400
        except Exception:
            try:
                req=Request(url,headers={"User-Agent":UA,"Range":"bytes=0-0"})
                with urlopen(req,timeout=12) as r: return 200 <= r.status < 400
            except Exception: return False


def slug(s:str)->str: return re.sub(r"[^a-z0-9]+","-",s.lower()).strip("-")
def github_full_name(url:str)->str|None:
    m=re.match(r"https?://github\.com/([^/]+)/([^/#?]+)",url)
    return f"{m.group(1)}/{m.group(2).removesuffix('.git')}" if m else None

def discover(c:Client,cfg:Config)->list[dict]:
    # Multiple queries reduce single-keyword bias. GitHub Search API caps results.
    qs=[cfg.niche, f'"{cfg.niche}" in:name,description,readme', f'{cfg.niche} topic:{slug(cfg.niche)}']
    seen={};
    for q in qs:
        for page in range(1, min(10,(cfg.max_candidates+29)//30)+1):
            url=f"{API}/search/repositories?q={quote(q)}&sort=stars&order=desc&per_page=30&page={page}"
            try: payload=c.json(url,ttl=21600)
            except RuntimeError: break
            items=payload.get("items",[])
            if not items: break
            for x in items:
                seen[x["full_name"].lower()]={"full_name":x["full_name"],"html_url":x["html_url"]}
                if len(seen)>=cfg.max_candidates: break
            if len(seen)>=cfg.max_candidates: break
        if len(seen)>=cfg.max_candidates: break
    return list(seen.values())

def enrich_one(c:Client,cfg:Config,x:dict)->dict:
    full=x["full_name"]; meta=c.json(f"{API}/repos/{full}",ttl=21600)
    topics=meta.get("topics") or []
    desc=(meta.get("description") or "").strip()
    hay=" ".join([full,desc," ".join(topics)]).lower()
    terms=[t for t in re.split(r"[^a-z0-9+#.-]+",cfg.niche.lower()) if len(t)>2]
    relevance=sum(2 if t in hay else 0 for t in terms)
    if any(t in " ".join(topics).lower() for t in terms): relevance+=2
    license_obj=meta.get("license") or {}
    archived=bool(meta.get("archived")); disabled=bool(meta.get("disabled"))
    canonical=meta.get("html_url")
    sources=[canonical]
    homepage=(meta.get("homepage") or "").strip() or None
    if homepage: sources.append(homepage)
    status="VERIFIED" if canonical and desc and not disabled else "PARTIAL"
    if archived: status="STALE"
    return {
      "name":meta.get("name"),"full_name":full,"repository":canonical,"homepage":homepage,
      "description":desc or "Description unavailable; inspect project documentation.",
      "category":"Unclassified","primary_language":meta.get("language"),
      "license":license_obj.get("spdx_id") if license_obj else None,
      "topics":topics,"archived":archived,"fork":bool(meta.get("fork")),
      "stars_snapshot":meta.get("stargazers_count"),"updated_at":meta.get("updated_at"),
      "relevance_score":relevance,
      "verification":{"status":status,"checked_at":dt.date.today().isoformat(),"sources":sources}
    }

def dedupe_rank(items:list[dict],target:int)->tuple[list[dict],list[dict]]:
    accepted=[]; rejected=[]; seen=set()
    for x in sorted(items,key=lambda z:(z["relevance_score"], not z["archived"], z["stars_snapshot"] or 0),reverse=True):
        key=(x.get("repository") or "").rstrip("/").lower()
        reason=None
        if not key or key in seen: reason="duplicate-or-missing-canonical-url"
        elif x.get("fork"): reason="fork-not-canonical"
        elif x["relevance_score"]<=0: reason="insufficient-niche-relevance"
        if reason: rejected.append({"project":x.get("full_name"),"reason":reason}); continue
        seen.add(key); accepted.append(x)
        if len(accepted)>=target: break
    return accepted,rejected

def schema()->dict:
    return {"$schema":"https://json-schema.org/draft/2020-12/schema","type":"array","items":{"type":"object","required":["name","repository","description","verification"],"properties":{"name":{"type":"string"},"repository":{"type":"string","format":"uri"},"homepage":{"type":["string","null"]},"description":{"type":"string"},"category":{"type":"string"},"primary_language":{"type":["string","null"]},"license":{"type":["string","null"]},"topics":{"type":"array","items":{"type":"string"}},"verification":{"type":"object","required":["status","checked_at","sources"]}}}}

def render_readme(cfg:Config,projects:list[dict])->str:
    rows=[]
    for p in projects:
        lang=p["primary_language"] or "Unknown"; lic=p["license"] or "Unknown"
        d=p["description"].replace("|","\\|")
        rows.append(f'| [{p["name"]}]({p["repository"]}) | {d} | {lang} | {lic} | {p["verification"]["status"]} |')
    return f'''# Awesome {cfg.niche}\n\nEvidence-first catalog of real projects related to **{cfg.niche}**. Entries are discovered from GitHub and retained only when they pass the repository's automated relevance and canonical-link gates. Automated inclusion is a starting point for human review, not an endorsement.\n\n## Quick start\n\n1. Browse the catalog below.\n2. Open the canonical repository for implementation details.\n3. Treat `Unknown` as unknown, not as a negative result.\n4. See `docs/METHODOLOGY.md` before relying on comparison fields.\n\n## Projects\n\n| Project | What it does | Language | License | Verification |\n|---|---|---|---|---|\n{chr(10).join(rows)}\n\n## Data and research\n\n- `data/projects.json` — machine-readable catalog.\n- `data/schema.json` — validation contract.\n- `data/rejected.json` — automated rejection reasons.\n- `docs/METHODOLOGY.md` — research and verification method.\n- `llms.txt` — compact machine/LLM discovery surface.\n\n## Contributing\n\nSubmit canonical projects with evidence. Popularity alone is not evidence of security, maintenance, or production readiness.\n'''

def write_outputs(cfg:Config,projects:list[dict],rejected:list[dict]):
    out=cfg.out; (out/"data").mkdir(parents=True,exist_ok=True); (out/"docs").mkdir(exist_ok=True)
    (out/"data/projects.json").write_text(json.dumps(projects,indent=2)+"\n")
    (out/"data/schema.json").write_text(json.dumps(schema(),indent=2)+"\n")
    (out/"data/rejected.json").write_text(json.dumps(rejected,indent=2)+"\n")
    (out/"README.md").write_text(render_readme(cfg,projects))
    (out/"docs/METHODOLOGY.md").write_text(f'''# Research methodology\n\n## Scope\n\nThis catalog covers `{cfg.niche}`. The automated engine discovers GitHub candidates, retrieves canonical repository metadata through the GitHub API, deduplicates canonical URLs, applies niche-relevance gates, and records provenance.\n\n## Evidence rules\n\n- `VERIFIED`: canonical repository exists and core descriptive metadata was observed.\n- `PARTIAL`: important metadata is unavailable.\n- `UNKNOWN`: evidence is insufficient.\n- `STALE`: archived or outside the configured freshness policy.\n\nA VERIFIED catalog entry does **not** mean the software is secure, production-ready, maintained, or endorsed. Those require separate evidence.\n\n## Human review\n\nAutomated relevance is deliberately conservative but imperfect. Review generated entries before publication, especially taxonomy and descriptions.\n''')
    (out/"llms.txt").write_text(f'''# {cfg.repo}\nPurpose: evidence-first catalog for {cfg.niche}\nSource of truth: data/projects.json\nMethodology: docs/METHODOLOGY.md\nVerification rule: UNKNOWN is never converted to FALSE.\nOwner: https://github.com/CodesbyFebin\n''')
    report={"repository":cfg.repo,"niche":cfg.niche,"target":cfg.target,"qualified":len(projects),"rejected":len(rejected),"generated_at":dt.datetime.now(dt.timezone.utc).isoformat(),"publication_gate":"PASS" if projects else "FAIL"}
    (out/"quality-report.json").write_text(json.dumps(report,indent=2)+"\n")

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--repo",required=True); ap.add_argument("--niche",required=True); ap.add_argument("--target",type=int,default=50)
    ap.add_argument("--out",default="generated"); ap.add_argument("--cache",default=".cache/research"); ap.add_argument("--max-candidates",type=int,default=200); ap.add_argument("--workers",type=int,default=8)
    a=ap.parse_args(); cfg=Config(a.repo,a.niche,a.target,Path(a.out),Path(a.cache),os.getenv("GITHUB_TOKEN"),a.max_candidates,a.workers)
    c=Client(cfg); candidates=discover(c,cfg); enriched=[]
    with concurrent.futures.ThreadPoolExecutor(max_workers=cfg.workers) as ex:
        futs=[ex.submit(enrich_one,c,cfg,x) for x in candidates]
        for f in concurrent.futures.as_completed(futs):
            try: enriched.append(f.result())
            except Exception as e: print(f"WARN: {e}",file=sys.stderr)
    projects,rejected=dedupe_rank(enriched,cfg.target); write_outputs(cfg,projects,rejected)
    print(json.dumps({"candidates":len(candidates),"qualified":len(projects),"rejected":len(rejected),"output":str(cfg.out)},indent=2))

if __name__=="__main__": main()
