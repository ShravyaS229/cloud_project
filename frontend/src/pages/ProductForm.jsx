import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { CONDITION_LABELS } from "../utils";

const EMPTY = {
  title: "",
  description: "",
  price: "",
  condition: "GOOD",
  type: "SELL",
  categoryId: "",
  imageUrl: "",
};

// Used for both "Sell an item" (/sell) and "Edit listing" (/sell/:id)
export default function ProductForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api("/api/categories").then((d) => setCategories(d.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!editing) return;
    api(`/api/products/${id}`)
      .then(({ product: p }) =>
        setForm({
          title: p.title,
          description: p.description,
          price: String(Number(p.price)),
          condition: p.condition,
          type: p.type,
          categoryId: String(p.categoryId),
          imageUrl: p.imageUrl || "",
        })
      )
      .catch((e) => setError(e.message));
  }, [editing, id]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function onImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const data = new FormData();
      data.append("image", file);
      const res = await api("/api/upload", { method: "POST", form: data });
      setForm((f) => ({ ...f, imageUrl: res.imageUrl }));
    } catch (err) {
      setError(`${err.message} You can still publish the listing without a photo.`);
    } finally {
      setUploading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const path = editing ? `/api/products/${id}` : "/api/products";
      const res = await api(path, { method: editing ? "PUT" : "POST", body: form });
      navigate(`/product/${res.product.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <h1>{editing ? "Edit your listing" : "Sell or exchange an item"}</h1>

      <label>Title
        <input required value={form.title} onChange={set("title")} placeholder="Casio fx-991EX scientific calculator" />
      </label>

      <label>Description
        <textarea required rows={4} value={form.description} onChange={set("description")}
          placeholder="How old is it, what is its condition, anything included?" />
      </label>

      <div className="row">
        <label>Price (₹)
          <input type="number" min="0" required value={form.price} onChange={set("price")} />
        </label>
        <label>Category
          <select required value={form.categoryId} onChange={set("categoryId")}>
            <option value="">Choose a category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
      </div>

      <div className="row">
        <label>Condition
          <select value={form.condition} onChange={set("condition")}>
            {Object.entries(CONDITION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label>Listing type
          <select value={form.type} onChange={set("type")}>
            <option value="SELL">For sale</option>
            <option value="EXCHANGE">Open to exchange</option>
          </select>
        </label>
      </div>

      <label>Photo
        <input type="file" accept="image/*" onChange={onImage} />
      </label>
      {uploading && <p className="muted">Uploading photo…</p>}
      {form.imageUrl && <img className="preview" src={form.imageUrl} alt="Product preview" />}

      {error && <p className="error">{error}</p>}
      <button className="btn" disabled={busy || uploading}>
        {busy ? "Saving…" : editing ? "Save changes" : "Publish listing"}
      </button>
    </form>
  );
}
