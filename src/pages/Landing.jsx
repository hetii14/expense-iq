import { Link } from "react-router-dom";
import heroImage from "../assets/landing.png";

function Landing() {
  return (
    <div className="marketing-page">
      <header className="marketing-nav">
        <div className="marketing-brand">ExpensesIQ</div>
        <div className="marketing-actions">
          <Link className="ghost-link" to="/login">
            Sign In
          </Link>
          <Link className="primary-button" to="/register">
            Get Started
          </Link>
        </div>
      </header>

      <section className="marketing-hero">
        <div className="marketing-copy">
          <span className="eyebrow pill">Premium finance dashboard</span>
          <h1>Track, analyze, and control every expense with fintech-grade clarity.</h1>
          <p>
            ExpensesIQ turns daily spending into a polished command center with smart insights,
            monthly trends, budget guidance, and export-ready reporting.
          </p>
          <div className="marketing-actions">
            <Link className="primary-button" to="/register">
              Create Account
            </Link>
            <Link className="ghost-link" to="/login">
              Open Dashboard
            </Link>
          </div>
          <div className="marketing-metrics">
            <div>
              <strong>Dynamic filters</strong>
              <span>Today, week, month, or custom range</span>
            </div>
            <div>
              <strong>Smart insights</strong>
              <span>Category and trend-based guidance</span>
            </div>
          </div>
        </div>

        <div className="marketing-visual">
          <div className="floating-card">
            <span>Monthly spend</span>
            <strong>₹48,240</strong>
            <small>12% lower than last month</small>
          </div>
          <img src={heroImage} alt="ExpensesIQ dashboard preview" />
        </div>
      </section>

      <section className="feature-row">
        <article className="glass-panel">
          <p className="eyebrow">Analytics</p>
          <h3>Smooth charts with real filters</h3>
          <p>Line and pie analytics respond instantly to date range, category, and search.</p>
        </article>
        <article className="glass-panel">
          <p className="eyebrow">Budgeting</p>
          <h3>Stay ahead of overspending</h3>
          <p>Set your monthly limit, track remaining budget, and get warning states near the cap.</p>
        </article>
        <article className="glass-panel">
          <p className="eyebrow">Reporting</p>
          <h3>History with export support</h3>
          <p>Review archived months and export clean PDF reports without leaving the app.</p>
        </article>
      </section>
    </div>
  );
}

export default Landing;
