// src/services/urlPolicy.ts
// Client-side mirror of ConsensusLint.py _parse_and_validate_source_url

export interface ValidatedSourceUrl {
  canonicalUrl: string;
  ownerRepo: string;
  ref: string;
  refKind: 'PINNED_COMMIT' | 'MUTABLE_REF';
  relPath: string;
  fileName: string;
}

export function parseAndValidateSourceUrl(rawUrl: unknown): ValidatedSourceUrl {
  if (typeof rawUrl !== 'string') {
    throw new Error('source url not valid');
  }

  const url = rawUrl.trim();
  if (url.length === 0) {
    throw new Error('source url not valid');
  }

  if (url.length > 300) {
    throw new Error('source url too long');
  }

  // Check ASCII range 33-126 (no whitespace, control chars, non-ASCII)
  for (let i = 0; i < url.length; i++) {
    const code = url.charCodeAt(i);
    if (code < 33 || code > 126) {
      throw new Error('source url not valid');
    }
  }

  // URL split / parse
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('source url not valid');
  }

  if (parsed.protocol !== 'https:') {
    throw new Error('source url must use https');
  }

  if (parsed.username || parsed.password) {
    throw new Error('source url contains credentials');
  }

  if (parsed.port && parsed.port !== '443') {
    throw new Error('source url port not allowed');
  }

  if (parsed.search || parsed.hash) {
    throw new Error('source url has query or fragment');
  }

  let host = parsed.hostname.toLowerCase();
  if (host.endsWith('.')) {
    host = host.slice(0, -1);
  }

  if (host !== 'raw.githubusercontent.com') {
    throw new Error('source host not allowed');
  }

  const rawPath = parsed.pathname;
  if (
    rawPath.includes('//') ||
    rawPath.includes('..') ||
    rawPath.toLowerCase().includes('%2f') ||
    rawPath.toLowerCase().includes('%2e')
  ) {
    throw new Error('source url not valid');
  }

  const segments = rawPath.split('/').filter((s) => s.length > 0);
  if (segments.length < 4) {
    throw new Error('source url not valid');
  }

  const owner = segments[0];
  const repo = segments[1];
  const ref = segments[2];
  const relPathSegments = segments.slice(3);

  if (!/^[A-Za-z0-9-]{1,39}$/.test(owner)) {
    throw new Error('source url not valid');
  }

  if (!/^[A-Za-z0-9._-]{1,100}$/.test(repo)) {
    throw new Error('source url not valid');
  }

  let refKind: 'PINNED_COMMIT' | 'MUTABLE_REF';
  if (/^[0-9a-f]{40}$/.test(ref)) {
    refKind = 'PINNED_COMMIT';
  } else if (/^[A-Za-z0-9._-]{1,100}$/.test(ref)) {
    refKind = 'MUTABLE_REF';
  } else {
    throw new Error('source url not valid');
  }

  if (relPathSegments.length > 6) {
    throw new Error('source url not valid');
  }

  for (const seg of relPathSegments) {
    if (!/^[A-Za-z0-9._-]+$/.test(seg)) {
      throw new Error('source url not valid');
    }
  }

  const relPath = relPathSegments.join('/');
  if (!relPath.endsWith('.py')) {
    throw new Error('source path must end with .py');
  }

  const ownerRepo = `${owner}/${repo}`;
  const canonicalUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${relPath}`;
  const fileName = relPathSegments[relPathSegments.length - 1];

  return {
    canonicalUrl,
    ownerRepo,
    ref,
    refKind,
    relPath,
    fileName,
  };
}
