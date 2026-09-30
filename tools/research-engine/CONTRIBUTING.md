# Contributing to the Research Engine

This document guides contributors to the CodesbyFebin Portfolio Research Engine.

## Philosophy

We are building an evidence-first curation pipeline, not a keyword scraper. Every project must be:

1. **Real** — Existing GitHub repository with canonical URL
2. **Verified** — Metadata observed via GitHub API
3. **Relevant** — Matches the niche focus through name, description, or topics
4. **Attributed** — Sources documented; verification date recorded

We accept **37 verified projects over 50 fabricated ones.** UNKNOWN is better than INVENTED.

---

## Project Inclusion Criteria

### Automatic (Engine-Driven)

Projects are discovered and ranked by:

1. **Canonical URL** — Real, accessible GitHub repository
2. **Duplication Check** — No duplicate URLs across candidates
3. **Fork Detection** — Exclude unless canonical for its niche
4. **Relevance Score** — Niche terms found in name/description/topics (≥1 point required)
5. **Final Rank** — Sort by (relevance, not archived, stars), take top N

### Manual (Human Review)

Before publishing any Awesome repository, a human curator must:

1. **Spot-check URLs** — Open 10 random projects; confirm they exist
2. **Read Descriptions** — Ensure accuracy vs. observed README
3. **Verify Licenses** — Cross-check SPDX identifier
4. **Test Links** — Spot-check 5+ README links
5. **Review Rejections** — Understand rejection reasons

---

## Quality Rubric (100 points)

| Dimension | Points | Gate |
|-----------|--------|------|
| Real-Data Integrity | 20 | ≥18 required |
| Evidence & Provenance | 15 | ≥13 required |
| Technical Depth | 15 | ≥12 required |
| Documentation | 10 | ≥8 required |
| Usefulness | 10 | ≥8 required |
| Search Intent Coverage | 8 | ≥6 required |
| AEO Answerability | 7 | ≥5 required |
| GEO/Entity Clarity | 5 | ≥4 required |
| Machine Readability | 5 | ≥5 required |
| Internal Links | 3 | ≥2 required |
| Maintenance | 2 | ≥1 required |
| **TOTAL** | **100** | **≥85 required** |

**Publishing gate:** Awesome repository must score ≥85/100 before deployment.

---

## Verification States

| State | Meaning | Action |
|-------|---------|--------|
| **VERIFIED** ✓ | Observed via GitHub API | Publish as-is |
| **PARTIAL** ⚠ | Metadata incomplete | Publish with caveat |
| **STALE** 📦 | Archived or >90 days old | Include with date label |
| **UNKNOWN** ❓ | Evidence insufficient | Exclude; document rejection |
| **REJECTED** ❌ | Duplicate, fork, or low relevance | List in rejected.json |

---

## Forbidden Edits

- ❌ Delete verified projects without evidence
- ❌ Fabricate descriptions
- ❌ Inflate relevance scores
- ❌ Remove rejection tracking
- ❌ Modify verification states without evidence

---

## Testing & Performance

Contributions should include:

- Before/after timing for 50-project run
- Cache hit rate comparison
- API call reduction measurement
- Test cases with expected output

---

## Issues & PRs

- Report bugs with reproducible steps
- Suggest features with use cases
- Document performance improvements with metrics

---

## License

All contributions under MIT License.
