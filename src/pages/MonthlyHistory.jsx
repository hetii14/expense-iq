import { useEffect, useMemo, useState } from "react";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";
import API from "../services/api";
import { formatCurrency, formatDate } from "../utils/expenseAnalytics";

ChartJS.register(ArcElement, Tooltip, Legend);

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function MonthlyHistory() {
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);

  useEffect(() => {
    const loadMonths = async () => {
      try {
        const res = await API.get("month-history/");
        setMonths(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    loadMonths();
  }, []);

  const fetchMonthDetail = async (year, month) => {
    try {
      const res = await API.get(`month-history/${year}/${month}/`);
      setSelectedMonth(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const downloadReport = async (year, month) => {
    try {
      const response = await API.get(`download-report/${year}/${month}/`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Monthly_Report_${month}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const pieData = useMemo(() => {
    if (!selectedMonth) return null;

    return {
      labels: selectedMonth.category_breakdown.map((item) => item.category),
      datasets: [
        {
          data: selectedMonth.category_breakdown.map((item) => item.total),
          backgroundColor: ["#2563eb", "#0ea5e9", "#38bdf8", "#7c3aed", "#10b981", "#94a3b8"],
          borderWidth: 0,
        },
      ],
    };
  }, [selectedMonth]);

  return (
    <div className="page-section">
      {!selectedMonth && (
        <section className="content-grid single-column">
          <article className="glass-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Stored reports</p>
                <h3>Monthly history</h3>
              </div>
            </div>
            <div className="report-grid">
              {months.length ? (
                months.map((month) => (
                  <button
                    key={month.id}
                    type="button"
                    className="report-card"
                    onClick={() => fetchMonthDetail(month.year, month.month)}
                  >
                    <span>{MONTH_NAMES[month.month - 1]}</span>
                    <strong>{month.year}</strong>
                    <small>Open report</small>
                  </button>
                ))
              ) : (
                <div className="empty-chart">No archived reports are available yet.</div>
              )}
            </div>
          </article>
        </section>
      )}

      {selectedMonth && (
        <>
          <section className="history-actions-row">
            <button type="button" className="icon-button" onClick={() => setSelectedMonth(null)}>
              Back
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() =>
                downloadReport(selectedMonth.report.year, selectedMonth.report.month)
              }
            >
              Export PDF
            </button>
          </section>

          <section className="stats-grid">
            <article className="glass-panel stat-panel">
              <span className="eyebrow">Total spent</span>
              <h3>{formatCurrency(selectedMonth.report.total_spent)}</h3>
            </article>
            <article className="glass-panel stat-panel">
              <span className="eyebrow">Budget limit</span>
              <h3>{formatCurrency(selectedMonth.report.budget_limit)}</h3>
            </article>
            <article className="glass-panel stat-panel">
              <span className="eyebrow">Remaining</span>
              <h3>{formatCurrency(selectedMonth.report.remaining_amount)}</h3>
            </article>
            <article className="glass-panel stat-panel">
              <span className="eyebrow">Top category</span>
              <h3>{selectedMonth.report.top_category}</h3>
            </article>
          </section>

          <section className="content-grid">
            <article className="glass-panel">
              <div className="panel-head">
                <div>
                  <p className="eyebrow">Category distribution</p>
                  <h3>{MONTH_NAMES[selectedMonth.report.month - 1]} snapshot</h3>
                </div>
              </div>
              <div className="chart-box">
                <Pie
                  data={pieData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "bottom", labels: { color: "#64748b", boxWidth: 10 } },
                    },
                  }}
                />
              </div>
            </article>

            <article className="glass-panel wide-panel">
              <div className="panel-head">
                <div>
                  <p className="eyebrow">Expense ledger</p>
                  <h3>Transactions</h3>
                </div>
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
                    {selectedMonth.expenses.map((expense, index) => (
                      <tr key={`${expense.date}-${index}`}>
                        <td>{formatDate(expense.date)}</td>
                        <td><span className="tag">{expense.category}</span></td>
                        <td>{expense.description || "No description"}</td>
                        <td>{expense.payment_method}</td>
                        <td className="amount-cell">{formatCurrency(expense.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        </>
      )}
    </div>
  );
}

export default MonthlyHistory;
