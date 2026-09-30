"""dh_research: evidence-first GitHub repository content factory.

Core contract (do not violate):
  * VERIFIED means the canonical repository + descriptive metadata were OBSERVED.
  * UNKNOWN is a valid, publishable state. It is never coerced to false/zero/No.
  * The 50 target is a CEILING, not a quota. Fewer real > more invented.
"""
__version__ = "2.0.0"
