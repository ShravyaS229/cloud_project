import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { dateText, money } from "../utils";

export default function Admin() {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  const loadAll = () =>
    Promise.all([api("/api/admin/stats"), api("/api/admin/users"), api("/api/admin/products")])
      .then(([s, u, p]) => {
        setStats(s);
        setUsers(u.users);
        setProducts(p.products);
      })
      .catch((e) => setError(e.message));

  useEffect(() => { loadAll(); }, []);

  async function toggleUser(u) {
    try {
      await api(`/api/admin/users/${u.id}/status`, { method: "PATCH", body: { isActive: !u.isActive } });
      loadAll();
    } catch (e) {
      setError(e.message);
    }
  }

  async function removeProduct(p) {
    if (!window.confirm(`Remove "${p.title}"? The seller will no longer see it.`)) return;
    try {
      await api(`/api/admin/products/${p.id}`, { method: "DELETE" });
      loadAll();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <h1>Admin dashboard</h1>
      <div className="tabs">
        {[["overview", "Overview"], ["users", "Students"], ["products", "Listings"]].map(([key, label]) => (
          <button key={key} className={`chip ${tab === key ? "on" : ""}`} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>
      {error && <p className="error">{error}</p>}

      {tab === "overview" && stats && (
        <div className="stats">
          <div className="stat"><strong>{stats.totalUsers}</strong><span>Registered students</span></div>
          <div className="stat"><strong>{stats.activeListings}</strong><span>Active listings</span></div>
          <div className="stat"><strong>{stats.soldProducts}</strong><span>Items sold</span></div>
        </div>
      )}

      {tab === "users" && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Listings</th><th>Joined</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || "—"}</td>
                  <td>{u._count.products}</td>
                  <td>{dateText(u.createdAt)}</td>
                  <td><span className={`badge ${u.isActive ? "live" : "sold"}`}>{u.isActive ? "Active" : "Deactivated"}</span></td>
                  <td className="row-actions">
                    <button className={`link ${u.isActive ? "danger" : ""}`} onClick={() => toggleUser(u)}>
                      {u.isActive ? "Deactivate" : "Reactivate"}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan="7" className="state">No students have registered yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "products" && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Item</th><th>Seller</th><th>Price</th><th>Category</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td><Link to={`/product/${p.id}`}>{p.title}</Link></td>
                  <td>{p.seller.name}</td>
                  <td>{money(p.price)}</td>
                  <td>{p.category.name}</td>
                  <td><span className={`badge ${p.status === "SOLD" ? "sold" : "live"}`}>{p.status === "SOLD" ? "Sold" : "Active"}</span></td>
                  <td className="row-actions">
                    <button className="link danger" onClick={() => removeProduct(p)}>Remove listing</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && <tr><td colSpan="6" className="state">No listings on the platform yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
