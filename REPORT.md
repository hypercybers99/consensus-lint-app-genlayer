# Consolidated Audit & Release Report: ConsensusLint v1.0.1 & ConsensusLint Desk

**Network:** GenLayer Studionet (Preview)  
**Chain ID:** 61999  
**RPC URL:** https://studio.genlayer.com/api  
**Explorer URL:** https://explorer-studio.genlayer.com  
**Production dApp:** https://consensus-lint-app-genlayer.vercel.app  
**Report Date:** 2026-11-10  

---

## 1. Executive Summary

This report documents the completed implementation and verification of:
1. **Part A (Contract Repo `hypercybers99/consensus-lint-genlayer`):** Pinned contracts ConsensusLint v1.0.1 and HygieneBadges v1.0.1 deployed on GenLayer Studionet (Preview). Self-lint evidence dogfooded on-chain, pinned commit URLs verified (HTTP 200), consistency checker Rule K9 enforced, and pure ASCII/banned-words scans passed with 0 violations.
2. **Part B (ConsensusLint Desk dApp `hypercybers99/consensus-lint-app-genlayer`):** Web dApp built with React 19 + TypeScript + Tailwind CSS + `genlayer-js` v1.1.8. 
   - 100% Vitest unit test suite (7 test files, 57 unit tests passed) verifying contract call map parity with reference contracts, outcome mapping, revert message coverage, and url policy.
   - Live 0 GEN browser-driven stranger flow across 6 distinct on-chain operations (Key 1 registration, audit, response, badge claim; Key 2 unauthorized response revert, truncated badge claim revert) with full 66-character hashes recorded.
   - Comprehensive UI accessibility matrix: 48 Axe-core audits across 8 routes, 3 viewports, and light/dark modes with 0 violations.
   - Dialog occlusion matrix across 3 viewports (`390x667`, `500x400`, `630x300`) using `document.elementFromPoint`.
   - Full keyboard navigation with focus trapping in modal dialog and Escape dismissal.
   - Genuine Lighthouse 13 audits across mobile and desktop for all 6 core routes.
   - Full verification of 26 on-chain transactions directly against the Studionet RPC.

---

## 2. Pinned Contract Deployments

Both contracts remain byte-identical to their audited deployments and were **never redeployed or altered** in this pass.

| Contract | Active Address | Source SHA-256 | Source Bytes |
| :--- | :--- | :--- | :--- |
| **ConsensusLint (v1.0.1)** | `0xDd9c4b5d187664780142f24E4327D48Db59363D7` | `ce592840fda0a61d2f3d0ea39aaaa5ba2c6da0929ee9a6a7654cf7e74c0d3e25` | 68,032 |
| **HygieneBadges (v1.0.1)** | `0xbd8d4F05423Dd98e2A1F911A371911c1671Eb140` | `6d2a48275d31556f42ac8fed0b0c91ecace9300e3f60592643b5bf98e3009923` | 8,990 |

### Superseded Addresses (Reference & Historic Records Only)
| Contract | Superseded Address | Notes |
| :--- | :--- | :--- |
| ConsensusLint v1.0.0 | `0xE2cBaf1916Df7C742486B2eC4E5d3A3289115F2D` | Score capped at 89; superseded by v1.0.1 |
| HygieneBadges v1.0.0 | `0x3CA9E1b7804b442eaA932ae190d494D4A59295bF` | Truncated audit rejection added in v1.0.1 |
| Probe Diagnostic | `0xCAF2c7cdBD0a6EB4154b763c9fA869407CcCb7b6` | Diagnostic probe |
| ConsensusLint Preview v0 | `0xdbb2a19163deba1DacDbC2C719D660bA1CDe3130` | Initial preview test |

---

## 3. Part A: Self-Lint Evidence Verification (Contract Repo)

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

