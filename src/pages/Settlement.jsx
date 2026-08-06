import { useState, useEffect } from 'react';
import api from '../api/axios';
import { won, num, wonShort, StatCard, StatusPill } from '../components/ui';

const STATUS_LABEL = { PENDING: '대기', CONFIRMED: '확정', PAID: '지급완료' };
const STATUS_TONE = { PENDING: 'warn', CONFIRMED: 'muted', PAID: 'ok' };

export default function Settlement() {
  const [settlements, setSettlements] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [brands, setBrands] = useState([]);
  const [stores, setStores] = useState([]);
  const [month, setMonth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/settlements'),
      api.get('/api/vendors'),
      api.get('/api/brands'),
      api.get('/api/stores'),
    ]).then(([se, v, b, st]) => {
      setSettlements(se.data);
      setVendors(v.data);
      setBrands(b.data);
      setStores(st.data);
      const months = Array.from(new Set(se.data.map((s) => s.settleMonth))).sort().reverse();
      setMonth(months[0] ?? null);
    }).finally(() => setLoading(false));
  }, []);

  const findName = (list, key, val) => list.find((x) => x[key] === val);
  const fmtMonth = (m) => (m ? m.replace("-", "년 ") + "월" : "-");

  if (loading) return (
    <section>
      <div className="empty" style={{ padding: '80px 0' }}>
        <div className="empty-title">불러오는 중...</div>
      </div>
    </section>
  );

  const months = Array.from(new Set(settlements.map((s) => s.settleMonth))).sort().reverse();
  const rows = settlements.filter((s) => s.settleMonth === month);

  const sum = rows.reduce((a, r) => ({
    sales: a.sales + Number(r.saleAmt ?? 0),
    supply: a.supply + Number(r.supplyAmt ?? 0),
    vat: a.vat + Number(r.vatAmt ?? 0),
    fee: a.fee + Number(r.storeFee ?? 0),
    payout: a.payout + Number(r.finalAmt ?? 0),
  }), { sales: 0, supply: 0, vat: 0, fee: 0, payout: 0 });

  const recon = rows.reduce((a, r) => ({
    open: a.open + Number(r.openingQty ?? 0),
    in: a.in + Number(r.inQty ?? 0),
    out: a.out + Number(r.returnQty ?? 0),
    close: a.close + Number(r.closingQty ?? 0),
  }), { open: 0, in: 0, out: 0, close: 0 });

  const allPaid = rows.length > 0 && rows.every((x) => x.settleStatus === "PAID");

  return (
    <section>
      <div className="page-head">
        <div>
          <div className="section-kicker">SETTLEMENT</div>
          <h2 className="page-title">정산 내역</h2>
          <p className="page-desc">월별 협력사 정산 (판매금액 → 공급가액 → 부가세 → 실지급액)</p>
        </div>
        {months.length > 0 && (
          <div className="month-seg">
            {months.map((m) => (
              <button key={m} className={"seg-btn" + (month === m ? " is-active" : "")} onClick={() => setMonth(m)}>{fmtMonth(m)}</button>
            ))}
          </div>
        )}
      </div>

      <div className="stat-grid stat-grid--4">
        <StatCard label="판매금액" value={wonShort(sum.sales)} sub={fmtMonth(month)} tone="muted" />
        <StatCard label="공급가액" value={wonShort(sum.supply)} sub="부가세 제외" tone="muted" />
        <StatCard label="부가세 (10%)" value={wonShort(sum.vat)} sub="세금계산서" tone="muted" />
        <StatCard label="실지급액" value={wonShort(sum.payout)} accent sub={allPaid ? "지급 완료" : "정산 진행중"} />
      </div>

      <div className="card table-card">
        <div className="table-head"><span>{fmtMonth(month)} 협력사별 정산</span><span className="muted">매장 운영비 차감 후 실지급액</span></div>
        <table className="data-table">
          <thead>
            <tr>
              <th>협력사</th><th>브랜드</th><th>매장</th>
              <th className="t-right">판매금액</th><th className="t-right">공급가액</th>
              <th className="t-right">부가세</th><th className="t-right">운영비</th>
              <th className="t-right">실지급액</th><th>상태</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const vendor = findName(vendors, 'vendorCd', s.vendorCd);
              const brand = findName(brands, 'brandCd', s.brandCd);
              const store = findName(stores, 'storeId', s.storeId);
              return (
                <tr key={s.settlementId}>
                  <td className="t-brand">{vendor?.vendorNm ?? s.vendorCd}</td>
                  <td className="muted">{brand?.brandNm ?? s.brandCd}</td>
                  <td className="muted">{store?.storeNm ?? s.storeId}</td>
                  <td className="t-right mono">{won(s.saleAmt ?? 0)}</td>
                  <td className="t-right mono">{won(s.supplyAmt ?? 0)}</td>
                  <td className="t-right mono muted">{won(s.vatAmt ?? 0)}</td>
                  <td className="t-right mono muted">−{won(s.storeFee ?? 0)}</td>
                  <td className="t-right mono t-stock">{won(s.finalAmt ?? 0)}</td>
                  <td><StatusPill tone={STATUS_TONE[s.settleStatus] ?? 'muted'}>{STATUS_LABEL[s.settleStatus] ?? s.settleStatus ?? '-'}</StatusPill></td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan="9"><div className="empty"><div className="empty-mark" /><div className="empty-title">정산 데이터가 없습니다.</div></div></td></tr>
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="t-foot">
                <td colSpan="3">합계</td>
                <td className="t-right mono">{won(sum.sales)}</td>
                <td className="t-right mono">{won(sum.supply)}</td>
                <td className="t-right mono">{won(sum.vat)}</td>
                <td className="t-right mono">−{won(sum.fee)}</td>
                <td className="t-right mono">{won(sum.payout)}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {rows.length > 0 && (
        <div className="card recon-card">
          <div className="card-head"><span>월마감 재고 정산 (스냅샷)</span><span className="muted">{fmtMonth(month)} · 수량 기준</span></div>
          <div className="recon-flow">
            <div className="recon-item"><div className="recon-label">기초재고</div><div className="recon-val">{num(recon.open)}개</div></div>
            <div className="recon-op">+</div>
            <div className="recon-item"><div className="recon-label">입고</div><div className="recon-val recon-in">{num(recon.in)}개</div></div>
            <div className="recon-op">−</div>
            <div className="recon-item"><div className="recon-label">반출·출고</div><div className="recon-val recon-out">{num(recon.out)}개</div></div>
            <div className="recon-op recon-eq">=</div>
            <div className="recon-item recon-item--result"><div className="recon-label">기말재고</div><div className="recon-val">{num(recon.close)}개</div></div>
          </div>
        </div>
      )}
    </section>
  );
}
