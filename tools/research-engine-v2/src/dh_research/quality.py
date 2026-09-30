from __future__ import annotations
import os
from .models import ProjectRecord, VERIFIED, UNKNOWN, SIMULATED

RUBRIC = {
    "real_data_integrity": 20, "evidence_provenance": 15, "technical_depth": 15,
    "user_documentation": 10, "project_usefulness": 10, "search_intent": 8,
    "aeo_answerability": 7, "geo_entity_clarity": 5, "machine_readability": 5,
    "internal_graph": 3, "maintenance_automation": 2,
}

def evaluate(repo_dir: str, records: list[ProjectRecord], target: int,
             related_count: int) -> dict:
    P = lambda name: os.path.exists(os.path.join(repo_dir, name))
    verified = [r for r in records if r.verification.status == VERIFIED]
    scored = {k: 0 for k in RUBRIC}
    violations = []

    bad = [r.name for r in verified if not r.verification.evidence or not r.verification.checked_at]
    if bad:
        violations.append(f"{len(bad)} VERIFIED records lack evidence/checked_at")
        scored["real_data_integrity"] = 0
    else:
        scored["real_data_integrity"] = RUBRIC["real_data_integrity"] if verified else 0

    ev_cov = sum(1 for r in verified if r.verification.evidence) / max(len(verified), 1)
    scored["evidence_provenance"] = round(RUBRIC["evidence_provenance"] * ev_cov)
    depth = sum(1 for r in verified if r.primary_language and r.documentation) / max(len(verified), 1)
    scored["technical_depth"] = round(RUBRIC["technical_depth"] * depth)
    scored["user_documentation"] = RUBRIC["user_documentation"] if (P("GETTING_STARTED.md") and os.path.isdir(os.path.join(repo_dir,"guides"))) else 0
    scored["project_usefulness"] = RUBRIC["project_usefulness"] if len(verified) >= min(target, 10) else round(RUBRIC["project_usefulness"]*len(verified)/max(target,1))
    scored["search_intent"] = RUBRIC["search_intent"] if P("README.md") else 0
    scored["aeo_answerability"] = RUBRIC["aeo_answerability"] if P("guides/faq.md") else 0
    scored["geo_entity_clarity"] = RUBRIC["geo_entity_clarity"] if P("data/entities.json") else 0
    scored["machine_readability"] = RUBRIC["machine_readability"] if (P("data/projects.json") and P("llms.txt")) else 0
    scored["internal_graph"] = RUBRIC["internal_graph"] if 3 <= related_count <= 8 else (1 if related_count else 0)
    scored["maintenance_automation"] = RUBRIC["maintenance_automation"] if P(".github/workflows/freshness.yml") else 0

    total = sum(scored.values())
    qualified = len(verified)
    status = "COMPLETE" if (total >= 85 and qualified > 0 and not violations) else "NEEDS_WORK"
    return {"score": total, "breakdown": scored, "qualified_projects": qualified,
            "target_projects": target, "unfilled_slots": max(0, target - qualified),
            "integrity_violations": violations, "status": status,
            "note": "Internal rubric only; NOT a search-ranking guarantee."}
