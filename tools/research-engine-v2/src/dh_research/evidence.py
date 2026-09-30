from __future__ import annotations
def docs_url(cand) -> str | None:
    for e in cand.evidence:
        if e.type == "documentation": return e.url
    return None
def has_observed_repo(cand) -> bool:
    return any(e.type == "repository" and not e.note.startswith("404")
               and not e.note.startswith("unavailable") for e in cand.evidence)
