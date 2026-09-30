from __future__ import annotations
from .models import (ProjectRecord, Verification, Evidence, Candidate,
                     VERIFIED, PARTIAL, UNKNOWN, REMOVED, SIMULATED, now_iso)
from . import evidence as E, readme as R, dedupe as D

def to_record(cand: Candidate, category: str, subcategory, niche: str,
              *, from_fixture: bool = False) -> ProjectRecord:
    ver = Verification(checked_at=now_iso(), evidence=list(cand.evidence))
    archived = cand.archived

    if from_fixture:
        ver.status = SIMULATED
        ver.notes.append("Fixture data — excluded from qualified/50 count.")
    elif archived:
        ver.status = REMOVED
        ver.notes.append("Repository archived.")
    elif not E.has_observed_repo(cand):
        ver.status = UNKNOWN
        ver.notes.append("Canonical repository could not be observed.")
    elif not cand.readme_raw:
        ver.status = PARTIAL
        ver.notes.append("Repository observed; README/docs not retrieved.")
    else:
        ver.status = VERIFIED
        ver.notes.append("VERIFIED = canonical repo + metadata observed. NOT an endorsement.")

    caps = R.capability_signals(cand.readme_raw, cand.topics)
    rec = ProjectRecord(
        name=cand.full_name.split("/")[-1],
        canonical_url=D.canonical_url(cand.html_url),
        repository=cand.html_url,
        description=(cand.description or "").strip() or "No description provided.",
        category=category, subcategory=subcategory,
        homepage=cand.homepage, documentation=E.docs_url(cand),
        primary_language=cand.language, license=cand.license_spdx,
        topics=cand.topics, stars_observed=cand.stars, archived=archived,
        self_hosted=caps["self_hosted"], open_source=True if cand.license_spdx else None,
        docker=caps["docker"], kubernetes=caps["kubernetes"],
        mcp=caps["mcp"], api=caps["api"], cli=caps["cli"],
        niche_note=f"Included under {niche}.",
        verification=ver,
    )
    return rec
