// src/components/CooldownTimer.tsx
// Live countdown timer for the 300-second audit cooldown window

import React, { useState, useEffect } from 'react';
import { CONTRACT_CONSTANTS } from '../config/contracts';

interface CooldownTimerProps {
  lastAuditTs: number | null;
  onCooldownEnd?: () => void;
}

export const CooldownTimer: React.FC<CooldownTimerProps> = ({ lastAuditTs, onCooldownEnd }) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  useEffect(() => {
    if (!lastAuditTs) {
      setSecondsRemaining(0);
      return;
    }

    const check = () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const elapsed = nowSeconds - lastAuditTs;
      const rem = Math.max(0, CONTRACT_CONSTANTS.AUDIT_COOLDOWN_SECONDS - elapsed);
      setSecondsRemaining(rem);
      if (rem === 0 && onCooldownEnd) {
        onCooldownEnd();
      }
    };

    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, [lastAuditTs, onCooldownEnd]);

  if (!lastAuditTs || secondsRemaining === 0) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        Ready for audit
      </div>
    );
  }

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const formatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800 text-amber-300 text-xs font-mono font-medium"
      title="Audit cooldown enforced by ConsensusLint contract (300s window)"
    >
      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
      Cooldown active: {formatted} ({secondsRemaining}s remaining)
    </div>
  );
};
