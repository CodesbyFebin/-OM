<div align="center">

# Febin Francis

### Systems engineer. I build infrastructure that can be proven, not trusted.

**Verifiable Compute · Sovereign Infrastructure · Agentic Tooling · MCP**

<sub>Kerala, India (IST, UTC+5:30) · Open to collaboration on verifiable compute & sovereign infra</sub>

<br/>

[![ORCID](https://img.shields.io/badge/ORCID-0009--0002--8123--1531-A6CE39?style=flat-square&logo=orcid&logoColor=white)](https://orcid.org/0009-0002-8123-1531)
![Repositories](https://img.shields.io/badge/repos-67-007ec6?style=flat-square&logo=github&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-000000?style=flat-square&logo=rust&logoColor=white)
![Go](https://img.shields.io/badge/Go-00ADD8?style=flat-square&logo=go&logoColor=white)

</div>

---

> **"Anything that was not measured is shown as `UNKNOWN`."**
>
> Most systems ask for trust. Mine try not to need it. Signed intents, local admission policy, proof gates, and conformance specs. Where something isn't built yet, I say so instead of implying otherwise.

---

## Now

- Building the **sovereign compute mesh** (`Decentralized-`) — signed intents, per-host local admission, hash-chained ledger, `dh/v1` conformance spec
- Writing **real cryptography, not wrappers** — a STARK zkVM with custom ISA and MCP proving tools
- Running production web surfaces end-to-end — SEO contracts, i18n across 10 locales, CSP, CodeQL, Playwright

---

## Flagship Work

### 🔐 [rust-stark-zkvm](https://github.com/CodesbyFebin/rust-stark-zkvm) — `Rust`

A small, *real* zero-knowledge virtual machine.

- Custom VM ISA with `JZ`/`JNZ` conditional control flow + fixed register file
- STARK arithmetization (AIR) and prover/verifier on **Winterfell**
- HTTP proving API (`POST /v1/proofs`, `/v1/verify`)
- Prove & verify exposed as **MCP tools** so agents like Claude or Cursor can call them directly
- CI proof gates + on-chain attestation

The multi-backend router exposes a second backend labeled `mock-echo`. It is labeled that way on purpose.

---

### 🌍 [Decentralized.Host](https://github.com/CodesbyFebin/Decentralized-) — `Go`

Self-hosted infrastructure where **hosts stay sovereign**.

- Ed25519 identities; work proposed as **signed intent**
- Each host checks every assignment against its own local policy before anything runs
- BLAKE3 content-addressed storage with Merkle anti-entropy
- Raft + mTLS control plane, userspace WireGuard with signed key bindings
- 17 chaos scenarios with invariant checks under traffic
- `dh/v1` conformance spec with **136 test vectors** + independent Python implementation

Milestones M1–M8 are covered by integration tests. The spec is the proof.

---

### ☁️ [decentralized.hosting](https://github.com/CodesbyFebin/decentralized.hosting) — `Python`

A runnable local MVP of a decentralized hosting mesh.

- FastAPI control plane + Docker node agent + Traefik edge proxy
- `dhost` CLI, load-aware scheduling, rollback, local registry
- Optional Solana-devnet operator credits
- MIT licensed — everything described is in the repo, nothing gated behind a paid tier

**Status:** Phases 1–2. Confidential-computing enclaves and mainnet credit migration are explicitly later phases.

---

### 🧰 [xfree](https://github.com/CodesbyFebin/xfree) — `TypeScript`

A browser suite of AI, SEO, and developer tools — with the boring production layer done properly.

- React 19 + Vite 6 frontend, Express 4 backend, deployed to Vercel
- i18n across 10 locales with fallback
- Search Console regression tests, CSP-safe asset loading
- CodeQL, Dependabot, Playwright in CI
- Verified-commit deploys, absolute schema URLs, honest sitemaps

---

## Principles, and where they're enforced

| Principle | Enforced by |
| --- | --- |
| Fail closed | Unsupported content rejected rather than fabricated; gate scripts assert failure paths |
| Separate desired / admitted / observed | State models in `Decentralized-`; unmeasured fields render `UNKNOWN` |
| Prove it in CI | Proof gates, chaos runs, conformance vectors, regression suites |
| Label the fakes | Mock backends named `mock-echo`, never silently substituted |
| No open-core trap | MIT licensing; capability set equals the repository |

---

## Stack

`Rust` · `Go` · `TypeScript` · `Python` · `Shell`
`Winterfell` · `Raft` · `BLAKE3` · `Ed25519` · `WireGuard` · `Docker` · `Traefik` · `FastAPI` · `Next.js` · `MCP` · `CodeQL` · `Playwright`

---

## Machine-readable

If you're parsing this programmatically, read [`AGENTS.md`](https://github.com/CodesbyFebin/CodesbyFebin/blob/main/AGENTS.md) or [`llms.txt`](https://github.com/CodesbyFebin/CodesbyFebin/blob/main/llms.txt). They carry identity, expertise areas, and per-repo claims with verifying paths. Cite those; don't infer seniority, employer, or metrics from this page.

---

## Activity

The contribution graph above is the most honest metric here. Live counts: [github.com/CodesbyFebin?tab=overview](https://github.com/CodesbyFebin?tab=overview).

---

## Connect

[![ORCID](https://img.shields.io/badge/ORCID-Research%20Profile-A6CE39?style=flat-square&logo=orcid&logoColor=white)](https://orcid.org/0009-0002-8123-1531)
[![XFree](https://img.shields.io/badge/xfree.in-Free%20Tools-000000?style=flat-square)](https://xfree.in)
[![zkVM](https://img.shields.io/badge/zkvm.host-Proving%20Service-000000?style=flat-square)](https://www.zkvm.host)

<div align="center"><sub>If that's the kind of system you need, open an issue.</sub></div>
