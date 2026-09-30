from __future__ import annotations
from .github_client import GitHubClient
from .models import Candidate, Evidence
from .errors import TransportUnavailable, RateLimited, AuthError
from . import readme as R

def enrich(client: GitHubClient, c: Candidate) -> Candidate:
    try:
        r = client.repo(c.full_name)
        if r.status == 200:
            d = r.json()
            c.description = d.get("description") or c.description
            c.topics = d.get("topics") or c.topics
            c.language = d.get("language") or c.language
            c.license_spdx = (d.get("license") or {}).get("spdx_id") or c.license_spdx
            c.stars = d.get("stargazers_count", c.stars)
            c.archived = d.get("archived", c.archived)
            c.homepage = d.get("homepage") or c.homepage
            c.evidence.append(Evidence("repository", d["html_url"]))
        elif r.status == 404:
            c.evidence.append(Evidence("repository", c.html_url, "404"))
    except (TransportUnavailable, RateLimited, AuthError) as e:
        c.evidence.append(Evidence("repository", c.html_url, f"unavailable:{type(e).__name__}"))

    try:
        rr = client.readme(c.full_name)
        if rr.status == 200:
            c.readme_raw = rr.body.decode("utf-8", "ignore")
            c.evidence.append(Evidence("readme", f"{c.html_url}/blob/HEAD/README.md"))
            for url in R.external_links(c.readme_raw):
                if R.looks_like_docs_link(url):
                    c.evidence.append(Evidence("documentation", url)); break
    except (TransportUnavailable, RateLimited, AuthError):
        pass

    try:
        rel = client.release_latest(c.full_name)
        if rel.status == 200:
            c.evidence.append(Evidence("release", rel.json().get("html_url", c.html_url)))
    except (TransportUnavailable, RateLimited, AuthError):
        pass
    return c
