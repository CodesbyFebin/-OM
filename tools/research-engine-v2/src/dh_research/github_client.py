from __future__ import annotations
import json, time, random
from .config import Config
from .cache import HttpCache
from .transport import Response
from .errors import RateLimited, AuthError, TransportUnavailable

class GitHubClient:
    def __init__(self, cfg: Config, transport=None):
        self.cfg = cfg
        self.transport = transport or __import__("dh_research.transport", fromlist=["RealTransport"]).RealTransport(cfg.timeout)
        self.cache = HttpCache(cfg.cache_dir)
        self._last = {"core": 0.0, "search": 0.0}
        self._remaining = {"core": None, "search": None}
        self._reset = {"core": 0.0, "search": 0.0}

    def _base_headers(self, accept: str) -> dict:
        h = {"Accept": accept, "User-Agent": self.cfg.user_agent,
             "X-GitHub-Api-Version": "2022-11-28"}
        if self.cfg.token:
            h["Authorization"] = f"Bearer {self.cfg.token}"
        return h

    def _throttle(self, resource: str):
        min_int = self.cfg.search_min_interval if resource == "search" else self.cfg.core_min_interval
        now = time.monotonic()
        gap = (now - self._last[resource])
        if gap < min_int: time.sleep(min_int - gap)
        rem = self._remaining.get(resource)
        if rem is not None and rem <= 1 and self._reset[resource] > time.time():
            time.sleep(self._reset[resource] - time.time() + 1)

    def _update_rate(self, resp: Response):
        h = {k.lower(): v for k, v in resp.headers.items()}
        res = h.get("x-ratelimit-resource", "core")
        try:
            self._remaining[res] = int(h["x-ratelimit-remaining"])
            self._reset[res] = float(h.get("x-ratelimit-reset", 0))
        except (KeyError, ValueError):
            pass

    def request(self, path: str, *, resource: str = "core",
                accept: str = "application/vnd.github+json", params: dict | None = None) -> Response:
        if self.cfg.offline:
            raise TransportUnavailable("offline mode")
        url = self.cfg.api_base + path
        if params:
            from urllib.parse import urlencode
            url = f"{url}?{urlencode(params)}"
        cached, etag, lm = (self.cache.get(url, accept) or (None, None, None))
        headers = self._base_headers(accept)
        if etag or lm:
            headers.update(self.cache.revalidate(url, accept, etag, lm))

        attempt = 0
        while True:
            self._throttle(resource)
            try:
                resp = self.transport(url, headers)
            except TransportUnavailable:
                if cached:
                    return cached
                raise
            self._update_rate(resp)
            self._last[resource] = time.monotonic()

            if resp.status == 304 and cached:
                return cached
            if resp.status == 401:
                raise AuthError("token invalid/expired")
            if resp.status in (403, 429):
                ra = resp.headers.get("Retry-After") or resp.headers.get("retry-after")
                body = resp.body.decode("utf-8", "ignore").lower()
                is_rate = bool(ra) or "rate limit" in body
                if is_rate and attempt < self.cfg.max_retries:
                    wait = float(ra) if ra else min(60, (2 ** attempt) + random.random())
                    time.sleep(wait); attempt += 1; continue
                if is_rate:
                    raise RateLimited(float(ra) if ra else 30)
                self.cache.put(url, accept, resp); return resp
            if resp.status >= 500 and attempt < self.cfg.max_retries:
                time.sleep((2 ** attempt) + random.random()); attempt += 1; continue
            if 200 <= resp.status < 300:
                self.cache.put(url, accept, resp)
            return resp

    def search_repos(self, q: str, *, sort: str = "stars", order: str = "desc",
                     per_page: int = 100, page: int = 1) -> Response:
        return self.request("/search/repositories", resource="search",
                            params={"q": q, "sort": sort, "order": order,
                                    "per_page": per_page, "page": page})
    def repo(self, full_name: str) -> Response:
        return self.request(f"/repos/{full_name}")
    def readme(self, full_name: str) -> Response:
        return self.request(f"/repos/{full_name}/readme",
                            accept="application/vnd.github.raw+json")
    def release_latest(self, full_name: str) -> Response:
        return self.request(f"/repos/{full_name}/releases/latest")
