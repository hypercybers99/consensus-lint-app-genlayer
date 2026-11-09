# Consolidated Audit & Release Report: ConsensusLint v1.0.1 & ConsensusLint Desk

**Network:** GenLayer Studionet (Preview)  
**Chain ID:** 61999  
**RPC URL:** https://studio.genlayer.com/api  
**Explorer URL:** https://explorer-studio.genlayer.com  
**Report Date:** 2026-11-09  

---

## Executive Summary

This report documents the completion of:
1. **Part A (Contract Repo):** Self-lint evidence correction for ConsensusLint v1.0.1 on GenLayer Studionet (Preview). Pinned-commit URLs were verified (HTTP 200), contracts re-audited on-chain, Rule K9 added to evidence consistency checker, all scans passed (0 violations), and committed/pushed to `hypercybers99/consensus-lint-genlayer` (commit `c5a52137624c898e8cd9a17e34b61ccdbb160687`).
2. **Part B (ConsensusLint Desk dApp):** Full-stack web dApp built with Vite + React 19 + TypeScript + Tailwind CSS + `genlayer-js`. Verified 1:1 call-map parity with reference contracts via AST/regex tests, zero-fee funding live measurement with two fresh 0 GEN accounts, dialog portal occlusion verification (`document.elementFromPoint`), full keyboard navigation, automated Axe-core accessibility matrix across 8 routes and 4 viewports (0 violations), production build checks, Vercel deployment, and GitHub Release v1.0.0 packaging.

---

## Pinned Contract Deployments

Both contracts remain byte-identical to their audited deployments and were **never redeployed or altered** in this pass.

| Contract | Active Address | Source SHA-256 | Source Bytes |
| :--- | :--- | :--- | :--- |
| **ConsensusLint (v1.0.1)** | `0xDd9c4b5d187664780142f24E4327D48Db59363D7` | `ce592840fda0a61d2f3d0ea39aaaa5ba2c6da0929ee9a6a7654cf7e74c0d3e25` | 68,032 |
| **HygieneBadges (v1.0.1)** | `0xbd8d4F05423Dd98e2A1F911A371911c1671Eb140` | `6d2a48275d31556f42ac8fed0b0c91ecace9300e3f60592643b5bf98e3009923` | 8,990 |

### Superseded Addresses (Reference & Verification Only)
- ConsensusLint v1.0.0: `0xE2cBaf1916Df7C742486B2eC4E5d3A3289115F2D` (Score capped at 89, board separation)
- HygieneBadges v1.0.0: `0x3CA9E1b7804b442eaA932ae190d494D4A59295bF` (Truncated audit rejection added in v1.0.1)
- Probe Diagnostic: `0xCAF2c7cdBD0a6EB4154b763c9fA869407CcCb7b6`
- ConsensusLint Preview v0: `0xdbb2a19163deba1DacDbC2C719D660bA1CDe3130`

---

## Part A: Self-Lint Evidence Correction (Contract Repo)

### 1. Pinned Source Commit URLs Verification
Both contract sources were verified accessible at commit `8b547e3a3257e5d24bf74463a5271c39d6bcb375`:

```
URL: https://raw.githubusercontent.com/hypercybers99/consensus-lint-genlayer/8b547e3a3257e5d24bf74463a5271c39d6bcb375/contracts/ConsensusLint.py
HTTP Status: 200 OK
Byte length: 68032
SHA-256: ce592840fda0a61d2f3d0ea39aaaa5ba2c6da0929ee9a6a7654cf7e74c0d3e25

URL: https://raw.githubusercontent.com/hypercybers99/consensus-lint-genlayer/8b547e3a3257e5d24bf74463a5271c39d6bcb375/contracts/HygieneBadges.py
HTTP Status: 200 OK
Byte length: 8990
SHA-256: 6d2a48275d31556f42ac8fed0b0c91ecace9300e3f60592643b5bf98e3009923
```

### 2. On-Chain Dogfooding Transactions (Studionet Preview)

#### A. ConsensusLint Ledger Contract Self-Lint
- **Target ID:** `a5e2814115e4`
- **Register Tx Hash:** `0x722b5d235239fcf8dc21b82309292c9e920abb8f63784933be5feb897316ff56`
  - Raw Status: ACCEPTED | Agreement: 3/5 agreed (6.44s)
  - Consensus Outcome: Accepted by validators (3/5 agreed) - state applied
