const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
export const API_URL = rawUrl.replace(/\/api\/?$/, "");
export const TOKEN_KEY = "sacnm_portal_token";

export type PortalUser = { id: number; name: string; email: string; phone?: string; is_admin: boolean };

export function token() { return typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY); }
export function saveToken(value: string) { localStorage.setItem(TOKEN_KEY, value); }
export function clearToken() { localStorage.removeItem(TOKEN_KEY); }

export async function api(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  const value = token();
  if (value) headers.set("Authorization", `Bearer ${value}`);
  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(body.message || "Request failed."), { status: response.status, errors: body.errors });
  return body;
}
