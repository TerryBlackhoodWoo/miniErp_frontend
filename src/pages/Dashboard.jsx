import { useState, useEffect } from 'react';
import api from '../api/axios';
import { won, wonShort, num, SectionTitle, Card, StatCard, Badge, BarChart, HBars, ChannelDonut } from '../components/ui';

// ─── 로딩 스켈레톤 ────────────────────────────────────────────────
function Skeleton({ h = 20, w = "100%" }) {
  return (
    <div style={{
      height: h, width: w,
      background: "linear-gradient(90deg, var(--primary-50) 25%, var(--primary-100) 50%, var(--primary-50) 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
      borderRadius: 8,
    }} />
  );
}

function SkeletonStatGrid({ cols = 5 }) {
  return (
    <div className={`stat-grid stat-grid--${cols}`} style={{ marginBottom: 16 }}>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="stat" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Skeleton h={13} w="55%" />
          <Skeleton h={30} w="70%" />
          <Skeleton h={12} w="45%" />
        </div>
      ))}
    </div>
  );
}

// ─── 재고 섹션 ────────────────────────────────────────────────────
function InventorySection() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/api/current-stock')
      .then(r => setStocks(r.data))
      .catch(() => setError("현재고 데이터를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  // 집계
  const skuCount      = new Set(stocks.map(i => i.productNo)).size;
  const totalQty      = stocks.reduce((s, i) => s + Number(i.currentQty ?? 0), 0);
  const stockValue    = stocks.reduce((s, i) => s + Number(i.currentQty ?? 0) * (i.costPrice ?? 0), 0);
  const today         = new Date();

  const daysUntil = (dateStr) => {
    if (!dateStr) return 9999;
    const d = new Date(dateStr);
    return Math.ceil((d - today) / 86400000);
  };

  const expiringSoon  = stocks.filter(i => { const d = daysUntil(i.expireDate); return d <= 90 && d > 0; }).length;
  const outOfStock    = stocks.filter(i => Number(i.currentQty ?? 0) <= 0).length;
  const belowSafety   = outOfStock;

  const stockStatus = (item) => {
    const qty = Number(item.currentQty ?? 0);
    if (qty <= 0)                              return { tone: "danger", text: "품절" };
    
    return                                            { tone: "ok",     text: "정상" };
  };

  const expireStatus = (item) => {
    const d = daysUntil(item.expireDate);
    if (d <= 0)  return { tone: "danger", text: "기한만료" };
    if (d <= 60) return { tone: "danger", text: `D-${d}` };
    if (d <= 90) return { tone: "warn",   text: `D-${d}` };
    return null;
  };

  if (error) return (
    <section>
      <SectionTitle kicker="INVENTORY" title="현재고 현황" />
      <div className="empty"><div className="empty-title">{error}</div></div>
    </section>
  );

  return (
    <section>
      <SectionTitle
        kicker="INVENTORY"
        title="현재고 현황"
        right={<span className="muted">current_stock View · LOT 기준 실시간</span>}
      />

      {loading ? <SkeletonStatGrid cols={5} /> : (
        <div className="stat-grid stat-grid--5">
          <StatCard label="관리 SKU"       value={num(skuCount)}     unit="종" />
          <StatCard label="총 재고수량"    value={num(totalQty)}     unit="EA" />
          <StatCard label="재고자산 (원가)" value={wonShort(stockValue)} accent />
          <StatCard label="유통기한 임박"  value={num(expiringSoon)} unit="건" sub="90일 이내"           tone="warn" />
          <StatCard label="안전재고 미달"  value={num(belowSafety)}  unit="종" sub={`품절 ${outOfStock}종 포함`} tone="danger" />
        </div>
      )}

      <Card className="table-card">
        <div className="table-head">
          <span>품목별 현재고</span>
          <span className="muted">단가는 매입원가 기준</span>
        </div>
        {loading ? (
          <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h={18} />)}
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "10%" }}>브랜드</th>
                  <th style={{ width: "28%" }}>상품</th>
                  <th style={{ width: "14%" }}>창고 · 지점</th>
                  <th style={{ width: "10%" }}>LOT</th>
                  <th className="t-right" style={{ width: "8%" }}>현재고</th>
                  <th style={{ width: "12%" }}>유통기한</th>
                  <th style={{ width: "8%" }}>상태</th>
                </tr>
              </thead>
              <tbody>
                {stocks.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "var(--muted)" }}>등록된 재고가 없습니다.</td></tr>
                ) : stocks.map((it, idx) => {
                  const ss = stockStatus(it);
                  const es = expireStatus(it);
                  return (
                    <tr key={idx}>
                      <td className="t-brand">{it.brandNm ?? "-"}</td>
                      <td>
                        <div className="t-name">{it.productNmKo ?? "-"}</div>
                        <div className="t-sku">{it.productNo ?? ""}</div>
                      </td>
                      <td className="muted">{it.warehouseNm ?? it.storeNm ?? "-"}</td>
                      <td className="mono muted">{it.lotNo ?? "-"}</td>
                      <td className="t-right t-stock">{num(Number(it.currentQty ?? 0))}</td>
                      
                      <td className="mono">
                        {it.expireDate ? (
                          <span className="exp-date">{it.expireDate.slice(2)}</span>
                        ) : <span className="muted">-</span>}
                        {es ? <Badge tone={es.tone}>{es.text}</Badge> : null}
                      </td>
                      <td><Badge tone={ss.tone}>{ss.text}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </section>
  );
}

// ─── 매출 섹션 ────────────────────────────────────────────────────
function SalesSection() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/api/sales')
      .then(r => setSales(r.data))
      .catch(() => setError("판매 데이터를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  // ── 이번 달 / 전월 필터
  const now         = new Date();
  const thisYear    = now.getFullYear();
  const thisMonth   = now.getMonth();          // 0-indexed
  const monthLabel  = `${thisYear}.${String(thisMonth + 1).padStart(2, "0")}`;

  const inMonth = (dateStr, y, m) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getFullYear() === y && d.getMonth() === m;
  };

  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastYear  = thisMonth === 0 ? thisYear - 1 : thisYear;

  const thisMonthSales = sales.filter(s => inMonth(s.saleDate ?? s.createdAt, thisYear, thisMonth));
  const lastMonthSales = sales.filter(s => inMonth(s.saleDate ?? s.createdAt, lastYear, lastMonth));

  const sumAmt    = (arr) => arr.reduce((s, r) => s + ((r.saleQty ?? 0) * (r.salePrice ?? 0)), 0);
  const sumQty    = (arr) => arr.reduce((s, r) => s + (r.saleQty ?? 0), 0);

  const monthRevenue     = sumAmt(thisMonthSales);
  const lastMonthRevenue = sumAmt(lastMonthSales);
  const salesQty         = sumQty(thisMonthSales);
  const supplyAmount     = Math.round(monthRevenue / 1.1);
  const vat              = monthRevenue - supplyAmount;

  const diff    = monthRevenue - lastMonthRevenue;
  const diffPct = lastMonthRevenue > 0 ? Math.abs((diff / lastMonthRevenue) * 100).toFixed(1) : null;
  const up      = diff >= 0;

  // ── 일별 매출 (이번달 1~말일)
  const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate();
  const dailySales  = Array.from({ length: daysInMonth }, (_, i) => {
    const day = String(i + 1).padStart(2, "0");
    const amt = thisMonthSales
      .filter(s => (s.saleDate ?? s.createdAt ?? "").slice(8, 10) === day)
      .reduce((s, r) => s + (r.saleQty ?? 0) * (r.salePrice ?? 0), 0);
    return { d: String(i + 1), amt };
  }).filter(d => d.amt > 0 || parseInt(d.d) <= now.getDate());

  const maxDaily = Math.max(...dailySales.map(d => d.amt), 1);

  // ── 채널별
  const offlineAmt = thisMonthSales.filter(s => s.channel === "OFFLINE").reduce((s, r) => s + (r.saleQty ?? 0) * (r.salePrice ?? 0), 0);
  const onlineAmt  = thisMonthSales.filter(s => s.channel === "ONLINE").reduce((s, r) => s + (r.saleQty ?? 0) * (r.salePrice ?? 0), 0);
  const channels   = [
    { key: "OFFLINE", label: "오프라인", amt: offlineAmt || 0 },
    { key: "ONLINE",  label: "온라인",   amt: onlineAmt  || 0 },
  ];
  const hasChannelData = offlineAmt + onlineAmt > 0;

  // ── 브랜드별 TOP
  const brandMap = {};
  thisMonthSales.forEach(s => {
    const b = s.brandNm ?? "기타";
    brandMap[b] = (brandMap[b] ?? 0) + (s.saleQty ?? 0) * (s.salePrice ?? 0);
  });
  const brandSales = Object.entries(brandMap)
    .map(([brand, amt]) => ({ brand, amt }))
    .sort((a, b) => b.amt - a.amt)
    .slice(0, 6);

  if (error) return (
    <section>
      <SectionTitle kicker="SALES" title="이번달 매출 요약" />
      <div className="empty"><div className="empty-title">{error}</div></div>
    </section>
  );

  return (
    <section>
      <SectionTitle
        kicker="SALES"
        title="이번달 매출 요약"
        right={<span className="muted">{monthLabel} · MTD 누적</span>}
      />

      {loading ? <SkeletonStatGrid cols={4} /> : (
        <div className="stat-grid stat-grid--4">
          <StatCard
            label="이번달 매출액" value={wonShort(monthRevenue)} accent
            sub={diffPct ? `${up ? "▲" : "▼"} ${diffPct}% 전월 동기 대비` : "전월 데이터 없음"}
            tone={up ? "ok" : "danger"}
          />
          <StatCard label="판매 수량"    value={num(salesQty)}     unit="EA" />
          <StatCard label="공급가액"     value={wonShort(supplyAmount)} sub="부가세 제외" tone="muted" />
          <StatCard label="부가세 (10%)" value={wonShort(vat)}    sub="세금계산서 기준" tone="muted" />
        </div>
      )}

      <div className="sales-grid">
        <Card>
          <div className="card-head">
            <span>일별 매출 추이</span>
            <span className="muted">{monthLabel}</span>
          </div>
          {loading
            ? <div style={{ padding: "24px 22px" }}><Skeleton h={180} /></div>
            : dailySales.length > 0
              ? <BarChart data={dailySales} max={maxDaily} />
              : <div className="empty" style={{ padding: "40px 0" }}>
                  <div className="empty-title" style={{ fontSize: 13 }}>이번달 판매 내역이 없습니다.</div>
                </div>
          }
        </Card>

        <Card>
          <div className="card-head"><span>채널별 비중</span></div>
          {loading
            ? <div style={{ padding: "24px 22px" }}><Skeleton h={160} /></div>
            : hasChannelData
              ? <ChannelDonut channels={channels} />
              : <div className="empty" style={{ padding: "40px 0" }}>
                  <div className="empty-title" style={{ fontSize: 13 }}>채널 데이터가 없습니다.</div>
                </div>
          }
        </Card>

        <Card className="brand-card">
          <div className="card-head">
            <span>브랜드별 매출 TOP</span>
            <span className="muted">이번달 누적</span>
          </div>
          {loading
            ? <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h={16} />)}
              </div>
            : brandSales.length > 0
              ? <HBars data={brandSales} />
              : <div className="empty" style={{ padding: "32px 0" }}>
                  <div className="empty-title" style={{ fontSize: 13 }}>브랜드 매출 데이터가 없습니다.</div>
                </div>
          }
        </Card>
      </div>
    </section>
  );
}

