import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { CONDITION_LABELS, money } from "../utils";

export default function MyListings() {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState("");

  const load = () =>
    api("/api/products/mine")
      .then((d) => setProducts(d.products))
      .catch((e) => setError(e.message));

  useEffect(() => { load(); }, []);

  async function markSold(id) {
    try {
      await api(`/api/products/${id}/sold`, { method: "PATCH" });
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this listing? This cannot be undone.")) return;
    try {
      await api(`/api/products/${id}`, { method: "DELETE" });
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  if (!products) return error ? <p className="error">{error}</p> : <p className="state">Loading…</p>;

  return (
    <>
      <div className="head">
        <h1>My listings</h1>
        <Link className="btn" to="/sell">Add a listing</Link>
      </div>
      {error && <p className="error">{error}</p>}
      {products.length === 0 ? (
        <p className="state">You haven't listed anything yet. <Link to="/sell">Sell your first item.</Link></p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Item</th><th>Price</th><th>Condition</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td><Link to={`/product/${p.id}`}>{p.title}</Link></td>
                  <td>{money(p.price)}</td>
                  <td>{CONDITION_LABELS[p.condition]}</td>
                  <td><span className={`badge ${p.status === "SOLD" ? "sold" : "live"}`}>{p.status === "SOLD" ? "Sold" : "Active"}</span></td>
                  <td className="row-actions">
                    <Link className="link" to={`/sell/${p.id}`}>Edit</Link>
                    {p.status !== "SOLD" && <button className="link" onClick={() => markSold(p.id)}>Mark as sold</button>}
                    <button className="link danger" onClick={() => remove(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
