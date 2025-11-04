import { apiBase } from '../config';
import { saveTokens, saveUser } from './auth';
export async function exchangeGoogleCredential(credential, desiredRole) {
  const res = await fetch(`${apiBase}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential, role: desiredRole }), // role опціонально
  });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.message || 'Google sign-in failed');
  saveTokens({ access_token: data.access_token, refresh_token: data.refresh_token });
  saveUser(data.user);
  return data.user;
}