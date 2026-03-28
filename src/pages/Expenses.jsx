import { useEffect, useState } from "react";
import API from "../services/api";
import { formatCurrency } from "../utils/expenseAnalytics";

const categories = ["Food", "Shopping", "Travel", "Bills", "Entertainment", "Other"];
const paymentMethods = ["Credit Card", "Debit Card", "GPay", "UPI", "Cash", "Net Banking"];

function Expenses() {
  const [manual, setManual] = useState({
    amount: "",
    category: "Food",
    description: "",
    payment_method: "UPI",
  });
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleManualSubmit = async () => {
    if (!manual.amount || Number(manual.amount) <= 0) {
      setError("Enter a valid amount to continue.");
      return;
    }

    try {
      await API.post("expenses/", manual);
      setToast("Expense added successfully");
      setError("");
      setManual({
        amount: "",
        category: "Food",
        description: "",
        payment_method: "UPI",
      });
    } catch (err) {
      alert(JSON.stringify(err.response?.data || "Something went wrong"));
    }
  };

  return (
    <div className="page-section">
      <section className="content-grid single-column">
        <article className="glass-panel form-panel compact-expense-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Manual entry</p>
              <h3>Add transaction</h3>
            </div>
            <div className="compact-preview">
              <span>{manual.category}</span>
              <strong>{formatCurrency(manual.amount || 0)}</strong>
            </div>
          </div>

          <div className="form-grid">
            <label className="field-group">
              <span>Amount</span>
              <input
                type="number"
                placeholder="0"
                value={manual.amount}
                onChange={(event) => {
                  setManual({ ...manual, amount: event.target.value });
                  setError("");
                }}
              />
            </label>

            <label className="field-group">
              <span>Title / Notes</span>
              <input
                type="text"
                placeholder="Lunch, cab, groceries..."
                value={manual.description}
                onChange={(event) => setManual({ ...manual, description: event.target.value })}
              />
            </label>
          </div>

          <div className="selector-group">
            <span className="field-label">Category</span>
            <div className="selector-row scroll-row">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`selector-pill ${manual.category === item ? "active" : ""}`}
                  onClick={() => setManual({ ...manual, category: item })}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="selector-group">
            <span className="field-label">Payment method</span>
            <div className="selector-row scroll-row">
              {paymentMethods.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`selector-pill ${manual.payment_method === item ? "active" : ""}`}
                  onClick={() => setManual({ ...manual, payment_method: item })}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="inline-error">{error}</p>}

          <button
            type="button"
            className="primary-button"
            onClick={handleManualSubmit}
            disabled={!manual.amount || !manual.category || !manual.payment_method}
          >
            Add Expense
          </button>
        </article>
      </section>

      {toast && <div className="app-toast">{toast}</div>}
    </div>
  );
}

export default Expenses;
