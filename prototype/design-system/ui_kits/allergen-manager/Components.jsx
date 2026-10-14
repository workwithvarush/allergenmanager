/* global React, Icon */
// Atomic UI components — leans on kit.css for visual styling.

function Button({ variant = "primary", size, icon, iconAfter, children, disabled, onClick, type = "button", style, className }) {
  const cls = ["btn", `btn-${variant}`, size ? `btn-${size}` : "", className || ""].filter(Boolean).join(" ");
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled} style={style}>
      {icon && <Icon name={icon} size={size === "lg" ? 16 : 14} style={{ marginRight: 0 }} />}
      {children}
      {iconAfter && <Icon name={iconAfter} size={14} />}
    </button>
  );
}

function Field({ label, hint, error, badge, children, autoFill }) {
  return (
    <div className="field">
      <label className="field-label">
        {label}
        {badge && <span className="input-auto-badge">{badge}</span>}
      </label>
      {children}
      {error
        ? <span className="field-error">{error}</span>
        : hint
          ? <span className="field-hint">{hint}</span>
          : null}
    </div>
  );
}

function Input({ value, onChange, placeholder, readOnly, error, auto, type = "text" }) {
  const cls = ["input", error ? "error" : "", auto ? "auto" : ""].filter(Boolean).join(" ");
  return (
    <input
      className={cls}
      type={type}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
    />
  );
}

function Tag({ kind, children }) {
  return <span className={`tag tag-${kind}`}>{children}</span>;
}

function TagToggle({ kind, active, onClick, children }) {
  const cls = ["tag-toggle", active ? `on-${kind}` : ""].join(" ");
  return (
    <button type="button" className={cls} onClick={onClick}>
      {children}
    </button>
  );
}

function Badge({ kind = "neutral", dot, mono, children }) {
  return (
    <span
      className={`badge badge-${kind}`}
      style={mono ? { fontFamily: "var(--font-mono)" } : undefined}
    >
      {dot && <span className="badge-dot"></span>}
      {children}
    </span>
  );
}

function Banner({ kind = "info", icon, children }) {
  const defaultIcon = { warn: "warning", danger: "close", success: "check", info: "info" }[kind] || "info";
  return (
    <div className={`banner banner-${kind}`}>
      <Icon name={icon || defaultIcon} size={16} style={{ flexShrink: 0, marginTop: 1 }} />
      <span>{children}</span>
    </div>
  );
}

function Card({ children, small, style }) {
  return <div className={`card${small ? " card-sm" : ""}`} style={style}>{children}</div>;
}

function CardHeader({ title, sub, right }) {
  return (
    <div className="card-header">
      <div>
        <div className="card-title">{title}</div>
        {sub && <div className="card-sub">{sub}</div>}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

function StatCard({ num, label }) {
  return (
    <div className="stat-card">
      <div className="stat-card-num">{num}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}

function VersionStamp({ children }) {
  return <span className="version-stamp">{children}</span>;
}

function ProgressBar({ value, max = 100, complete }) {
  const pct = Math.min(100, (value / max) * 100);
  const isComplete = complete ?? pct >= 100;
  return (
    <div className="progress-track">
      <div
        className={`progress-fill${isComplete ? " complete" : ""}`}
        style={{ width: `${pct}%` }}
      ></div>
    </div>
  );
}

function AllergenCell({ name, state = "absent", onClick }) {
  const cls = ["allergen-cell", state === "present" ? "present" : state === "may" ? "may" : ""].filter(Boolean).join(" ");
  return (
    <button type="button" className={cls} onClick={onClick} style={{ font: "inherit", fontFamily: "var(--font-sans)" }}>
      {name}{state === "present" ? " ✕" : ""}
    </button>
  );
}

function DocRow({ title, meta, status, statusLabel, onPreview }) {
  return (
    <div className="doc-row">
      <div className="doc-icon-box"><Icon name="document" size={16} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg-2)" }}>{title}</div>
        <div style={{ fontSize: 11, color: "var(--fg-4)", marginTop: 2, fontFamily: "var(--font-mono)" }}>{meta}</div>
      </div>
      <Badge kind={status} dot>{statusLabel}</Badge>
      <Button variant="secondary" size="sm" onClick={onPreview}>Preview</Button>
    </div>
  );
}

Object.assign(window, {
  Button, Field, Input, Tag, TagToggle, Badge, Banner,
  Card, CardHeader, StatCard, VersionStamp, ProgressBar,
  AllergenCell, DocRow,
});
