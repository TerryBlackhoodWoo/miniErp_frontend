import { useState } from 'react';
import ERP_DATA from '../data/erpData';
import { won, wonShort, StatCard, StatusPill } from '../components/ui';

const D_S = ERP_DATA;

export default function Settlement() {
  const months = Array.from(new Set(D_S.settlements.map((s) => s.month))).sort().reverse();
  const [month, setMonth] = useState(months[0]);
  const rows = D_S.settlements.filter((s) => s.month === month);

  const sum = rows.reduce((a, r) => ({
    sales: a.sales + r.sales, supply: a.supply + r.supply,
    vat: a.vat + r.vat, commission: a.commission + r.commission, payout: a.payout + r.payout,
  }), { sales: 0, supply: 0, vat: 0, commission: 0, payout: 0 });

  const r = D_S.settleRecon;
  const fmtMonth = (m) => m.replace("-", "년 ") + "월";
  const allClosed = rows.every((x) => x.status === "마감");

  return (
    <section>
      <div className="page-head">
        <div>
          <div className="section-kicker">SETTLEMENT</div>
          <h2 className="page-title">정산 내역</h2>
          <p className="page-desc">월별 협력사 정산 (판매금액 → 공급가액 → 부가세 → 실지급액)</p>
        </div>
        <div className="month-seg">
          {months.map((m) => (
            <button key={m} className={"seg-btn" + (month === m ? " is-active" : "")} onClick={() => setMonth(m)}>{fmtMonth(m)}</button>
          ))}
        </div>
      </div>

      <div className="stat-grid stat-grid--4">
        <StatCard label="판매금액" value={wonShort(sum.sales)} sub={fmtMonth(month)} tone="muted" />
        <StatCard label="공급가액" value={wonShort(sum.supply)} sub="부가세 제외" tone="muted" />
        <StatCard label="부가세 (10%)" value={wonShort(sum.vat)} sub="세금계산서" tone="muted" />
        <StatCard label="실지급액" value={wonShort(sum.payout)} accent sub={allClosed ? "마감 완료" : "마감 진행중"} />
      </div>

      <div className="card table-card">
        <div className="table-head"><span>{fmtMonth(month)} 협력사별 정산</span><span className="muted">수수료 차감 후 실지급액</span></div>
        <table className="data-table">
          <thead>
            <tr>
              <th>협력사</th>
              <th className="t-right">판매금액</th><th className="t-right">공급가액</th>
              <th className="t-right">부가세</th><th className="t-right">수수료</th>
              <th className="t-right">실지급액</th><th>상태</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td className="t-brand">{s.vendor}</td>
                <td className="t-right mono">{won(s.sales)}</td>
                <td className="t-right mono">{won(s.supply)}</td>
                <td className="t-right mono muted">{won(s.vat)}</td>
                <td className="t-right mono muted">−{won(s.commission)}</td>
                <td className="t-right mono t-stock">{won(s.payout)}</td>
                <td><StatusPill tone={s.status === "마감" ? "ok" : "warn"}>{s.status}</StatusPill></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="t-foot">
              <td>합계</td>
              <td className="t-right mono">{won(sum.sales)}</td>
              <td className="t-right mono">{won(sum.supply)}</td>
              <td className="t-right mono">{won(sum.vat)}</td>
              <td className="t-right mono">−{won(sum.commission)}</td>
              <td className="t-right mono">{won(sum.payout)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="card recon-card">
        <div className="card-head"><span>월마감 재고 정산 (스냅샷)</span><span className="muted">{fmtMonth(r.month)} · 금액 기준</span></div>
        <div className="recon-flow">
          <div className="recon-item"><div className="recon-label">기초재고</div><div className="recon-val">{won(r.openStock)}</div></div>
          <div className="recon-op">+</div>
          <div className="recon-item"><div className="recon-label">입고</div><div className="recon-val recon-in">{won(r.inbound)}</div></div>
          <div className="recon-op">−</div>
          <div className="recon-item"><div className="recon-label">반출·출고</div><div className="recon-val recon-out">{won(r.outbound)}</div></div>
          <div className="recon-op recon-eq">=</div>
          <div className="recon-item recon-item--result"><div className="recon-label">기말재고</div><div className="recon-val">{won(r.closeStock)}</div></div>
        </div>
      </div>
    </section>
  );
}