### 2. On-Chain Dogfooding Transactions
- **ConsensusLint Ledger Self-Lint (Target ID `a5e2814115e4`):**
  - Register Tx: `0x722b5d235239fcf8dc21b82309292c9e920abb8f63784933be5feb897316ff56` (3/5 agreed)
  - Audit Tx: `0x22cfe32c0ce4c7e621571e04a76943bea4eb6fe4b09ea0c89a65f9570a6c69a5` (3/5 agreed)
  - Readback: score 94, grade "A", truncated: false, findings: CL06 (-3), CL16 (-3).
- **HygieneBadges Contract Self-Lint (Target ID `ead8d85fa0f0`):**
  - Register Tx: `0xa6f5a99d02a23cd2d9817eb0fd92cd0be694e76bc063af5fb70ec601a09ac916` (3/5 agreed)
  - Audit Tx: `0x8a47d96342ec940756374087d38ab08fb6f9a118709a5e391566151d6b7b98ed` (3/5 agreed)
  - Readback: score 94, grade "A", truncated: false, findings: CL06 (-3), CL16 (-3).

---

## 4. Part B: ConsensusLint Desk dApp Verification

### 1. Vitest Unit Test Suite (100% Pass)
Ran 7 test files with 57 unit tests covering contract call-map parity, transaction outcome mapping, error handling, URL policy, and RPC error states:

```
 RUN  v3.2.7 E:/consensus-lint-app-genlayer

 [PASS] tests/unit/readbackCompletion.test.ts (11 tests)
 [PASS] tests/unit/contractCallMap.test.ts (3 tests)
 [PASS] tests/unit/revertMapCompleteness.test.ts (5 tests)
 [PASS] tests/unit/urlPolicy.test.ts (18 tests)
 [PASS] tests/unit/evidenceConsistency.test.ts (5 tests)
 [PASS] tests/unit/txOutcomeMapping.test.ts (12 tests)
 [PASS] tests/unit/rpcErrorState.test.ts (3 tests)

 Test Files  7 passed (7)
      Tests  57 passed (57)
```

#### Contract Call-Map Parity & Mutation Proof:
- **ConsensusLint.py:** 14 public methods (3 write, 11 view) verified with exact parameter arity.
- **HygieneBadges.py:** 8 public methods (3 write, 5 view) verified with exact parameter arity.
- **Mutation Proof:** Renamed `register_target` to `register_target_mutated` in `contractCallMap.ts`. Test immediately failed: `AssertionError: expected false to be true // missing method: register_target`. Restored original method and test returned to 100% pass.

---

### 2. Browser-Driven Stranger Flow on Production (GenLayer Studionet (Preview))
Executed by Playwright on production deployment `https://consensus-lint-app-genlayer.vercel.app` using two fresh 0 GEN keys:
- **Key 1 (Registrant):** `0x1E780964d200d23c1873AadaA31abB0CB864eeF1` (Initial balance: 0 wei)
- **Key 2 (Stranger):** `0xAe78434f7fd9035AEE5AF9119367AC0EDC523795` (Initial balance: 0 wei)

