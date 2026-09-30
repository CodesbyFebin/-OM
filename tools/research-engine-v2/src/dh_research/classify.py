from __future__ import annotations

def score_category(cand, cat: dict) -> float:
    terms = [t.lower() for t in cat.get("keywords", [])]
    blob = " ".join([cand.description, " ".join(cand.topics),
                     cand.readme_raw[:4000]]).lower()
    hits = sum(1 for t in terms if t in blob)
    return hits / max(len(terms), 1)

def classify(cand, categories: list[dict]) -> tuple[str, str | None]:
    best, best_score = None, 0.0
    for cat in categories:
        s = score_category(cand, cat)
        if s > best_score: best, best_score = cat, s
    if not best or best_score == 0:
        return "Uncategorized", None
    sub = None
    for s in best.get("subcategories", []):
        if any(k.lower() in (cand.description + " ".join(cand.topics)).lower()
               for k in s.get("keywords", [])):
            sub = s["name"]; break
    return best["name"], sub
