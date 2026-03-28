import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";
import API from "../services/api";
import FilterBar from "../components/FilterBar";
import {
  buildInsights,
  buildTrendSeries,
  filterExpenses,
  formatCurrency,
  formatDate,
  getAverageDailySpend,
  getBudgetStatus,
  getHighestCategory,
  groupByCategory,
  normalizeExpenses,
  sortExpenses,
} from "../utils/expenseAnalytics";

ChartJS.register(
  ArcElement,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
);

function Dashboard() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState({ monthly_limit: 0 });
  const [budgetInput, setBudgetInput] = useState("");
  const [isSavingBudget, setIsSavingBudget] = useState(false);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("month");
  const [customRange, setCustomRange] = useState({ from: "", to: "" });
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [budgetRes, expenseRes] = await Promise.all([
          API.get("monthly-budget/"),
          API.get("expenses/"),
        ]);

        setBudget(budgetRes.data?.monthly_limit ? budgetRes.data : { monthly_limit: 0 });
        setBudgetInput(budgetRes.data?.monthly_limit || "");
        setExpenses(normalizeExpenses(expenseRes.data));
      } catch {
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredExpenses = useMemo(
    () =>
      sortExpenses(
        filterExpenses(expenses, { dateFilter, customRange, category, search }),
        sortBy
      ),
    [category, customRange, dateFilter, expenses, search, sortBy]
  );

  const totalSpend = filteredExpenses.reduce((sum, expense) => sum + expense.amountValue, 0);
  const categoryTotals = groupByCategory(filteredExpenses);
  const trendSeries = buildTrendSeries(filteredExpenses, dateFilter === "month" ? "day" : "day", 10);
  const monthlySeries = buildTrendSeries(expenses, "month", 6);
  const topCategory = getHighestCategory(categoryTotals);
  const avgDailySpend = getAverageDailySpend(filteredExpenses);
  const insights = buildInsights(expenses, categoryTotals);
  const budgetStatus = getBudgetStatus(budget.monthly_limit, totalSpend);

  const handleBudgetSave = async () => {
    setIsSavingBudget(true);
    try {
      const response = await API.post("monthly-budget/", { monthly_limit: budgetInput || 0 });
      setBudget(response.data);
      setToast("Monthly budget updated");
    } catch {
      setToast("Could not update budget");
    } finally {
      setIsSavingBudget(false);
    }
  };

  if (loading) {
    return (
      <div className="page-section">
        <section className="glass-panel empty-panel">
          <div className="loader" />
          <p>Loading your premium dashboard...</p>
        </section>
      </div>
    );
  }

  const lineData = {
    labels: trendSeries.map((item) => item.label),
    datasets: [
      {
        label: "Expenses",
        data: trendSeries.map((item) => item.total),
        borderColor: "#2563eb",
        backgroundColor: "rgba(59, 130, 246, 0.16)",
        fill: true,
        tension: 0.38,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const pieData = {
    labels: categoryTotals.map((item) => item.category),
    datasets: [
      {
        data: categoryTotals.map((item) => item.total),
        backgroundColor: ["#2563eb", "#0ea5e9", "#38bdf8", "#7c3aed", "#10b981", "#94a3b8"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="page-section">
      <section className="hero-grid">
        <div className="hero-balance-card">
          <div className="eyebrow">Smart financial overview</div>
          <h2>{formatCurrency(totalSpend)}</h2>
          <p>Total expenses in the selected range</p>
          <div className="hero-balance-meta">
            <span>{filteredExpenses.length} transactions</span>
            <span>{topCategory.category} leads spending</span>
          </div>
        </div>

        <div className="glass-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Monthly trend</p>
              <h3>Expense flow</h3>
            </div>
            <span className="metric-pill">Avg/day {formatCurrency(avgDailySpend)}</span>
          </div>
          <div className="chart-box large">
            <Line
              data={lineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false }, ticks: { color: "#6b7280" } },
                  y: { grid: { color: "rgba(148, 163, 184, 0.18)" }, ticks: { color: "#6b7280" } },
                },
              }}
            />
          </div>
        </div>
      </section>

      <FilterBar
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        customRange={customRange}
        setCustomRange={setCustomRange}
        category={category}
        setCategory={setCategory}
        search={search}
        setSearch={setSearch}
      />

      <section className="stats-grid">
        <article className="glass-panel stat-panel">
          <span className="eyebrow">Range total</span>
          <h3>{formatCurrency(totalSpend)}</h3>
          <p>Dynamic total for your current filters</p>
        </article>
        <article className="glass-panel stat-panel">
          <span className="eyebrow">Highest category</span>
          <h3>{topCategory.category}</h3>
          <p>{formatCurrency(topCategory.total)} in this category</p>
        </article>
        <article className="glass-panel stat-panel">
          <span className="eyebrow">Budget remaining</span>
          <h3>{formatCurrency(budgetStatus.remaining)}</h3>
          <p>{Math.max(0, budgetStatus.percentage).toFixed(0)}% of budget used</p>
        </article>
        <article className="glass-panel stat-panel">
          <span className="eyebrow">Monthly comparison</span>
          <h3>
            {monthlySeries.length >= 2
              ? formatCurrency(monthlySeries[monthlySeries.length - 1].total - monthlySeries[monthlySeries.length - 2].total)
              : formatCurrency(0)}
          </h3>
          <p>Difference vs previous month</p>
        </article>
      </section>

      <section className="content-grid">
        <article className="glass-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Budget tracking</p>
              <h3>Monthly budget</h3>
            </div>
            <span className={`status-chip ${budgetStatus.tone}`}>{budgetStatus.tone}</span>
          </div>
          <div className="budget-bar">
            <div
              className={`budget-fill ${budgetStatus.tone}`}
              style={{ width: `${Math.min(budgetStatus.percentage, 100)}%` }}
            />
          </div>
          <div className="budget-row">
            <strong>{formatCurrency(budgetStatus.total)}</strong>
            <span>of {formatCurrency(budgetStatus.limit || 0)}</span>
          </div>
          <div className="budget-editor">
            <input
              type="number"
              value={budgetInput}
              onChange={(event) => setBudgetInput(event.target.value)}
              placeholder="Set monthly budget"
            />
            <button
              type="button"
              className="primary-button"
              onClick={handleBudgetSave}
              disabled={isSavingBudget}
            >
              {isSavingBudget ? "Saving..." : "Save Budget"}
            </button>
          </div>
          <p className="helper-text">
            {budgetStatus.percentage >= 90
              ? "You are close to your monthly limit."
              : "You are tracking comfortably within your budget."}
          </p>
        </article>

        <article className="glass-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Category split</p>
              <h3>Where your money goes</h3>
            </div>
          </div>
          <div className="chart-box">
            {categoryTotals.length ? (
              <Pie
                data={pieData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "bottom", labels: { color: "#64748b", boxWidth: 10 } },
                  },
                }}
              />
            ) : (
              <div className="empty-chart">Add expenses to see category distribution.</div>
            )}
          </div>
        </article>

        <article className="glass-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Smart insights</p>
              <h3>AI-like nudges</h3>
            </div>
          </div>
          <div className="insight-stack">
            {insights.length ? (
              insights.map((insight) => (
                <div key={insight} className="insight-card">
                  {insight}
                </div>
              ))
            ) : (
              <div className="empty-chart">More spending history will unlock richer insights.</div>
            )}
          </div>
        </article>

        <article className="glass-panel wide-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Transaction history</p>
              <h3>Filtered expense stream</h3>
            </div>
            <select className="table-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="latest">Latest</option>
              <option value="highest">Highest amount</option>
            </select>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Payment</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.slice(0, 12).map((expense) => (
                  <tr key={expense.id}>
                    <td>{formatDate(expense.date)}</td>
                    <td><span className="tag">{expense.category}</span></td>
                    <td>{expense.description || "No description"}</td>
                    <td>{expense.payment_method}</td>
                    <td className="amount-cell">{formatCurrency(expense.amountValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredExpenses.length && <div className="empty-chart">No expenses match this filter.</div>}
          </div>
        </article>
      </section>

      <section className="glass-panel monthly-strip">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Month over month</p>
            <h3>Recent monthly comparison</h3>
          </div>
        </div>
        <div className="monthly-comparison">
          {monthlySeries.map((item) => (
            <div key={item.key} className="mini-metric-card">
              <span>{item.label}</span>
              <strong>{formatCurrency(item.total)}</strong>
            </div>
          ))}
        </div>
      </section>

      {toast && <div className="app-toast">{toast}</div>}
    </div>
  );
}

export default Dashboard;
