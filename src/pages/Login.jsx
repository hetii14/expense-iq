import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/token/", {
        username: username.trim(),
        password,
      });

      localStorage.setItem("token", res.data.access);
      localStorage.setItem("expensesiq_username", username.trim());
      navigate("/dashboard");
    } catch {
      alert("Invalid username or password");
    }
  };

  return (
    <div className="auth-layout">
      <section className="auth-showcase">
        <span className="eyebrow pill">Secure sign in</span>
        <h1>Return to your finance cockpit.</h1>
        <p>
          Review budgets, compare monthly movement, and search every expense from one premium dashboard.
        </p>
      </section>

      <section className="auth-card">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h2>Sign in</h2>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <label className="field-group">
            <span>Username</span>
            <input value={username} onChange={(event) => setUsername(event.target.value)} required />
          </label>
          <label className="field-group">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button type="submit" className="primary-button">
            Sign In
          </button>
        </form>

        <p className="auth-footer">
          No account yet? <Link to="/register">Create one</Link>
        </p>
      </section>
    </div>
  );
}

export default Login;
