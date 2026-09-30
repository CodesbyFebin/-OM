from __future__ import annotations
import json
from .models import ProjectRecord, VERIFIED, PARTIAL

def _yn(v): return "unknown" if v is None else ("yes" if v else "no")

def comparison_matrix(records: list[ProjectRecord]) -> str:
    cols = [("Language", lambda r: r.primary_language or "—"),
            ("License", lambda r: r.license or "—"),
            ("Docker", lambda r: _yn(r.docker)),
            ("K8s", lambda r: _yn(r.kubernetes)),
            ("State", lambda r: r.verification.status)]
    head = "| Project | " + " | ".join(c[0] for c in cols) + " |"
    sep = "|" + "---|" * (len(cols) + 1)
    rows = [f"| [{r.name}]({r.repository}) | " +
            " | ".join(str(fn(r)) for _, fn in cols) + " |" for r in records]
    return "\n".join([head, sep, *rows])

def aeo_faq(niche: str, records: list[ProjectRecord]) -> str:
    verified = [r for r in records if r.verification.status == VERIFIED]
    q = []
    q.append(f"**What is {niche}?**\n\nThis catalog covers {niche}.")
    q.append(f"**Which open-source implementations exist?**\n\n"
             f"From the verified catalog ({len(verified)} projects), see `data/projects.json`.")
    q.append("**Is inclusion here a security endorsement?**\n\n"
             "No. Review each project's own SECURITY.md and release history.")
    return "\n\n".join(q)

def render_readme(niche: str, repo_name: str, records: list[ProjectRecord], pair: str) -> str:
    verified = sum(1 for r in records if r.verification.status == VERIFIED)
    parts = [
        f"# Awesome {niche}",
        f"Evidence-first catalog. Entries link to canonical repos; verification states recorded.",
        f"**Verified: {verified} / {len(records)} catalogued.**",
        "## Projects",
        comparison_matrix(records) if records else "_No projects._",
        "## FAQ",
        aeo_faq(niche, records),
        "## Data",
        "- `data/projects.json` — machine-readable source.",
        f"- Paired cookbook: **{pair}**",
    ]
    return "\n\n".join(parts)

def render_llms(niche, repo_name, pair, records) -> str:
    verified = sum(1 for r in records if r.verification.status == VERIFIED)
    return (f"Repo: {repo_name} | Owner: CodesbyFebin | Scope: {niche}\n"
            f"Database: data/projects.json | Verified: {verified}/{len(records)}\n"
            f"Paired: {pair}\n")
