import { useState } from 'react';
import ERP_DATA from '../data/erpData';
import { num, Badge, StatCard } from '../components/ui';

const D_L = ERP_DATA;
const LEDGER_TONE = { "입고": "ok", "판매출고": "neutral", "반출": "warn", "조정": "neutral" };

export default function Inventory() {
  const [filter, setFilter] = useState("전체");
  const [search, setSearch] = useState("");
  const s = D_L.ledgerSummary;
  const types = ["전체", "입고", "판매출고", "반출", "조정"];
  const q = search.trim().toLowerCase();

  const rows = D_L.ledger.filter((r) => {
    if (filter !== "전체" && r.type !== filter) return false;
    if (q && !(r.name.toLowerCase().includes(q) || r.sku.toLowerCase().includes(q) || r.lot.toLowerCase().includes(q))) return false;
    return true;
  }).slice().reverse();

  return (
    <section>
      <div className="page-head">
        <div>
          <div className="section-kicker">INVENTORY</div>
          <h2 className="page-title">재고 수불부</h2>
          <p className="page-desc">입고 · 출고 · 반출 · 조정 이력 (기초 + 입고 − 출고 = 기말) · {D_L.monthLabel}</p>
        </div>
      </div>

      <div className="stat-grid stat-grid--4">
        <StatCard label="기초재고" value={num(s.open)} unit="EA" sub="6월 1일 기준" tone="muted" />
        <StatCard label="입고 합계" value={"+" + num(s.in)} unit="EA" sub="발주·입고" tone="ok" />
        <StatCard label="출고 합계" value={"−" + num(s.out)} unit="EA" sub="판매·반출" tone="danger" />
        <StatCard label="기말재고" value={num(s.close)} unit="EA" accent />
      </div>

      <div className="ledger-toolbar">
        <div className="seg">
          {types.map((t) => (
            <button key={t} className={"seg-btn" + (filter === t ? " is-active" : "")} onClick={() => setFilter(t)}>{t}</button>
          ))}
        </div>
        <div className="search search--inline">
          <span className="search-icon">⌕</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="상품 · SKU · LOT 검색" />
        </div>
      </div>

      <div className="card table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>일자</th><th>구분</th><th>상품 / SKU</th><th>LOT</th>
              <th>창고 · 지점</th><th className="t-right">수량</th><th className="t-right">잔고</th><th>비고</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="mono muted">{r.date.slice(5).replace("-", ".")}</td>
                <td><Badge tone={LEDGER_TONE[r.type]}>{r.type}</Badge></td>
                <td><div className="t-name">{r.name}</div><div className="t-sku">{r.sku}</div></td>
                <td className="mono muted">{r.lot}</td>
                <td className="muted">{r.wh}</td>
                <td className={"t-right mono t-qty " + (r.qty > 0 ? "qty-in" : r.qty < 0 ? "qty-out" : "qty-zero")}>
                  {r.qty > 0 ? "+" : ""}{num(r.qty)}
                </td>
                <td className="t-right mono t-stock">{num(r.balance)}</td>
                <td className="muted t-note">{r.note}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan="8"><div className="empty"><div className="empty-mark" /><div className="empty-title">해당 조건의 수불 내역이 없습니다.</div></div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}