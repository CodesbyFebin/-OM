from __future__ import annotations
from dataclasses import dataclass, field
from urllib import request, error
from .errors import TransportUnavailable

@dataclass
class Response:
    status: int
    headers: dict = field(default_factory=dict)
    body: bytes = b""
    from_cache: bool = False
    def json(self):
        import json
        return json.loads(self.body.decode("utf-8"))

class RealTransport:
    def __init__(self, timeout: int = 20): self.timeout = timeout

    def __call__(self, url: str, headers: dict) -> Response:
        req = request.Request(url, headers=headers, method="GET")
        try:
            with request.urlopen(req, timeout=self.timeout) as r:
                return Response(r.status, dict(r.headers), r.read())
        except error.HTTPError as e:
            return Response(e.code, dict(e.headers or {}), e.read() or b"")
        except error.URLError as e:
            raise TransportUnavailable(f"network unreachable: {e.reason}")
        except Exception as e:
            raise TransportUnavailable(f"transport error: {e}")

class FixtureTransport:
    def __init__(self, routes: dict[str, tuple[int, dict, bytes]]): self.routes = routes
    def __call__(self, url: str, headers: dict) -> Response:
        status, hdrs, body = self.routes.get(url, (404, {}, b'{"message":"Not Found"}'))
        return Response(status, hdrs, body)
