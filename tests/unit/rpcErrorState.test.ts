// tests/unit/rpcErrorState.test.ts
// Asserts that RPC failure displays error state with a visible Retry button
// and NEVER contains "not found" or "does not exist"

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { TargetStatusDisplay } from '../../src/pages/TargetDetail';

// Mock react-router-dom Link
vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: any) => React.createElement('a', { href: to }, children),
}));

describe('RPC Error State & Never-Not-Found Verification', () => {
  it('renders RPC error state with Retry button on RPC failure and NEVER says "not found" or "does not exist"', () => {
    const rpcErrorMessage = 'ETIMEDOUT: Connection refused to https://studio.genlayer.com/api';
    const onRetry = vi.fn();

    const element = React.createElement(TargetStatusDisplay, {
      rpcError: rpcErrorMessage,
      targetNotFound: false,
      onRetry,
    });

    const html = renderToString(element);

    // 1. Must contain "Retry" button
    expect(html).toContain('Retry');

    // 2. Must indicate RPC communication error
    expect(html.toLowerCase()).toContain('rpc communication error');

    // 3. Must display the RPC error message details
    expect(html).toContain(rpcErrorMessage);

    // 4. Must display the network endpoint
    expect(html).toContain('https://studio.genlayer.com/api');

    // 5. CRITICAL: MUST NEVER contain "not found" or "does not exist"
    expect(html.toLowerCase()).not.toContain('not found');
    expect(html.toLowerCase()).not.toContain('does not exist');
  });

  it('distinguishes real target not found from RPC communication error', () => {
    const element = React.createElement(TargetStatusDisplay, {
      rpcError: null,
      targetNotFound: true,
      id: 'abc123456789',
    });

    const html = renderToString(element);

    // When genuinely not found (clean response, target not in registry):
    expect(html).toContain('Target Not Found');
    expect(html).toContain('does not exist');
    expect(html).toContain('abc123456789');

    // Must NOT show RPC error or retry button
    expect(html).not.toContain('RPC Communication Error');
    expect(html).not.toContain('Retry');
  });

  it('renders nothing when there is neither an RPC error nor not-found status', () => {
    const element = React.createElement(TargetStatusDisplay, {
      rpcError: null,
      targetNotFound: false,
    });

    const html = renderToString(element);
    expect(html).toBe('');
  });
});
