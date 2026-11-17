import { Link } from "react-router-dom";
import { CONDITION_LABELS, money } from "../utils";

export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.id}`} className="card">
      <div className="card-img">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.title} loading="lazy" />
        ) : (
          <div className="img-fallback">{product.title.charAt(0).toUpperCase()}</div>
        )}
        <span className="tag">{money(product.price)}</span>
        {product.type === "EXCHANGE" && <span className="swap">Exchange</span>}
      </div>
      <div className="card-body">
        <h3>{product.title}</h3>
        <p className="muted">
          {product.category?.name} · {CONDITION_LABELS[product.condition]}
        </p>
        {product.seller && <p className="muted small">Sold by {product.seller.name}</p>}
      </div>
    </Link>
  );
}