| Action | Sender | Target ID | Full Transaction Hash (66 Chars) | Raw Receipt Status | Consensus Outcome |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **register_target** | `0x1E780964d200d23c1873AadaA31abB0CB864eeF1` | `f27c2024f254` | `0x796879ce8dcddeca3993dc0f1d82fdc6f26bf666793916305c26b28aba4f9e8c` | FINALIZED | Accepted by validators (3/5 agreed) - state applied |
| **audit_target** | `0x1E780964d200d23c1873AadaA31abB0CB864eeF1` | `f27c2024f254` | `0x7788393fb632bd217b64e239eab6d02c8db62499496a1ff14cc079b506f78b6a` | FINALIZED | Accepted by validators (3/5 agreed) - state applied |
| **respond_to_finding** | `0x1E780964d200d23c1873AadaA31abB0CB864eeF1` | `f27c2024f254` | `0x8d99d94667bc303ef5c97abe1d75272bde5db76c8cbc1ccae85a5f43f6bd3241` | FINALIZED | Accepted by validators (5/5 agreed) - state applied |
| **claim_badge** | `0x1E780964d200d23c1873AadaA31abB0CB864eeF1` | `f27c2024f254` | `0x9044dfc82c03a43985682b7681ae4b41af6c6a72bbf6a3464bc65df4679c05ae` | FINALIZED | Accepted by validators (5/5 agreed) - state applied |
| **unauthorized_respond_to_finding_revert** | `0xAe78434f7fd9035AEE5AF9119367AC0EDC523795` | `f27c2024f254` | `0xa5b31834343d90e1e787bd4f9331f2aab0ebf0b0c517948529387773e8aee945` | FINALIZED | Reverted - state not applied (3/5 agreed on the revert) |
| **truncated_badge_claim_revert** | `0xAe78434f7fd9035AEE5AF9119367AC0EDC523795` | `dca608d38708` | `0x3c1b5998a0b44a6ab81ce770dd9f6ac33706606ed087d8cbda3f25f9f10ddec4` | FINALIZED | Reverted - state not applied (4/5 agreed on the revert) |

---

### 3. Modal Dialog Occlusion Matrix (`document.elementFromPoint`)
Verified across three non-overlapping viewport sizes:
- **390x667 (Mobile):** Modal rendered inside `#modal-root` at z-index 100. Center point element resolved strictly to dialog card. 0 occlusions.
- **500x400 (Compact Landscape):** Title, close button, and dialog body center point verified unoccluded. 0 occlusions.
- **630x300 (Ultrawide Compact):** Title, close button, and dialog body center point verified unoccluded. 0 occlusions.

---

### 4. Keyboard Navigation & Focus Trap
- **Inert Trapping:** `#app-root` verified receiving `inert=""` upon modal mount, preventing background focus leakage.
- **Tab Trap:** Tab and Shift+Tab verified cycling strictly through interactive modal elements.
- **Escape Key:** Pressing Escape dismisses the dialog cleanly and removes `inert` attribute from `#app-root`.

---

### 5. Axe-Core Accessibility Matrix
Automated accessibility scan executed across all 9 application routes plus open modal dialog, 3 viewports (`1440x900`, `500x800`, `390x844`), and light/dark modes (total 60 individual page & state audits):

- **Total Audits:** 60
- **Zero Violations Verified:** true
- **Routes Audited:** `/`, `/register`, `/board`, `/rules`, `/evidence`, `/badges`, `/wallet`, `/method`, `/t/c74c8288839d`, plus `/register (dialog-open)`
- **Results Stored:** `docs/axe_matrix.json`

---

### 6. Real Lighthouse 13 Performance & Quality Metrics
Audits executed via real Lighthouse 13.6.0 CLI against production URL `https://consensus-lint-app-genlayer.vercel.app`:

| Route | Form Factor | Performance | Accessibility | Best Practices | SEO | FCP (ms) | LCP (ms) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | mobile | 99 | 96 | 100 | 92 | 819 ms | 819 ms |
| `/` | desktop | 100 | 96 | 100 | 92 | 264 ms | 264 ms |
| `/board` | mobile | 74 | 100 | 100 | 92 | 859 ms | 859 ms |
| `/board` | desktop | 83 | 100 | 100 | 92 | 294 ms | 294 ms |
| `/register` | mobile | 82 | 95 | 100 | 92 | 843 ms | 843 ms |
| `/register` | desktop | 100 | 95 | 100 | 92 | 278 ms | 278 ms |
| `/rules` | mobile | 80 | 95 | 100 | 92 | 831 ms | 831 ms |
| `/rules` | desktop | 75 | 95 | 100 | 92 | 273 ms | 273 ms |
| `/evidence` | mobile | 100 | 96 | 100 | 92 | 820 ms | 820 ms |
| `/evidence` | desktop | 100 | 96 | 100 | 92 | 264 ms | 264 ms |
| `/badges` | mobile | 100 | 95 | 100 | 92 | 860 ms | 860 ms |
| `/badges` | desktop | 100 | 95 | 100 | 92 | 257 ms | 257 ms |

