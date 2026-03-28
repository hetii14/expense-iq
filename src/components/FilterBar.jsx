function FilterBar({
  dateFilter,
  setDateFilter,
  customRange,
  setCustomRange,
  category,
  setCategory,
  search,
  setSearch,
}) {
  const dateOptions = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "custom", label: "Custom" },
  ];

  const categories = ["All", "Food", "Travel", "Shopping", "Bills", "Entertainment", "Other"];

  return (
    <div className="filter-panel">
      <div className="filter-chip-row">
        {dateOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`filter-chip ${dateFilter === option.value ? "active" : ""}`}
            onClick={() => setDateFilter(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="filter-grid">
        {dateFilter === "custom" && (
          <>
            <label className="field-group">
              <span>From</span>
              <input
                type="date"
                value={customRange.from}
                onChange={(event) =>
                  setCustomRange((previous) => ({ ...previous, from: event.target.value }))
                }
              />
            </label>
            <label className="field-group">
              <span>To</span>
              <input
                type="date"
                value={customRange.to}
                onChange={(event) =>
                  setCustomRange((previous) => ({ ...previous, to: event.target.value }))
                }
              />
            </label>
          </>
        )}

        <label className="field-group">
          <span>Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="field-group search-field">
          <span>Search</span>
          <input
            type="search"
            placeholder="Search by name or category"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

export default FilterBar;
