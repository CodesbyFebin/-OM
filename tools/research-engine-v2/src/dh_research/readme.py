import re
HEAD = re.compile(r"^(#{1,6})\s+(.*)$", re.M)
LINK = re.compile(r"\[([^\]]+)\]\((https?://[^)\s]+)\)")

def headings(md: str) -> list[str]:
    return [m.group(2).strip() for m in HEAD.finditer(md)]

def external_links(md: str) -> list[str]:
    return sorted({u for _, u in LINK.findall(md) if "github.com" not in u})

def looks_like_docs_link(url: str) -> bool:
    return any(k in url.lower() for k in ("docs.", "documentation", "/docs", "readthedocs", "gitbook"))

def capability_signals(md: str, topics: list[str]) -> dict:
    blob = (md + " " + " ".join(topics)).lower()
    def sig(words): return any(w in blob for w in words)
    return {
        "docker": sig(["docker", "dockerfile", "compose"]),
        "kubernetes": sig(["kubernetes", "helm", "k8s"]),
        "cli": sig(["cli", "command line"]),
        "api": sig(["rest api", "grpc", "http api", "/v1/"]),
        "mcp": sig(["model context protocol", "mcp server", "mcp client"]),
        "self_hosted": sig(["self-host", "self host", "selfhosted", "docker compose up"]),
    }
