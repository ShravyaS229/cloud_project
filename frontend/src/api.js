// REPLACE: set VITE_API_URL in frontend/.env to your backend address
// (http://localhost:5000 locally, your Render URL after deployment)
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function api(path, { method = "GET", body, form } = {}) {
  const headers = {};
  const token = localStorage.getItem("token");
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (form) {
    payload = form; // FormData: browser sets the content type
  } else if (body) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, body: payload });
  } catch {
    throw new Error("Cannot reach the server. Check that the backend is running.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}
