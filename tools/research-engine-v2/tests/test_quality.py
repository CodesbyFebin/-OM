import unittest
from dh_research.models import ProjectRecord, Verification, Evidence
from dh_research import quality

class QualityGate(unittest.TestCase):
    def test_verified_without_evidence_is_violation(self):
        """VERIFIED without evidence → integrity violation"""
        r = ProjectRecord(name="x", canonical_url="u", repository="u", description="d",
                          category="c", verification=Verification(status="VERIFIED",
                                                                   checked_at=None,
                                                                   evidence=[]))
        rep = quality.evaluate("/nonexistent", [r], 50, 0)
        self.assertTrue(rep["integrity_violations"])
        self.assertEqual(rep["status"], "NEEDS_WORK")

    def test_empty_is_needs_work(self):
        """No verified projects → NEEDS_WORK"""
        rep = quality.evaluate("/nonexistent", [], 50, 0)
        self.assertEqual(rep["status"], "NEEDS_WORK")
        self.assertEqual(rep["qualified_projects"], 0)

if __name__ == "__main__":
    unittest.main()
