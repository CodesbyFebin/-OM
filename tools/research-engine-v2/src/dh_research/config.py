from __future__ import annotations
import os
from dataclasses import dataclass, field

@dataclass
class Config:
    token: str | None = field(default_factory=lambda: os.environ.get("GITHUB_TOKEN"))
    api_base: str = "https://api.github.com"
    user_agent: str = "dh-research-engine/2.0 (+https://github.com/CodesbyFebin)"
    offline: bool = False
    allow_fixtures: bool = False
    cache_dir: str = ".dh-cache"
    fresh_max_age: int = 60 * 60 * 24 * 30          # 30d -> STALE beyond this
    search_min_interval: float = 2.1
    core_min_interval: float = 0.05
    max_retries: int = 4
    timeout: int = 20
