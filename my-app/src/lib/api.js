import { apiBase } from '../config';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from './auth';

async function rawFetch(url, options = {}) {
  const res = await fetch(url, options);
  return res;
}

export async function ensureAccess() {
  const access = getAccessToken();
  if (access) return true;

  const refresh = getRefreshToken();
  if (!refresh) return false;

  const refRes = await rawFetch(`${apiBase}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${refresh}` },
  });
  if (!refRes.ok) {
    clearTokens();
    return false;
  }
  const data = await refRes.json();
  if (data?.ok && data.access_token) {
    saveTokens({ access_token: data.access_token });
    return true;
  }
  return false;
}

// auto-attach Authorization; on 401 try refresh once, then retry
export async function apiFetch(path, options = {}, retry = true) {
  const access = getAccessToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
  if (access) headers.set('Authorization', `Bearer ${access}`);

  const res = await rawFetch(`${apiBase}${path}`, { ...options, headers });
  if (res.status !== 401) return res;

  // try refresh if we have a refresh token and haven't retried yet
  if (!retry) return res;

  const refresh = getRefreshToken();
  if (!refresh) return res;

  const refRes = await rawFetch(`${apiBase}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${refresh}` },
  });

  if (!refRes.ok) {
    clearTokens();
    return res; // original 401
  }

  const refData = await refRes.json();
  if (refData?.ok && refData.access_token) {
    saveTokens({ access_token: refData.access_token }); // rotate only access
    // retry original
    return apiFetch(path, options, false);
  }

  clearTokens();
  return res;
}
