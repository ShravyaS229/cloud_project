import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "ADMIN" ? "/admin" : "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form narrow" onSubmit={submit}>
      <h1>Log in</h1>
      <label>Email
        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </label>
      <label>Password
        <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      </label>
      {error && <p className="error">{error}</p>}
      <button className="btn" disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
      <p className="muted">New here? <Link to="/register">Create an account</Link></p>
    </form>
  );
}
