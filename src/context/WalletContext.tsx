// src/context/WalletContext.tsx
// In-app throwaway key management with persistent storage, balance retrieval, and import/export

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createAccount, generatePrivateKey } from 'genlayer-js';
import { NETWORK_CONFIG } from '../config/contracts';

interface WalletContextType {
  account: any | null;
  address: string | null;
  privateKey: string | null;
  balance: string | null;
  loadingBalance: boolean;
  generateNewWallet: () => void;
  importKey: (key: string) => boolean;
  clearWallet: () => void;
  refreshBalance: () => Promise<void>;
}

const STORAGE_KEY = 'consensuslint_desk_private_key';

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [account, setAccount] = useState<any | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [loadingBalance, setLoadingBalance] = useState<boolean>(false);

  const initAccountFromKey = useCallback((rawKey: string) => {
    try {
      const normalizedKey = rawKey.startsWith('0x') ? rawKey : `0x${rawKey}`;
      const acc = createAccount(normalizedKey as `0x${string}`);
      setPrivateKey(normalizedKey);
      setAccount(acc);
      setAddress(acc.address);
      localStorage.setItem(STORAGE_KEY, normalizedKey);
      return true;
    } catch (e) {
      console.error('Failed to init account from key:', e);
      return false;
    }
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!address) {
      setBalance(null);
      return;
    }
    setLoadingBalance(true);
    try {
      const res = await fetch(NETWORK_CONFIG.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getBalance',
          params: [address, 'latest'],
        }),
      });
      const json = await res.json();
      if (json && json.result) {
        // Hex balance to decimal
        const dec = BigInt(json.result);
        // Format to GEN
        const genFormatted = (Number(dec) / 1e18).toFixed(4);
        setBalance(genFormatted);
      } else {
        setBalance('0.0000');
      }
    } catch (e) {
      console.error('Failed to fetch balance:', e);
      setBalance('0.0000');
    } finally {
      setLoadingBalance(false);
    }
  }, [address]);

  const generateNewWallet = useCallback(() => {
    const newKey = generatePrivateKey();
    initAccountFromKey(newKey);
  }, [initAccountFromKey]);

  const importKey = useCallback(
    (keyInput: string) => {
      const clean = keyInput.trim();
      const hex = clean.startsWith('0x') ? clean.slice(2) : clean;
      if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
        return false;
      }
      return initAccountFromKey(`0x${hex}`);
    },
    [initAccountFromKey]
  );

  const clearWallet = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPrivateKey(null);
    setAccount(null);
    setAddress(null);
    setBalance(null);
  }, []);

  // Initial load
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      initAccountFromKey(saved);
    } else {
      generateNewWallet();
    }
  }, [initAccountFromKey, generateNewWallet]);

  // Refresh balance on address change
  useEffect(() => {
    if (address) {
      refreshBalance();
    }
  }, [address, refreshBalance]);

  return (
    <WalletContext.Provider
      value={{
        account,
        address,
        privateKey,
        balance,
        loadingBalance,
        generateNewWallet,
        importKey,
        clearWallet,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export function useWallet(): WalletContextType {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return ctx;
}
