import { supabase } from "../lib/supabase";

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

export function getAdminKey() {
  return sessionStorage.getItem("cicada_admin_secret_key");
}

function setAdminKey(value) {
  if (value) sessionStorage.setItem("cicada_admin_secret_key", value);
  else sessionStorage.removeItem("cicada_admin_secret_key");
}

let cachedToken = null;
let tokenExpiresAt = 0;

if (typeof window !== "undefined") {
  supabase.auth.getSession().then(({ data }) => {
    if (data?.session?.access_token) {
      cachedToken = data.session.access_token;
      tokenExpiresAt = data.session.expires_at ? data.session.expires_at * 1000 : Date.now() + 3600 * 1000;
    }
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.access_token) {
      cachedToken = session.access_token;
      tokenExpiresAt = session.expires_at ? session.expires_at * 1000 : Date.now() + 3600 * 1000;
    } else {
      cachedToken = null;
      tokenExpiresAt = 0;
    }
  });
}

export async function getValidToken() {
  if (cachedToken && Date.now() < tokenExpiresAt - 30000) {
    return cachedToken;
  }
  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.access_token) {
      cachedToken = data.session.access_token;
      tokenExpiresAt = data.session.expires_at ? data.session.expires_at * 1000 : Date.now() + 3600 * 1000;
      return cachedToken;
    }
  } catch {
    /* ignore session error */
  }
  return null;
}

export async function api(path, { method = "GET", body, admin = false } = {}) {
  const headers = { "Content-Type": "application/json" };

  const token = await getValidToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (admin) {
    const key = getAdminKey();
    if (key) headers["x-admin-key"] = key;
  }
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON response */
  }

  if (!res.ok) {
    const err = new Error(
      (json && (json.error || json.message)) || `Request failed (${res.status})`
    );
    err.status = res.status;
    err.data = json;
    throw err;
  }
  return json;
}

export { API_URL, setAdminKey };