// ─── 발주 현황 섹션 ───────────────────────────────────────────────
function PurchaseSection() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/api/purchase-orders')
      .then(r => setOrders(r.data))
      .catch(() => setError("발주 데이터를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  const pending    = orders.filter(o => o.status === "PENDING");
  const received   = orders.filter(o => o.status === "RECEIVED");
  const completed  = orders.filter(o => o.status === "COMPLETED");

  const totalLogistics = orders
    .filter(o => o.status === "COMPLETED")
    .reduce((s, o) => s + (o.logisticsCost ?? 0), 0);

  const STATUS_META = {
    PENDING:   { tone: "warn",    text: "입고 대기" },
    RECEIVED:  { tone: "ok",      text: "배분 대기" },
    COMPLETED: { tone: "neutral", text: "완료"      },
  };

  if (error) return (
    <section>
      <SectionTitle kicker="PURCHASE" title="발주 · 입고 현황" />
      <div className="empty"><div className="empty-title">{error}</div></div>
    </section>
  );

  return (
    <section>
      <SectionTitle
        kicker="PURCHASE"
        title="발주 · 입고 현황"
        right={<span className="muted">전체 발주 기준</span>}
      />

      {loading ? <SkeletonStatGrid cols={4} /> : (
        <div className="stat-grid stat-grid--4">
          <StatCard label="입고 대기"   value={num(pending.length)}   unit="건" sub="PENDING"    tone="warn"   />
          <StatCard label="배분 대기"   value={num(received.length)}  unit="건" sub="RECEIVED"   tone="ok"     />
          <StatCard label="완료"        value={num(completed.length)} unit="건" sub="COMPLETED"  tone="muted"  />
          <StatCard label="누적 물류비" value={wonShort(totalLogistics)} accent />
        </div>
      )}

      <Card className="table-card">
        <div className="table-head">
          <span>최근 발주 목록</span>
          <span className="muted">최신순 10건</span>
        </div>
        {loading ? (
          <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h={18} />)}
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>발주번호</th><th>상품</th><th>협력사</th>
                  <th className="t-right">발주수량</th><th className="t-right">물류비</th>
                  <th>발주일</th><th>상태</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "var(--muted)" }}>발주 내역이 없습니다.</td></tr>
                ) : [...orders].sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0)).slice(0, 10).map((o, idx) => {
                  const sm = STATUS_META[o.status] ?? { tone: "neutral", text: o.status };
                  return (
                    <tr key={idx}>
                      <td className="mono muted">{o.poNo ?? o.id ?? "-"}</td>
                      <td><div className="t-name">{o.productNmKo ?? o.productNo ?? "-"}</div></td>
                      <td className="muted">{o.vendorName ?? "-"}</td>
                      <td className="t-right t-stock">{num(o.orderQty ?? 0)}</td>
                      <td className="t-right muted">{o.logisticsCost ? wonShort(o.logisticsCost) : "-"}</td>
                      <td className="mono muted">{(o.createdAt ?? "").slice(0, 10)}</td>
                      <td><Badge tone={sm.tone}>{sm.text}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </section>
  );
}

// ─── shimmer 애니메이션 (인라인 스타일) ──────────────────────────
const shimmerStyle = `
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

// ─── 메인 대시보드 ────────────────────────────────────────────────
export default function Dashboard() {
  return (
    <>
      <style>{shimmerStyle}</style>
      <InventorySection />
      <SalesSection />
      <PurchaseSection />
    </>
  );
}