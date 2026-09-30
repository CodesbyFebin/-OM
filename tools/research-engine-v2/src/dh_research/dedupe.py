from urllib.parse import urlparse

def canonical_url(url: str) -> str:
    if not url: return ""
    p = urlparse(url)
    host = (p.netloc or "").lower().removeprefix("www.")
    path = p.path.rstrip("/").removesuffix(".git")
    return f"https://{host}{path}" if host else url.lower()

def dedupe(cands):
    seen: dict[str, object] = {}
    dupes = 0
    for c in cands:
        key = canonical_url(c.html_url)
        if key in seen:
            dupes += 1
            prev = seen[key]
            prev.topics = sorted(set(prev.topics) | set(c.topics))
            prev.evidence.extend(c.evidence)
            if len(c.readme_raw) > len(prev.readme_raw): prev.readme_raw = c.readme_raw
        else:
            seen[key] = c
    return list(seen.values()), dupes
