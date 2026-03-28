const CATEGORY_ORDER = ["Food", "Travel", "Shopping", "Bills", "Entertainment", "Other"];

export const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export const formatDate = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

export const toTitleCase = (value = "") =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

export const getDateRangeFromFilter = (filter, customRange = {}) => {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (filter === "week") {
    const day = start.getDay();
    const diff = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - diff);
  } else if (filter === "month") {
    start.setDate(1);
  } else if (filter === "custom") {
    const customStart = customRange.from ? new Date(customRange.from) : null;
    const customEnd = customRange.to ? new Date(customRange.to) : null;

    if (customStart) {
      customStart.setHours(0, 0, 0, 0);
    }

    if (customEnd) {
      customEnd.setHours(23, 59, 59, 999);
    }

    return { start: customStart, end: customEnd };
  }

  return { start, end };
};

export const normalizeExpenses = (expenses = []) =>
  expenses.map((expense, index) => ({
    ...expense,
    id: expense.id ?? `${expense.date}-${expense.amount}-${index}`,
    amountValue: Number.parseFloat(expense.amount) || 0,
    dateValue: new Date(expense.date),
  }));

export const filterExpenses = (expenses, filters) => {
  const { dateFilter, customRange, category, search } = filters;
  const { start, end } = getDateRangeFromFilter(dateFilter, customRange);
  const searchTerm = search.trim().toLowerCase();

  return expenses.filter((expense) => {
    const expenseDate = expense.dateValue;
    const inRange =
      (!start || expenseDate >= start) &&
      (!end || expenseDate <= end);

    const inCategory = category === "All" || expense.category === category;

    const inSearch =
      !searchTerm ||
      expense.category.toLowerCase().includes(searchTerm) ||
      (expense.description || "").toLowerCase().includes(searchTerm);

    return inRange && inCategory && inSearch;
  });
};

export const sortExpenses = (expenses, sortBy) => {
  const cloned = [...expenses];

  if (sortBy === "highest") {
    return cloned.sort((a, b) => b.amountValue - a.amountValue);
  }

  return cloned.sort((a, b) => b.dateValue - a.dateValue);
};

export const groupByCategory = (expenses) =>
  CATEGORY_ORDER.map((category) => ({
    category,
    total: expenses
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + expense.amountValue, 0),
  })).filter((item) => item.total > 0);

export const buildTrendSeries = (expenses, mode = "day", limit = 8) => {
  const map = new Map();

  expenses.forEach((expense) => {
    const date = expense.dateValue;
    const key =
      mode === "month"
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
            date.getDate()
          ).padStart(2, "0")}`;

    map.set(key, (map.get(key) || 0) + expense.amountValue);
  });

  return [...map.entries()]
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .slice(-limit)
    .map(([key, total]) => ({
      key,
      label:
        mode === "month"
          ? new Intl.DateTimeFormat("en-IN", { month: "short" }).format(new Date(`${key}-01`))
          : new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(
              new Date(key)
            ),
      total,
    }));
};

export const getHighestCategory = (categoryTotals) =>
  categoryTotals.reduce(
    (highest, item) => (item.total > highest.total ? item : highest),
    { category: "None", total: 0 }
  );

export const getAverageDailySpend = (expenses) => {
  if (!expenses.length) return 0;

  const uniqueDays = new Set(
    expenses.map((expense) => expense.dateValue.toISOString().slice(0, 10))
  ).size;

  const total = expenses.reduce((sum, expense) => sum + expense.amountValue, 0);
  return total / Math.max(uniqueDays, 1);
};

export const getMonthlyTotals = (expenses, monthOffset = 0) => {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);

  return expenses
    .filter(
      (expense) =>
        expense.dateValue.getFullYear() === target.getFullYear() &&
        expense.dateValue.getMonth() === target.getMonth()
    )
    .reduce((sum, expense) => sum + expense.amountValue, 0);
};

export const buildInsights = (expenses, categoryTotals) => {
  const insights = [];
  const currentMonth = getMonthlyTotals(expenses, 0);
  const lastMonth = getMonthlyTotals(expenses, -1);

  if (lastMonth > 0) {
    const percentage = ((currentMonth - lastMonth) / lastMonth) * 100;
    if (Math.abs(percentage) >= 5) {
      insights.push(
        percentage > 0
          ? `Your total spending is ${Math.round(percentage)}% higher than last month.`
          : `Nice work, your total spending is down ${Math.round(Math.abs(percentage))}% from last month.`
      );
    }
  }

  const topCategory = getHighestCategory(categoryTotals);
  if (topCategory.total > 0) {
    insights.push(
      `${topCategory.category} is leading your spending at ${formatCurrency(topCategory.total)}.`
    );
  }

  CATEGORY_ORDER.forEach((category) => {
    const current = expenses
      .filter(
        (expense) =>
          expense.category === category &&
          expense.dateValue.getMonth() === new Date().getMonth() &&
          expense.dateValue.getFullYear() === new Date().getFullYear()
      )
      .reduce((sum, expense) => sum + expense.amountValue, 0);

    const previousDate = new Date();
    previousDate.setMonth(previousDate.getMonth() - 1);

    const previous = expenses
      .filter(
        (expense) =>
          expense.category === category &&
          expense.dateValue.getMonth() === previousDate.getMonth() &&
          expense.dateValue.getFullYear() === previousDate.getFullYear()
      )
      .reduce((sum, expense) => sum + expense.amountValue, 0);

    if (previous > 0) {
      const change = ((current - previous) / previous) * 100;
      if (change >= 20) {
        insights.push(`${category} spending jumped ${Math.round(change)}% versus last month.`);
      }
    }
  });

  return insights.slice(0, 4);
};

export const getBudgetStatus = (budgetLimit, totalSpent) => {
  const limit = Number.parseFloat(budgetLimit) || 0;
  const total = Number(totalSpent) || 0;
  const percentage = limit > 0 ? (total / limit) * 100 : 0;
  const remaining = limit - total;

  let tone = "safe";
  if (percentage >= 75) tone = "warning";
  if (percentage >= 100) tone = "danger";

  return { limit, total, percentage, remaining, tone };
};

