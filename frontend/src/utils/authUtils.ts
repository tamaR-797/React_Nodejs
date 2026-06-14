export const parseJwt = (token: string) => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(encodeURI(json)));
  } catch (e) {
    return null;
  }
};

export const isTokenExpired = (token: string | null | undefined): boolean => {
  if (!token) return true;
  const payload = parseJwt(token);
  if (!payload || typeof payload !== 'object') return true;
  // exp is in seconds since epoch
  if (!payload.exp) return false; // if no exp claim, assume non-expiring
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now;
};

export const getStoredAuth = (): { user?: any; token?: string } | null => {
  try {
    const raw = localStorage.getItem('auth');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};