- **Audit Tx Hash:** `0x22cfe32c0ce4c7e621571e04a76943bea4eb6fe4b09ea0c89a65f9570a6c69a5`
  - Raw Status: ACCEPTED | Agreement: 3/5 agreed (25.33s)
  - Consensus Outcome: Accepted by validators (3/5 agreed) - state applied
- **On-Chain Audit Readback:**
  - `source_bytes`: 68,032
  - `source_sha256`: `ce592840fda0a61d2f3d0ea39aaaa5ba2c6da0929ee9a6a7654cf7e74c0d3e25`
  - `truncated`: false
  - `score`: 94
  - `grade`: "A"
  - Findings: CL06 (-3), CL16 (-3)

#### B. HygieneBadges Contract Self-Lint
- **Target ID:** `ead8d85fa0f0`
- **Register Tx Hash:** `0xa6f5a99d02a23cd2d9817eb0fd92cd0be694e76bc063af5fb70ec601a09ac916`
  - Raw Status: ACCEPTED | Agreement: 3/5 agreed (10.92s)
  - Consensus Outcome: Accepted by validators (3/5 agreed) - state applied
- **Audit Tx Hash:** `0x8a47d96342ec940756374087d38ab08fb6f9a118709a5e391566151d6b7b98ed`
  - Raw Status: ACCEPTED | Agreement: 3/5 agreed (12.99s)
  - Consensus Outcome: Accepted by validators (3/5 agreed) - state applied
- **On-Chain Audit Readback:**
  - `source_bytes`: 8,990
  - `source_sha256`: `6d2a48275d31556f42ac8fed0b0c91ecace9300e3f60592643b5bf98e3009923`
  - `truncated`: false
  - `score`: 94
  - `grade`: "A"
  - Findings: CL06 (-3), CL16 (-3)

### 3. Consistency Checker (Rules K1 - K9) & Test Suite
- Rule K9 added: verifies that `live_evidence.json` self_lint records match byte-for-byte with local reference files.
- `check_evidence_consistency.js`: Passed OK across K1 - K9.
- `scan_ascii.py`: 60 files scanned, 0 violations.
- `scan_banned_words.py`: 30 files scanned, 0 violations.
- `python -m unittest discover tests`: 47 tests passed (100%).
- Git HEAD: `c5a52137624c898e8cd9a17e34b61ccdbb160687` pushed to `hypercybers99/consensus-lint-genlayer`.

---

## Part B: ConsensusLint Desk dApp

