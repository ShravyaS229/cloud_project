import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext.jsx";
import { CONDITION_LABELS, dateText, money } from "../utils";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api(`/api/products/${id}`)
      .then((d) => setProduct(d.product))
      .catch((e) => setError(e.message));
  }, [id]);

  async function markSold() {
    try {
      const d = await api(`/api/products/${id}/sold`, { method: "PATCH" });
      setProduct({ ...product, status: d.product.status });
    } catch (e) {
      setError(e.message);
    }
  }

  async function remove() {
    if (!window.confirm("Delete this listing? This cannot be undone.")) return;
    try {
      await api(`/api/products/${id}`, { method: "DELETE" });
      navigate("/my-listings");
    } catch (e) {
      setError(e.message);
    }
  }

  if (error && !product) return <p className="error">{error}</p>;
  if (!product) return <p className="state">Loading…</p>;

  const isOwner = user && user.id === product.seller.id;
  const sold = product.status === "SOLD";

  return (
    <article className="detail">
      <div className="detail-img">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.title} />
        ) : (
          <div className="img-fallback big">{product.title.charAt(0).toUpperCase()}</div>
        )}
      </div>

      <div className="detail-info">
        {sold && <span className="badge sold">Sold</span>}
        <h1>{product.title}</h1>
        <p className="price">{money(product.price)}</p>
        <p className="muted">
          {product.category.name} · {CONDITION_LABELS[product.condition]} ·{" "}
          {product.type === "EXCHANGE" ? "Open to exchange" : "For sale"}
        </p>
        <p className="desc">{product.description}</p>
        <p className="muted small">Listed on {dateText(product.createdAt)}</p>

        <div className="seller">
          <h3>Contact the seller</h3>
          <p><strong>{product.seller.name}</strong></p>
          {user ? (
            <>
              {product.seller.phone && (
                <p>Phone: <a href={`tel:${product.seller.phone}`}>{product.seller.phone}</a></p>
              )}
              <p>Email: <a href={`mailto:${product.seller.email}`}>{product.seller.email}</a></p>
              <p className="muted small">Agree on price and payment directly with the seller.</p>
            </>
          ) : (
            <p><Link to="/login">Log in</Link> to see the seller's phone and email.</p>
          )}
        </div>

        {error && <p className="error">{error}</p>}
        {isOwner && (
          <div className="actions">
            <Link className="btn" to={`/sell/${product.id}`}>Edit listing</Link>
            {!sold && <button className="btn btn-ghost" onClick={markSold}>Mark as sold</button>}
            <button className="btn btn-danger" onClick={remove}>Delete</button>
          </div>
        )}
      </div>
    </article>
  );
}
