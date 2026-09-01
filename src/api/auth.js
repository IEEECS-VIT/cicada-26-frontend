import { api, setAdminKey } from "./client";

export async function loginWithToken(accessToken) {
  const data = await api("/api/auth/login", { method: "POST", body: { access_token: accessToken } });
  setAdminKey(data.admin_secret_key || null);
  return data;
}

export async function fetchMe() {
  const data = await api("/api/auth/me");
  if (data?.admin_secret_key) {
    setAdminKey(data.admin_secret_key);
  }
  return data;
} //fsjdb

export async function logout() {
  setAdminKey(null);
  try {
    return await api("/api/auth/logout", { method: "POST" });
  } catch {
    return null;
  }
}
//fekerjge
export async function seedUser({ email, display_name, register_no }) {
  return api("/api/auth/seed-user", {
    method: "POST",
    body: { email, display_name, register_no },
    admin: true,
  });
}
