import { supabase } from "../lib/supabase";

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

export function getAdminKey() {
  return sessionStorage.getItem("cicada_admin_secret_key");
}

function setAdminKey(value) {
  if (value) sessionStorage.setItem("cicada_admin_secret_key", value);
  else sessionStorage.removeItem("cicada_admin_secret_key");
}

export async function api(path, { method = "GET", body, admin = false } = {}) {
  const headers = { "Content-Type": "application/json" };

  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  } catch {
    /* ignore error getting session */
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
