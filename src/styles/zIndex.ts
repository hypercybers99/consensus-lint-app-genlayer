// src/styles/zIndex.ts
// Single source of truth for all z-index stacking layers in ConsensusLint Desk

export const Z_INDEX = {
  content: 0,
  stickyHeader: 10,
  dropdown: 20,
  stickyFooter: 30,
  overlay: 40,
  dialog: 50,
  toast: 60,
} as const;

export type ZIndexLayer = keyof typeof Z_INDEX;
