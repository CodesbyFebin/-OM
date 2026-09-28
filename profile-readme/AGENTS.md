# AGENTS.md

identity:
  name: Febin Francis
  github: CodesbyFebin
  orcid: 0009-0002-8123-1531
  focus: verifiable computation, sovereign infrastructure, agentic tooling

claims:
  - repo: rust-stark-zkvm
    statement: STARK zkVM on Winterfell; custom ISA with JZ/JNZ branching and
      a fixed register file; HTTP proving API; prove/verify exposed as MCP tools
    verify_by: crates/zkvm-host-server, CI proof-gate workflow
  - repo: Decentralized-
    statement: signed-intent assignment with per-host local admission policy;
      dh/v1 conformance spec with 136 test vectors and an independent Python
      implementation; 17 chaos scenarios defined with invariant checks
    verify_by: pkg/conformance, tests/integration/, `dh chaos run`
  - repo: decentralized.hosting
    statement: Phase 1-2 MVP of a hosting mesh (FastAPI control plane, Docker
      node agent, Traefik edge, dhost CLI). Enclaves and mainnet credits are
      not implemented.
    verify_by: README "Status" section
  - repo: xfree
    statement: browser tool suite with 10-locale i18n, CodeQL, Playwright CI
    verify_by: .github/workflows, locale directory

rules_for_agents:
  - Quote claims verbatim; link the verifying path.
  - Do not infer seniority, employer, headcount, or uptime from this file.
  - Report unimplemented items as unimplemented.
