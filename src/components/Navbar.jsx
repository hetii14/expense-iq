import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: "◫" },
  { to: "/expenses", label: "Add Expense", icon: "+" },
  { to: "/history", label: "History", icon: "◷" },
];

function Navbar({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("expensesiq_username");
    navigate("/");
  };

  const username = localStorage.getItem("expensesiq_username") || "Finance Pilot";
  const pageTitle =
    navItems.find((item) => item.to === location.pathname)?.label || "Dashboard";

  return (
    <>
      <aside className="app-sidebar">
        <button type="button" className="brand brand-button" onClick={() => navigate("/dashboard")}>
          <img src={logo} alt="ExpensesIQ Logo" className="brand-logo" />
          <span>
            <strong>ExpensesIQ</strong>
            <small>Premium finance desk</small>
          </span>
        </button>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`sidebar-link ${location.pathname === item.to ? "active-link" : ""}`}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="profile-card">
            <div className="avatar-badge">{username.slice(0, 1).toUpperCase()}</div>
            <div>
              <strong>{username}</strong>
              <small>Track every rupee</small>
            </div>
          </div>
        </div>
      </aside>

      <header className="topbar">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1>{pageTitle}</h1>
        </div>

        <div className="topbar-actions">
          <button
            type="button"
            className="icon-button"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle theme"
          >
            {darkMode ? "Light" : "Dark"}
          </button>
          <button type="button" className="primary-button subtle" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
    </>
  );
}

export default Navbar;
