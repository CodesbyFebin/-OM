from __future__ import annotations
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from typing import Optional

# Verification states
VERIFIED = "VERIFIED"; PARTIAL = "PARTIAL"; UNKNOWN = "UNKNOWN"
STALE = "STALE"; REMOVED = "REMOVED"; SIMULATED = "SIMULATED"
ALL_STATES = {VERIFIED, PARTIAL, UNKNOWN, STALE, REMOVED, SIMULATED}
QUALIFYING = {VERIFIED}

def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

@dataclass
class Evidence:
    type: str
    url: str
    note: str = ""

@dataclass
class Verification:
    status: str = UNKNOWN
    checked_at: Optional[str] = None
    evidence: list[Evidence] = field(default_factory=list)
    notes: list[str] = field(default_factory=list)

@dataclass
class ProjectRecord:
    name: str
    canonical_url: str
    repository: str
    description: str
    category: str
    subcategory: Optional[str] = None
    homepage: Optional[str] = None
    documentation: Optional[str] = None
    primary_language: Optional[str] = None
    license: Optional[str] = None
    topics: list[str] = field(default_factory=list)
    stars_observed: Optional[int] = None
    archived: Optional[bool] = None
    self_hosted: Optional[bool] = None
    open_source: Optional[bool] = None
    docker: Optional[bool] = None
    kubernetes: Optional[bool] = None
    mcp: Optional[bool] = None
    api: Optional[bool] = None
    cli: Optional[bool] = None
    sdk: Optional[bool] = None
    niche_note: Optional[str] = None
    verification: Verification = field(default_factory=Verification)

    def to_dict(self) -> dict:
        d = asdict(self)
        d["verification"]["evidence"] = [asdict(e) for e in self.verification.evidence]
        return d

    @staticmethod
    def from_dict(d: dict) -> "ProjectRecord":
        v = d.get("verification", {})
        ev = [Evidence(**e) for e in v.get("evidence", [])]
        ver = Verification(status=v.get("status", UNKNOWN),
                           checked_at=v.get("checked_at"),
                           evidence=ev, notes=v.get("notes", []))
        d = {k: v2 for k, v2 in d.items() if k != "verification"}
        d["verification"] = ver
        return ProjectRecord(**d)

@dataclass
class Candidate:
    full_name: str
    html_url: str
    description: str = ""
    topics: list[str] = field(default_factory=list)
    language: Optional[str] = None
    license_spdx: Optional[str] = None
    stars: Optional[int] = None
    archived: Optional[bool] = None
    homepage: Optional[str] = None
    readme_raw: str = ""
    evidence: list[Evidence] = field(default_factory=list)
    relevance: float = 0.0
