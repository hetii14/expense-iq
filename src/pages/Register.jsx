import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();

    try {
      await axios.post("http://127.0.0.1:8000/api/register/", form);
      alert("Registered Successfully!");
      navigate("/login");
    } catch {
      alert("Registration failed");
    }
  };

  return (
    <div className="auth-layout">
      <section className="auth-showcase">
        <span className="eyebrow pill">Start free</span>
        <h1>Build better money habits with a dashboard that feels premium.</h1>
        <p>
          Create your account to unlock beautiful analytics, budget control, smart history, and streamlined tracking.
        </p>
      </section>

      <section className="auth-card">
        <div>
          <p className="eyebrow">New account</p>
          <h2>Create account</h2>
        </div>

        <form className="auth-form" onSubmit={handleRegister}>
          <label className="field-group">
            <span>Username</span>
            <input
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
              required
            />
          </label>
          <label className="field-group">
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>
          <label className="field-group">
            <span>Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>
          <button type="submit" className="primary-button">
            Create Account
          </button>
        </form>

        <p className="auth-footer">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </div>
  );
}

export default Register;
