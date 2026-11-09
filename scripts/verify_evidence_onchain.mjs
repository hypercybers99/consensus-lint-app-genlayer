// scripts/verify_evidence_onchain.mjs
// Verifies all evidence transaction receipts on GenLayer Studionet (Preview) RPC

import dns from 'dns';
dns.setDefaultResultOrder('verbatim');

import fs from 'fs';
import path from 'path';
import { NETWORK_CONFIG } from '../src/config/contracts.js';

const RPC_URL = NETWORK_CONFIG.rpcUrl;

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchTx(hash) {
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getTransactionByHash',
      params: [hash],
    }),
  });
  const json = await res.json();
  return json?.result;
}

function calculateAgreement(tx) {
  if (!tx?.consensus_data?.votes) return { agree: 0, total: 0, str: 'N/A' };
  const votes = tx.consensus_data.votes;
  const agree = Object.values(votes).filter((v) => v === 'agree').length;
  const total = Object.keys(votes).length;
  return { agree, total, str: `${agree}/${total}` };
}

function decodeUserError(tx) {
  try {
    const leader = tx?.consensus_data?.leader_receipt?.[0];
    if (leader && leader.execution_result !== 'SUCCESS') {
      if (leader.result) {
        const buf = Buffer.from(leader.result, 'base64');
        if (buf.length > 0 && buf[0] === 1) return buf.subarray(1).toString('utf8');
        return buf.toString('utf8');
      }
      return leader.genvm_result?.error_description || 'Execution failed';
    }
  } catch (e) {}
  return null;
}

async function main() {
  console.log('=== VERIFYING EVIDENCE TRANSACTIONS ON-CHAIN ===');
  console.log('Network:', NETWORK_CONFIG.name);
  console.log('RPC:', RPC_URL);

  const hashesToVerify = [];

  // Load from live_evidence.json
  if (fs.existsSync('docs/live_evidence.json')) {
    const live = JSON.parse(fs.readFileSync('docs/live_evidence.json', 'utf8'));
    for (const [k, t] of Object.entries(live.targets || {})) {
      if (t.registrationTxHash) hashesToVerify.push({ hash: t.registrationTxHash, context: `Target Reg (${t.label})` });
      if (t.auditTxHash) hashesToVerify.push({ hash: t.auditTxHash, context: `Audit (${t.label})` });
    }
    for (const [k, s] of Object.entries(live.self_lint || {})) {
      if (s.register_tx_hash) hashesToVerify.push({ hash: s.register_tx_hash, context: `Self-Lint Reg (${s.label})` });
      if (s.audit_tx_hash) hashesToVerify.push({ hash: s.audit_tx_hash, context: `Self-Lint Audit (${s.label})` });
    }
    for (const [k, b] of Object.entries(live.badges || {})) {
      if (b.claimTxHash) hashesToVerify.push({ hash: b.claimTxHash, context: `Badge Claim (${b.label || k})` });
    }
    for (const r of live.maintainer_responses || []) {
      if (r.txHash) hashesToVerify.push({ hash: r.txHash, context: `Maintainer Response (${r.tid})` });
    }
  }

  // Load from e2e_production_evidence.json
  if (fs.existsSync('docs/e2e_production_evidence.json')) {
    const e2e = JSON.parse(fs.readFileSync('docs/e2e_production_evidence.json', 'utf8'));
    for (const t of e2e.transactions || []) {
      if (t.txHash) hashesToVerify.push({ hash: t.txHash, context: `E2E Live (${t.action})` });
    }
  }

  // Deduplicate hashes
  const uniqueMap = new Map();
  for (const item of hashesToVerify) {
    if (!uniqueMap.has(item.hash)) {
      uniqueMap.set(item.hash, item.context);
    }
  }

  console.log(`Verifying ${uniqueMap.size} unique transaction hashes...`);

  const results = [];
  let successCount = 0;

  for (const [hash, context] of uniqueMap.entries()) {
    try {
      const tx = await fetchTx(hash);
      if (!tx) {
        console.error(`[FAIL] Transaction not found on RPC: ${hash}`);
        results.push({ hash, context, verified: false, error: 'Tx not found' });
        continue;
      }

      const agreement = calculateAgreement(tx);
      const userError = decodeUserError(tx);
      const isRevert = !!userError;
      const outcome = isRevert
        ? `Reverted - state not applied (${agreement.str} agreed on the revert)`
        : `Accepted by validators (${agreement.str} agreed) - state applied`;

      successCount++;
      console.log(`[PASS] ${hash.slice(0, 16)}... | ${agreement.str} agreed | ${outcome}`);
      results.push({
        hash,
        context,
        verified: true,
        rawStatus: tx.status,
        agreement: agreement.str,
        executionResult: tx.consensus_data?.leader_receipt?.[0]?.execution_result || 'N/A',
        userError,
        outcome,
      });
    } catch (e) {
      console.error(`[FAIL] Error querying ${hash}:`, e.message);
      results.push({ hash, context, verified: false, error: e.message });
    }
    await sleep(200);
  }

  const output = {
    verifiedAt: new Date().toISOString(),
    network: NETWORK_CONFIG.name,
    chainId: NETWORK_CONFIG.chainId,
    totalVerified: successCount,
    totalAttempted: uniqueMap.size,
    records: results,
  };

  fs.writeFileSync('docs/evidence_verification.json', JSON.stringify(output, null, 2), 'utf8');
  console.log(`\nVerified ${successCount}/${uniqueMap.size} transactions on-chain. Written to docs/evidence_verification.json`);

  if (successCount < uniqueMap.size) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