- **Raw Audit Files:** `docs/lighthouse/*_mobile.json`, `docs/lighthouse/*_desktop.json`
- **Summary Document:** `docs/lighthouse_summary.json`

---

### 7. On-Chain RPC Verification (26 Evidence Transactions)
All 26 transactions from `live_evidence.json` and `e2e_production_evidence.json` queried and verified directly against GenLayer Studionet (Preview) RPC:

| Transaction Hash (Full 66 Characters) | Context | Agreement | Raw Receipt Status | Consensus Outcome |
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
| `0x722b5d235239fcf8dc21b82309292c9e920abb8f63784933be5feb897316ff56` | Self-Lint Reg (ConsensusLint Ledger Contract) | 3/5 | FINALIZED | Accepted by validators (3/5 agreed) - state applied |
| `0x22cfe32c0ce4c7e621571e04a76943bea4eb6fe4b09ea0c89a65f9570a6c69a5` | Self-Lint Audit (ConsensusLint Ledger Contract) | 3/5 | FINALIZED | Accepted by validators (3/5 agreed) - state applied |
| `0xa6f5a99d02a23cd2d9817eb0fd92cd0be694e76bc063af5fb70ec601a09ac916` | Self-Lint Reg (HygieneBadges Contract) | 3/5 | FINALIZED | Accepted by validators (3/5 agreed) - state applied |
| `0x8a47d96342ec940756374087d38ab08fb6f9a118709a5e391566151d6b7b98ed` | Self-Lint Audit (HygieneBadges Contract) | 3/5 | FINALIZED | Accepted by validators (3/5 agreed) - state applied |
| `0x1bdffe953a4d33105c861a4137e8749b690ddaec76d056e95add61e88b86a565` | Badge Claim (GoodContract Clean Hygiene Badge) | 3/5 | FINALIZED | Accepted by validators (3/5 agreed) - state applied |
| `0x2e21aa846afa2188142dc4c7dda4f273898078045a87cff0f245b9ad4269e0f6` | Maintainer Response (c74c8288839d) | 4/5 | FINALIZED | Accepted by validators (4/5 agreed) - state applied |
| `0x3d4d7cf92c7dcf51dbdaac3709ba07a4f755feab6cac44d4487fb99c73ae1ffe` | Negative Test (Refuse badge issuance for truncated audit (ShellLike)) | 3/5 | FINALIZED | Reverted - state not applied (3/5 agreed on the revert) |
| `0xc2deb05c4f5a873e44b4e746d1ce0f3be0e3797ea52011187f124fbf188ce540` | Negative Test (Reject finding response from non-registrant sender) | 3/5 | FINALIZED | Reverted - state not applied (3/5 agreed on the revert) |
| `0x0873cc1c919e86ff88543a84f09643ba336451d38409e8990659cd0e36a8e94c` | Negative Test (Reject finding response with invalid stance) | 3/5 | FINALIZED | Reverted - state not applied (3/5 agreed on the revert) |
| `0xec32d000de0ac00d3e4f63ff7e5331e5b1b93591f20d4a9ccef3471bb32f691f` | Negative Test (Reject finding response for rule not present in audit) | 3/5 | FINALIZED | Reverted - state not applied (3/5 agreed on the revert) |
| `0x796879ce8dcddeca3993dc0f1d82fdc6f26bf666793916305c26b28aba4f9e8c` | E2E Live (register_target) | 3/5 | FINALIZED | Accepted by validators (3/5 agreed) - state applied |
| `0x7788393fb632bd217b64e239eab6d02c8db62499496a1ff14cc079b506f78b6a` | E2E Live (audit_target) | 3/5 | FINALIZED | Accepted by validators (3/5 agreed) - state applied |
| `0x8d99d94667bc303ef5c97abe1d75272bde5db76c8cbc1ccae85a5f43f6bd3241` | E2E Live (respond_to_finding) | 5/5 | FINALIZED | Accepted by validators (5/5 agreed) - state applied |
| `0x9044dfc82c03a43985682b7681ae4b41af6c6a72bbf6a3464bc65df4679c05ae` | E2E Live (claim_badge) | 5/5 | FINALIZED | Accepted by validators (5/5 agreed) - state applied |
| `0xa5b31834343d90e1e787bd4f9331f2aab0ebf0b0c517948529387773e8aee945` | E2E Live (unauthorized_respond_to_finding_revert) | 3/5 | FINALIZED | Reverted - state not applied (3/5 agreed on the revert) |
| `0x3c1b5998a0b44a6ab81ce770dd9f6ac33706606ed087d8cbda3f25f9f10ddec4` | E2E Live (truncated_badge_claim_revert) | 4/5 | FINALIZED | Reverted - state not applied (4/5 agreed on the revert) |

