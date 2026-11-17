import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ProductForm from "./pages/ProductForm.jsx";
import MyListings from "./pages/MyListings.jsx";
import Admin from "./pages/Admin.jsx";

function Protected({ children, admin }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="state">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== "ADMIN") return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/sell" element={<Protected><ProductForm /></Protected>} />
          <Route path="/sell/:id" element={<Protected><ProductForm /></Protected>} />
          <Route path="/my-listings" element={<Protected><MyListings /></Protected>} />
          <Route path="/admin" element={<Protected admin><Admin /></Protected>} />
          <Route path="*" element={<p className="state">Page not found.</p>} />
        </Routes>
      </main>
    </>
  );
}
