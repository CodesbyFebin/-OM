import unittest
from dh_research.models import VERIFIED, UNKNOWN, SIMULATED, Candidate, Evidence
from dh_research import verify, dedupe

class SelfTest(unittest.TestCase):
    def test_offline_candidate_is_unknown_not_zero(self):
        """Offline + no evidence → UNKNOWN, not False/0/No"""
        c = Candidate(full_name="org/repo", html_url="https://github.com/org/repo",
                      description="x"*30, topics=["mcp"])
        c.evidence.append(Evidence("repository", "https://github.com/org/repo",
                                   "unavailable:TransportUnavailable"))
        rec = verify.to_record(c, "MCP", None, "MCP")
        self.assertEqual(rec.verification.status, UNKNOWN)

    def test_observed_repo_with_readme_is_verified(self):
        """Repo + README observed → VERIFIED"""
        c = Candidate(full_name="org/repo", html_url="https://github.com/org/repo",
                      description="A real tool", topics=["mcp"],
                      readme_raw="# Docs\nDocker compose up")
        c.evidence.append(Evidence("repository", "https://github.com/org/repo"))
        c.evidence.append(Evidence("readme", "https://github.com/org/repo/blob/HEAD/README.md"))
        rec = verify.to_record(c, "MCP", None, "MCP")
        self.assertEqual(rec.verification.status, VERIFIED)
        self.assertTrue(rec.verification.evidence)
        self.assertTrue(rec.verification.checked_at)

    def test_fixture_is_simulated_not_verified(self):
        """Fixture data stamped SIMULATED, never VERIFIED"""
        c = Candidate(full_name="org/repo", html_url="https://github.com/org/repo",
                      description="Fixture", readme_raw="Fixture code")
        c.evidence.append(Evidence("fixture", "N/A"))
        rec = verify.to_record(c, "Test", None, "Test", from_fixture=True)
        self.assertEqual(rec.verification.status, SIMULATED)
        self.assertIn("Fixture", rec.verification.notes[0])

    def test_canonical_url_normalization(self):
        """URLs normalized for dedup"""
        urls = [
            ("https://github.com/Org/Repo.git/", "https://github.com/org/repo"),
            ("https://www.github.com/org/repo", "https://github.com/org/repo"),
            ("http://github.com/org/repo/", "https://github.com/org/repo"),
        ]
        for input_url, expected in urls:
            self.assertEqual(dedupe.canonical_url(input_url), expected)

if __name__ == "__main__":
    unittest.main()