### 1. Deployment & Release URLs
- **GitHub Repository:** https://github.com/hypercybers99/consensus-lint-app-genlayer
- **Git HEAD Commit:** `42f2c1d`
- **Git Release Tag:** `v1.0.0` (https://github.com/hypercybers99/consensus-lint-app-genlayer/releases/tag/v1.0.0)
- **Vercel Production URL:** https://consensus-lint-app-genlayer.vercel.app
- **Release Artifacts Bundle:** `consensus-lint-app-artifacts.zip`
  - **SHA-256:** `56b0335820fe85b3e7f39b8491b49af57b825cd5e6a8cc4f1bb6a294bfdf2015`

### 2. Contract Call-Map Parity Verification (AST/Regex)
The dApp's service call-map (`src/services/contractCallMap.ts`) was verified against the reference contracts (`contracts-reference/`) via automated AST/regex extraction in `tests/unit/contractCallMap.test.ts`.

- **ConsensusLint.py:** 14 public methods (3 write, 11 view) verified with exact parameter arity.
- **HygieneBadges.py:** 8 public methods (3 write, 5 view) verified with exact parameter arity.
- **Negative Test:** Deliberate introduction of mismatched method demonstrated immediate test failure, which passed upon reverting.

### 3. Live Funding Measurement (Two Fresh 0 GEN Accounts)
Measured on GenLayer Studionet (Preview) on **2026-11-09T13:38:19.599Z**.

| Account | Role | Address | Initial Balance | Final Balance | Operations Executed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Account 1** | Registrant | `0xd0F85657aA701032430A7D0d4Eb9CFa70795D3EE` | 0 wei (0 GEN) | 0 wei (0 GEN) | 3 | All Accepted |
| **Account 2** | Stranger | `0x6dED88089F79F6ed49f7F7D974b4Ae493d62Bcdd` | 0 wei (0 GEN) | 0 wei (0 GEN) | 1 | Revert Handled |

#### Live Operations Measured:
```
Op 1: register_target
Sender: 0xd0F85657aA701032430A7D0d4Eb9CFa70795D3EE
Target ID: 01c61272b3eb
Tx Hash: 0xf7d60e8d5d35bd963a1ebba95fad8ab2a8c99fd92b4d7b349554016699e3e445
Raw Status: ACCEPTED | Agreement: 3/5 | Elapsed: 5.84s
Outcome: Accepted by validators (3/5 agreed) - state applied
```

```
Op 2: audit_target
Sender: 0xd0F85657aA701032430A7D0d4Eb9CFa70795D3EE
Target ID: 01c61272b3eb
Tx Hash: 0x1d74f971626e5af43a8200239b2475e2782e7fcf1c44dca4ad82588bf08513fa
Raw Status: ACCEPTED | Agreement: 3/5 | Elapsed: 15.27s
Outcome: Accepted by validators (3/5 agreed) - state applied
```

```
Op 3: respond_to_finding
Sender: 0xd0F85657aA701032430A7D0d4Eb9CFa70795D3EE
Target ID: 01c61272b3eb
Tx Hash: 0x6af85be74e3f741f510e6b03298a9618b98feca7aca2ea60112eb0722dfb3724
Raw Status: ACCEPTED | Agreement: 5/5 | Elapsed: 5.34s
Outcome: Accepted by validators (5/5 agreed) - state applied
```

```
Op 4: unauthorized_respond_to_finding_revert
Sender: 0x6dED88089F79F6ed49f7F7D974b4Ae493d62Bcdd
Target ID: 01c61272b3eb
Tx Hash: 0x43b9cd0e9b3d4e4e93c3ad5da77a4e797745abedfbf92b8fa11ba840da609009
Raw Status: ACCEPTED | Agreement: 3/5 | Elapsed: 8.8s
Outcome: Reverted - state not applied (3/5 agreed on the revert)
Revert Message: "only the registrant can do this"
```

### 4. Accessibility & UI Rigor
- **Axe-Core Automated Matrix:** 32 comprehensive audits across 8 routes and 4 viewports (`390x667`, `500x400`, `630x300`, `1280x800`).
  - **Total Violations:** 0
  - **Results saved:** `docs/axe_matrix.json`
- **Modal Occlusion Verification (`document.elementFromPoint`):** Verified that modal dialog renders inside `#modal-root` outside transforms, and center point belongs strictly to `#modal-root`.
- **Inert Isolation:** Verified `#app-root` has attribute `inert` while modal is active.
- **Keyboard Navigation:** Verified Tab, Shift+Tab focus trap and Escape dialog dismissal.
- **Lighthouse Performance & A11y Scores:** Saved to `docs/lighthouse_results.json` (Accessibility: 100%, Best Practices: 100%, SEO: 100%, Performance: 98%).

### 5. On-Chain Transaction Verification
All 16 evidence transactions queried directly against GenLayer Studionet (Preview) RPC:
- **Total Transactions Verified:** 16 / 16 (100%)
- **Results saved:** `docs/evidence_verification.json`

| Hash (Full 66 Chars) | Context | Agreement | Raw Status | Outcome |
| :--- | :--- | :--- | :--- | :--- |
| `0xadebf1cc2d33a6c1220b3cf9f89fe7a331993fc8cab682b9a198378ab843fc9a` | Target Reg (GoodContract Fixture) | 3/5 | FINALIZED | Accepted by validators (3/5 agreed) - state applied |
| `0x2ae40d46880baadcf022134997ce0a190635bebfd5f8810a6e8dea18d49e6a3d` | Audit (GoodContract Fixture) | 3/5 | FINALIZED | Accepted by validators (3/5 agreed) - state applied |
| `0xb1787d0993a8ef6cd6700160984871072ec6f1885d38a4431b2edd59efc64e7f` | Target Reg (MixedContract Fixture) | 3/5 | FINALIZED | Accepted by validators (3/5 agreed) - state applied |
| `0xdc5d041484a1bce7fa79cb444d9c2079200c65b4e64eafc2ae85e15fb9336217` | Audit (MixedContract Fixture) | 3/5 | FINALIZED | Accepted by validators (3/5 agreed) - state applied |
| `0x2bc8fccf4ef386e6bf834572bf1acbe4583739b2fb5978ed37d12e0daa792d70` | Target Reg (BadContract Fixture) | 4/5 | FINALIZED | Accepted by validators (4/5 agreed) - state applied |
| `0x750d98f5f98dc79cb0594951ba24fd4eaacb4a17af9a170f7a325539b14b0bda` | Audit (BadContract Fixture) | 3/5 | FINALIZED | Accepted by validators (3/5 agreed) - state applied |
| `0x31ba6d9603c23b8d708b1e2dad54bb1660f5ef6d6c6587fdcfe505b6a08a56a2` | Target Reg (NotAContract Fixture) | 3/5 | FINALIZED | Accepted by validators (3/5 agreed) - state applied |
| `0xa230546f3353fed93962514515e23ca5518b64429e2585950b6c5dedc6cfd434` | Audit (NotAContract Fixture) | 3/5 | FINALIZED | Accepted by validators (3/5 agreed) - state applied |
| `0xab53bb3ab5efb73d8adbab4afb81706c2aee92555691134f2f5bfc2029f04de2` | Target Reg (ShellLike Large Fixture) | 3/5 | FINALIZED | Accepted by validators (3/5 agreed) - state applied |
| `0xe6234c85dada1bffee2ba2a7c1b33ee5216034485a9511acaef670837712552f` | Audit (ShellLike Large Fixture) | 3/5 | FINALIZED | Accepted by validators (3/5 agreed) - state applied |
| `0x1bdffe953a4d33105c861a4137e8749b690ddaec76d056e95add61e88b86a565` | Badge Claim (good_contract) | 3/5 | FINALIZED | Accepted by validators (3/5 agreed) - state applied |
| `0x2e21aa846afa2188142dc4c7dda4f273898078045a87cff0f245b9ad4269e0f6` | Maintainer Response (c74c8288839d) | 4/5 | FINALIZED | Accepted by validators (4/5 agreed) - state applied |
| `0xf7d60e8d5d35bd963a1ebba95fad8ab2a8c99fd92b4d7b349554016699e3e445` | E2E Live (register_target) | 3/5 | FINALIZED | Accepted by validators (3/5 agreed) - state applied |
| `0x1d74f971626e5af43a8200239b2475e2782e7fcf1c44dca4ad82588bf08513fa` | E2E Live (audit_target) | 3/5 | FINALIZED | Accepted by validators (3/5 agreed) - state applied |
| `0x6af85be74e3f741f510e6b03298a9618b98feca7aca2ea60112eb0722dfb3724` | E2E Live (respond_to_finding) | 5/5 | FINALIZED | Accepted by validators (5/5 agreed) - state applied |
| `0x43b9cd0e9b3d4e4e93c3ad5da77a4e797745abedfbf92b8fa11ba840da609009` | E2E Live (unauthorized_respond_to_finding_revert) | 3/5 | FINALIZED | Reverted - state not applied (3/5 agreed on the revert) |

---

## Complete Check Suite Execution (`npm run check`)

```
> consensus-lint-app-genlayer@1.0.0 check
> npm run check:reference && npm run build && npm run test && npm run scan:ascii && npm run scan:banned && npm run scan:secrets && npm run scan:dialogs && npm run check:address && npm run verify:bundle

=== CHECKING REFERENCE CONTRACTS SHA-256 AND BYTE SIZES ===
[PASS] ConsensusLint.py: SHA-256 ce592840fda0a61d... (68032 bytes) matches pinned reference.
[PASS] HygieneBadges.py: SHA-256 6d2a48275d31556f... (8990 bytes) matches pinned reference.
All reference contracts verified byte-for-byte identical to pinned sources.

> consensus-lint-app-genlayer@1.0.0 build
> tsc -b && vite build
[PASS] built in 17.64s

> consensus-lint-app-genlayer@1.0.0 test
> vitest run
 [PASS] tests/unit/contractCallMap.test.ts (3 tests) 8ms
 Test Files  1 passed (1)
      Tests  3 passed (3)

=== RUNNING PURE ASCII SCAN ===
[PASS] Pure ASCII scan verified 40 files without violations.

=== RUNNING BANNED WORDS & HONESTY SCAN ===
[PASS] Banned words scan verified 25 files without violations.

=== RUNNING SECRETS SCAN ===
[PASS] Secrets scan verified 36 files without violations.

=== RUNNING BROWSER DIALOG SCAN ===
[PASS] Browser dialog scan verified 25 files. All modals use accessible custom UI.

=== CHECKING ADDRESS CONSISTENCY ===
[PASS] Active addresses pinned and verified. No superseded addresses called in application code.

=== VERIFYING PRODUCTION BUNDLE ===
[PASS] Bundle verified across 3 assets. Active addresses present.
```

---

## Conclusion & Artifact Links
All requirements for Part A (contracts final, self-lint evidence corrected, checker rule K9 added) and Part B (ConsensusLint Desk dApp, 0 GEN live funding measurement, Playwright/Axe accessibility, Vercel deployment, GitHub Release v1.0.0) are fully satisfied and verified on **GenLayer Studionet (Preview)**.
