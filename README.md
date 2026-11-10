# ConsensusLint Desk

**ConsensusLint Desk** is the official web dApp interface for **ConsensusLint** on **GenLayer Studionet (Preview)**.

ConsensusLint provides deterministic consensus-hygiene linting for GenLayer Intelligent Contracts. It evaluates Python contract source files against 18 deterministic rules (CL01-CL18) that flag non-determinism, validator recomputation hazards, unpaginated storage iteration, and unhandled parser fallbacks.

> [!NOTE]
> **Scope & Interpretation:** ConsensusLint is an automated static-analysis consensus-hygiene linter, not a security audit or certificate of correctness. A high hygiene score indicates conformance to recommended GenLayer Intelligent Contract development patterns; it is not a correctness certification and does not replace manual code review.

---

## Network & Deployments

- **Network:** GenLayer Studionet (Preview)
- **Chain ID:** 61999
- **RPC Endpoint:** `https://studio.genlayer.com/api`
- **Explorer:** `https://explorer-studio.genlayer.com`
- **Production dApp:** https://consensus-lint-app-genlayer.vercel.app

### Active Contract Deployments

| Contract | Version | Address (42 Characters) | Explorer Link |
| :--- | :--- | :--- | :--- |
| **ConsensusLint** | v1.0.1 | `0xDd9c4b5d187664780142f24E4327D48Db59363D7` | [View Contract](https://explorer-studio.genlayer.com/address/0xDd9c4b5d187664780142f24E4327D48Db59363D7) |
| **HygieneBadges** | v1.0.1 | `0xbd8d4F05423Dd98e2A1F911A371911c1671Eb140` | [View Contract](https://explorer-studio.genlayer.com/address/0xbd8d4F05423Dd98e2A1F911A371911c1671Eb140) |

Source references in `contracts-reference/` are pinned byte-for-byte:
- `ConsensusLint.py`: SHA-256 `ce592840fda0a61d2f3d0ea39aaaa5ba2c6da0929ee9a6a7654cf7e74c0d3e25` (68,032 bytes)
- `HygieneBadges.py`: SHA-256 `6d2a48275d31556f42ac8fed0b0c91ecace9300e3f60592643b5bf98e3009923` (8,990 bytes)

---

## Live Measured Funding Observation

On GenLayer Studionet (Preview), write transactions currently execute with **0 GEN** balance without requiring faucet funding.

- **Measurement Date:** 2026-11-09T13:38:19.599Z
- **Keys Measured:** 2 fresh throwaway accounts with 0 wei (0 GEN) balance
- **Transactions Executed:** 4 live transactions (`register_target`, `audit_target`, `respond_to_finding`, and unauthorized `respond_to_finding` revert)
- **Outcome:** All transactions processed by RPC and validators without balance-related rejections.
- **Notice:** Studionet Preview behavior may change as network fee policies evolve.

The dApp provides an in-app throwaway key manager (`/wallet`) and informational status notices rather than blocking actions on account balances.

---

## Features & Routes

- **Dashboard (`/`):** Network metrics from `get_meta`, 3-step workflow, and top-scored contracts.
- **Leaderboard (`/board`):** Partitioned into Clean Audits (`best`), Partial Audits (`partial`, cut at 120,000 bytes with score capped at 89 and grade capped at B), and Most Improved (`most_improved`).
- **Register Target (`/register`):** Client-side validation enforcing HTTPS, `raw.githubusercontent.com`, `.py` extension, and character limits matching contract policy, with one-click fixture presets.
- **Target Detail (`/t/:id`):** Paginated audit history, 300-second live countdown cooldown timer, per-rule findings, code snippets, and maintainer response submission.
- **Rule Catalogue (`/rules`):** Complete catalogue of rules CL01-CL18 with live on-chain trigger frequencies from `get_rule_stats`.
- **Badges (`/badges`):** Claim on-chain hygiene badges for non-truncated audits, refresh badge scores, and view minted badge registry.
- **Methodology (`/method`):** Technical documentation of scoring formula, penalty weights, caps, and truncation policies.
- **Verified Evidence (`/evidence`):** Comprehensive table rendered directly from `docs/evidence_verification.json` displaying verified transaction hashes and consensus agreements.
- **Throwaway Wallet (`/wallet`):** In-app key generation, import, export, balance querying, and local storage persistence.

---

## Local Development & Verification Commands

### Prerequisites
- Node.js >= 20
- npm >= 10

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Unit Tests (Vitest)
```bash
npm run test
```

### Full Validation Suite
```bash
npm run check
```
The check orchestrator runs:
1. `npm run check:reference` - Verifies reference contracts match pinned SHA-256 and byte sizes.
2. `npm run build` - TypeScript compilation and Vite production bundle.
3. `npm run test` - Unit tests for call map, revert map, URL validation, and readbacks.
4. `npm run scan:ascii` - Pure ASCII scanner across all source files.
5. `npm run scan:banned` - Policy honesty and banned wording scanner.
6. `npm run scan:secrets` - Secret and private key scanner.
7. `npm run scan:dialogs` - Native browser dialog scanner (`alert`, `confirm`, `prompt`).
8. `npm run check:address` - Active vs superseded address consistency scanner.
9. `npm run verify:bundle` - Validates production bundle contains active contract addresses.

### End-to-End & Accessibility Tests (Playwright)
```bash
npx playwright test
```
Runs Axe-core accessibility matrix across 8 routes and 4 viewports, modal portal occlusion tests, and keyboard focus trap tests.

---

## Scope Limits & Boundary Declarations

- **Linter Scope:** Evaluates consensus hygiene and determinism patterns for GenLayer Python contracts. It does not certify security, formal correctness, or economic safety.
- **Consensus Model:** Outcomes on GenLayer Studionet (Preview) represent validator agreement (typically 3 of 5 validators). They do not represent unanimous or cryptographic proofs.
- **Source Limits:** Source files larger than 120,000 bytes are truncated; stored scores are capped at 89 and grades capped at B. Truncated contracts are partitioned from the main leaderboard and cannot receive badges.
