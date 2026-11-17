import { useEffect, useState } from "react";
import { api } from "../api";
import ProductCard from "../components/ProductCard.jsx";
import { CONDITION_LABELS } from "../utils";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    q: "",
    category: "",
    condition: "",
    type: "",
    minPrice: "",
    maxPrice: "",
  });

  useEffect(() => {
    api("/api/categories").then((d) => setCategories(d.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));

    setLoading(true);
    const timer = setTimeout(() => {
      api(`/api/products?${params.toString()}`)
        .then((d) => {
          setProducts(d.products);
          setError("");
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [filters]);

  const set = (key) => (e) => setFilters({ ...filters, [key]: e.target.value });
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <>
      <section className="hero">
        <h1>Someone on campus already has what you need.</h1>
        <p>Buy, sell and swap textbooks, calculators, furniture and more with students at your college.</p>
        <input
          className="search"
          type="search"
          placeholder="Search for a calculator, a textbook, a lamp…"
          value={filters.q}
          onChange={set("q")}
          aria-label="Search products"
        />
        <div className="chips">
          <button
            className={`chip ${filters.category === "" ? "on" : ""}`}
            onClick={() => setFilters({ ...filters, category: "" })}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`chip ${String(filters.category) === String(c.id) ? "on" : ""}`}
              onClick={() => setFilters({ ...filters, category: String(c.id) })}
            >
              {c.name}
            </button>
          ))}
        </div>
      </section>

      <section className="filters">
        <select value={filters.condition} onChange={set("condition")} aria-label="Condition">
          <option value="">Any condition</option>
          {Object.entries(CONDITION_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select value={filters.type} onChange={set("type")} aria-label="Listing type">
          <option value="">Sale and exchange</option>
          <option value="SELL">For sale</option>
          <option value="EXCHANGE">For exchange</option>
        </select>
        <input type="number" min="0" placeholder="Min price" value={filters.minPrice} onChange={set("minPrice")} />
        <input type="number" min="0" placeholder="Max price" value={filters.maxPrice} onChange={set("maxPrice")} />
        {hasFilters && (
          <button
            className="btn btn-ghost"
            onClick={() => setFilters({ q: "", category: "", condition: "", type: "", minPrice: "", maxPrice: "" })}
          >
            Clear filters
          </button>
        )}
      </section>

      {error && <p className="error">{error}</p>}
      {loading && !products.length ? (
        <p className="state">Loading listings…</p>
      ) : products.length === 0 ? (
        <p className="state">
          {hasFilters ? "No listings match these filters. Try removing one." : "No listings yet. Be the first to sell something."}
        </p>
      ) : (
        <section className="grid">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </section>
      )}
    </>
  );
}
