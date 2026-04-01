export function FilterSelect({ label, name, value, options, onChange, disabled, placeholder }) {
  return (
    <div className="filter-field">
      <label className="filter-label" htmlFor={name}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        disabled={disabled}
        className="filter-select"
      >
        <option value="">{placeholder || `All ${label}s`}</option>
        {(options ?? []).map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
