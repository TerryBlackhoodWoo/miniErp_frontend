import { useState } from 'react';

// 원화 포맷
export const won = (n) => "₩" + Math.round(n).toLocaleString("ko-KR");
export const wonShort = (n) => {
  if (n >= 100000000) return (n / 100000000).toFixed(1).replace(/\.0$/, "") + "억";
  if (n >= 10000) return Math.round(n / 10000).toLocaleString("ko-KR") + "만";
  return n.toLocaleString("ko-KR");
};
export const num = (n) => n.toLocaleString("ko-KR");

export function SectionTitle({ kicker, title, right }) {
  return (
    <div className="section-title">
      <div>
        <div className="section-kicker">{kicker}</div>
        <h2>{title}</h2>
      </div>
      {right ? <div className="section-right">{right}</div> : null}
    </div>
  );
}

export function Card({ children, className = "", style }) {
  return <div className={"card " + className} style={style}>{children}</div>;
}

export function StatCard({ label, value, unit, sub, tone = "default", accent = false }) {
  return (
    <div className={"stat" + (accent ? " stat--accent" : "")}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {value}
        {unit ? <span className="stat-unit">{unit}</span> : null}
      </div>
      {sub ? <div className={"stat-sub stat-sub--" + tone}>{sub}</div> : null}
    </div>
  );
}

export function Badge({ tone, children }) {
  return <span className={"badge badge--" + tone}>{children}</span>;
}

export function BarChart({ data, max, valueKey = "amt", labelKey = "d" }) {
  const top = max || Math.max(...data.map((d) => d[valueKey]));
  return (
    <div className="barchart">
      {data.map((d, i) => (
        <div className="bar-col" key={i} title={won(d[valueKey])}>
          <div className="bar-track">
            <div className="bar-fill" style={{ height: (d[valueKey] / top) * 100 + "%" }} />
          </div>
          <div className="bar-label">{d[labelKey]}</div>
        </div>
      ))}
    </div>
  );
}

export function HBars({ data, valueKey = "amt", labelKey = "brand" }) {
  const top = Math.max(...data.map((d) => d[valueKey]));
  return (
    <div className="hbars">
      {data.map((d, i) => (
        <div className="hbar-row" key={i}>
          <div className="hbar-name">{d[labelKey]}</div>
          <div className="hbar-track">
            <div className="hbar-fill" style={{ width: (d[valueKey] / top) * 100 + "%" }} />
          </div>
          <div className="hbar-val">{wonShort(d[valueKey])}</div>
        </div>
      ))}
    </div>
  );
}

export function ChannelDonut({ channels }) {
  const total = channels.reduce((s, c) => s + c.amt, 0);
  const offline = channels.find((c) => c.key === "OFFLINE").amt;
  const offPct = (offline / total) * 100;
  return (
    <div className="donut-wrap">
      <div className="donut" style={{ background: `conic-gradient(#b71c1c 0 ${offPct}%, #e8b9b9 ${offPct}% 100%)` }}>
        <div className="donut-hole">
          <div className="donut-hole-label">온·오프</div>
          <div className="donut-hole-val">{Math.round(offPct)}<span>:</span>{Math.round(100 - offPct)}</div>
        </div>
      </div>
      <div className="donut-legend">
        {channels.map((c) => (
          <div className="legend-row" key={c.key}>
            <span className={"dot " + (c.key === "OFFLINE" ? "dot--strong" : "dot--soft")} />
            <span className="legend-label">{c.label}</span>
            <span className="legend-val">{won(c.amt)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="tabs">
      {tabs.map((t) => (
        <button key={t.key} className={"tab" + (value === t.key ? " is-active" : "")} onClick={() => onChange(t.key)}>
          {t.label}
          {typeof t.count === "number" ? <span className="tab-count">{t.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function Button({ children, variant = "solid", onClick, type = "button" }) {
  return (
    <button type={type} className={"btn btn--" + variant} onClick={onClick}>{children}</button>
  );
}

export function Toolbar({ search, onSearch, placeholder, action }) {
  return (
    <div className="toolbar">
      <div className="search">
        <span className="search-icon">⌕</span>
        <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder={placeholder || "검색"} />
      </div>
      {action || null}
    </div>
  );
}

export function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="modal-x" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-foot">{footer}</div> : null}
      </div>
    </div>
  );
}

export function Field({ label, children, required }) {
  return (
    <label className="field">
      <span className="field-label">{label}{required ? <i> *</i> : null}</span>
      {children}
    </label>
  );
}

export function TextInput(props) { return <input className="input" {...props} />; }
export function Select({ children, ...props }) { return <select className="input" {...props}>{children}</select>; }

export function EmptyState({ title, desc }) {
  return (
    <div className="empty">
      <div className="empty-mark" />
      <div className="empty-title">{title}</div>
      {desc ? <div className="empty-desc">{desc}</div> : null}
    </div>
  );
}

export function StatusPill({ tone, children }) {
  return <span className={"status-pill status-pill--" + tone}><span className="sp-dot" />{children}</span>;
}