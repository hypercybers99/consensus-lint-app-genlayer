// src/config/evidenceData.ts
// Pinned on-chain evidence records for ConsensusLint Desk

export interface EvidenceRecord {
  category: string;
  label: string;
  targetId: string;
  txHash: string;
  agreement: string;
  outcome: string;
}

export const VERIFIED_EVIDENCE_RECORDS: EvidenceRecord[] = [
  {
    category: 'Target Registration',
    label: 'GoodContract Fixture',
    targetId: '2bac0b36b071',
    txHash: '0xadebf1cc2d33a6c1220b3cf9f89fe7a331993fc8cab682b9a198378ab843fc9a',
    agreement: '3/5',
    outcome: 'Accepted by validators (3/5 agreed) - state applied',
  },
  {
    category: 'Consensus Audit',
    label: 'GoodContract Fixture',
    targetId: '2bac0b36b071',
    txHash: '0x2ae40d46880baadcf022134997ce0a190635bebfd5f8810a6e8dea18d49e6a3d',
    agreement: '3/5',
    outcome: 'Accepted by validators (3/5 agreed) - state applied',
  },
  {
    category: 'Target Registration',
    label: 'BadContract Fixture',
    targetId: 'c74c8288839d',
    txHash: '0x815a51fb03fc2e1d74656ca8ec455eb3f4c718c3a9d949fe5b3991c6bf489670',
    agreement: '3/5',
    outcome: 'Accepted by validators (3/5 agreed) - state applied',
  },
  {
    category: 'Consensus Audit',
    label: 'BadContract Fixture',
    targetId: 'c74c8288839d',
    txHash: '0x217d8481ffec9759be7e4d8122c608f7db00d93ea8974a625a66a1aebdb9f45c',
    agreement: '3/5',
    outcome: 'Accepted by validators (3/5 agreed) - state applied',
  },
  {
    category: 'Target Registration',
    label: 'MixedContract Fixture',
    targetId: '4f74133a0a13',
    txHash: '0x882ca8fec2db90c915f03eb54faea80373df96c9c4501a34dbccfae9e26e0be5',
    agreement: '3/5',
    outcome: 'Accepted by validators (3/5 agreed) - state applied',
  },
  {
    category: 'Consensus Audit',
    label: 'MixedContract Fixture',
    targetId: '4f74133a0a13',
    txHash: '0x1ce2bbcf19fa107f90918737272895ea9a5ec99b8b939fbf680cf3efca39e319',
    agreement: '3/5',
    outcome: 'Accepted by validators (3/5 agreed) - state applied',
  },
  {
    category: 'Self-Lint Register',
    label: 'ConsensusLint Ledger Contract',
    targetId: 'a5e2814115e4',
    txHash: '0x722b5d235239fcf8dc21b82309292c9e920abb8f63784933be5feb897316ff56',
    agreement: '3/5',
    outcome: 'Accepted by validators (3/5 agreed) - state applied',
  },
  {
    category: 'Self-Lint Audit',
    label: 'ConsensusLint Ledger Contract',
    targetId: 'a5e2814115e4',
    txHash: '0x22cfe32c0ce4c7e621571e04a76943bea4eb6fe4b09ea0c89a65f9570a6c69a5',
    agreement: '3/5',
    outcome: 'Accepted by validators (3/5 agreed) - state applied',
  },
  {
    category: 'Self-Lint Register',
    label: 'HygieneBadges Contract',
    targetId: 'ead8d85fa0f0',
    txHash: '0xa6f5a99d02a23cd2d9817eb0fd92cd0be694e76bc063af5fb70ec601a09ac916',
    agreement: '3/5',
    outcome: 'Accepted by validators (3/5 agreed) - state applied',
  },
  {
    category: 'Self-Lint Audit',
    label: 'HygieneBadges Contract',
    targetId: 'ead8d85fa0f0',
    txHash: '0x8a47d96342ec940756374087d38ab08fb6f9a118709a5e391566151d6b7b98ed',
    agreement: '3/5',
    outcome: 'Accepted by validators (3/5 agreed) - state applied',
  },
  {
    category: 'Badge Claim',
    label: 'GoodContract Clean Hygiene Badge',
    targetId: '2bac0b36b071',
    txHash: '0x028c2c77d6ee24388e63bdaec3cbcf47b7c2ee7d13038622ee146ba8e6c46698',
    agreement: '3/5',
    outcome: 'Accepted by validators (3/5 agreed) - state applied',
  },
  {
    category: 'Maintainer Response',
    label: 'BadContract Fixture Response',
    targetId: 'c74c8288839d',
    txHash: '0x946b9a8cf69e9c13d964f4aa00d2f83196a0b77bdfb7762699f5726207123999',
    agreement: '3/5',
    outcome: 'Accepted by validators (3/5 agreed) - state applied',
  },
];
