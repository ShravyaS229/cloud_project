import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand">Campus<span>Market</span></Link>
        <nav className="nav-links">
          <NavLink to="/" end>Browse</NavLink>
          {user && <NavLink to="/sell">Sell an item</NavLink>}
          {user && <NavLink to="/my-listings">My listings</NavLink>}
          {user?.role === "ADMIN" && <NavLink to="/admin">Admin</NavLink>}
        </nav>
        <div className="nav-user">
          {user ? (
            <>
              <span className="hello">{user.name}</span>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Log in</Link>
              <Link to="/register" className="btn">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