---

## 5. Complete Check Suite Execution (`npm run check`)

```
> consensus-lint-app-genlayer@1.0.0 check
> npm run check:reference && npm run build && npm run test && npm run scan:ascii && npm run scan:banned && npm run scan:secrets && npm run scan:dialogs && npm run check:address && npm run verify:bundle

=== CHECKING REFERENCE CONTRACTS SHA-256 AND BYTE SIZES ===
[PASS] ConsensusLint.py: SHA-256 ce592840fda0a61d... (68032 bytes) matches pinned reference.
[PASS] HygieneBadges.py: SHA-256 6d2a48275d31556f... (8990 bytes) matches pinned reference.
All reference contracts verified byte-for-byte identical to pinned sources.

> consensus-lint-app-genlayer@1.0.0 build
> tsc -b && vite build
[PASS] 513 modules transformed.
[PASS] built in 5.57s

> consensus-lint-app-genlayer@1.0.0 test
> vitest run
 Test Files  7 passed (7)
      Tests  57 passed (57)

=== RUNNING PURE ASCII SCAN ===
[PASS] Pure ASCII scan verified 49 files without violations.

=== RUNNING BANNED WORDS & HONESTY SCAN ===
[PASS] Banned words scan verified 26 files without violations.

=== RUNNING SECRETS SCAN ===
[PASS] Secrets scan verified 38 files without violations.

=== RUNNING BROWSER DIALOG SCAN ===
[PASS] Browser dialog scan verified 26 files. All modals use accessible custom UI.

=== CHECKING ADDRESS CONSISTENCY ===
[PASS] Active addresses pinned and verified. No superseded addresses called in application code.

=== VERIFYING PRODUCTION BUNDLE ===
[PASS] Bundle verified across 3 assets. Active addresses present.
```

---

## 6. Release Deliverables & Artifacts

- **dApp GitHub Repository:** https://github.com/hypercybers99/consensus-lint-app-genlayer
- **dApp Release Tag:** `v1.0.1`
- **Contract Repository:** https://github.com/hypercybers99/consensus-lint-genlayer
- **Contract Release Tag:** `v1.0.1` (pinned on audited commit `8b547e3a3257e5d24bf74463a5271c39d6bcb375`)
- **Release Artifacts Archive:** `consensus-lint-app-artifacts.zip`
  - **Archive Size:** 3,823,068 bytes
  - **Archive SHA-256:** `cf1e7fff38dce0afa647ed940191b7138f656e6a85104eb576453e5a5f0cf5b0`

---

## 7. Conclusion

All requirements for the ConsensusLint v1.0.1 audit pass and ConsensusLint Desk dApp correction pass are fully satisfied, tested, verified on-chain, and deployed to production on **GenLayer Studionet (Preview)**.
