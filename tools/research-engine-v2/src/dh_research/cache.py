from __future__ import annotations
import json, sqlite3, hashlib, os, time
from pathlib import Path
from .transport import Response

class HttpCache:
    def __init__(self, cache_dir: str):
        Path(cache_dir).mkdir(parents=True, exist_ok=True)
        self.db = sqlite3.connect(os.path.join(cache_dir, "http.db"))
        self.db.execute("""CREATE TABLE IF NOT EXISTS cache(
            key TEXT PRIMARY KEY, url TEXT, status INT, body BLOB,
            etag TEXT, last_modified TEXT, headers TEXT, fetched_at REAL)""")
        self.db.commit()

    @staticmethod
    def _key(url: str, accept: str) -> str:
        return hashlib.sha256(f"{url}|{accept}".encode()).hexdigest()

    def get(self, url: str, accept: str):
        row = self.db.execute("SELECT status,body,etag,last_modified,headers FROM cache WHERE key=?",
                              (self._key(url, accept),)).fetchone()
        if not row: return None
        st, body, etag, lm, hdrs = row
        return Response(st, json.loads(hdrs or "{}"), body,
                        from_cache=True), etag, lm

    def put(self, url, accept, resp: Response):
        self.db.execute("INSERT OR REPLACE INTO cache VALUES(?,?,?,?,?,?,?,?)",
                        (self._key(url, accept), url, resp.status, resp.body,
                         resp.headers.get("etag"), resp.headers.get("last-modified"),
                         json.dumps({k.lower(): v for k, v in resp.headers.items()}), time.time()))
        self.db.commit()

    def revalidate(self, url, accept, etag, lm):
        h = {}
        if etag: h["If-None-Match"] = etag
        elif lm: h["If-Modified-Since"] = lm
        return h
