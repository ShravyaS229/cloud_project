import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form narrow" onSubmit={submit}>
      <h1>Create your account</h1>
      <label>Full name
        <input required value={form.name} onChange={set("name")} />
      </label>
      <label>College email
        <input type="email" required value={form.email} onChange={set("email")} />
      </label>
      <label>Phone number
        <input type="tel" value={form.phone} onChange={set("phone")} placeholder="Buyers will use this to reach you" />
      </label>
      <label>Password
        <input type="password" required minLength={6} value={form.password} onChange={set("password")} />
      </label>
      {error && <p className="error">{error}</p>}
      <button className="btn" disabled={busy}>{busy ? "Creating account…" : "Sign up"}</button>
      <p className="muted">Already registered? <Link to="/login">Log in</Link></p>
    </form>
  );
}
