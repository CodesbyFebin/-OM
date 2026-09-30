from __future__ import annotations
from .github_client import GitHubClient
from .models import Candidate
from .errors import TransportUnavailable, RateLimited

def build_queries(niche: str, synonyms: list[str]) -> list[str]:
    qs = []
    for term in [niche, *synonyms]:
        t = term.strip().lower()
        if not t: continue
        qs.append(f"{t} in:name,description,topics")
        qs.append(f"topic:{t.replace(' ', '-')}")
    seen, out = set(), []
    for q in qs:
        if q not in seen: seen.add(q); out.append(q)
    return out

def discover(client: GitHubClient, niche: str, synonyms: list[str],
             max_candidates: int = 200) -> list[Candidate]:
    by_full: dict[str, Candidate] = {}
    for q in build_queries(niche, synonyms):
        page = 1
        while len(by_full) < max_candidates:
            try:
                r = client.search_repos(q, page=page)
            except (TransportUnavailable, RateLimited):
                return list(by_full.values())
            if r.status != 200: break
            items = r.json().get("items", [])
            for it in items:
                fn = it["full_name"]
                if fn not in by_full:
                    by_full[fn] = Candidate(
                        full_name=fn, html_url=it["html_url"],
                        description=it.get("description") or "",
                        topics=it.get("topics") or [],
                        language=it.get("language"),
                        license_spdx=(it.get("license") or {}).get("spdx_id"),
                        stars=it.get("stargazers_count"),
                        archived=it.get("archived"),
                        homepage=it.get("homepage"))
            if len(items) < 100: break
            page += 1
    return list(by_full.values())
