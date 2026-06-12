import ERP_DATA from '../data/erpData';
import { won, wonShort, num, SectionTitle, Card, StatCard, Badge, BarChart, HBars, ChannelDonut } from '../components/ui';

const D = ERP_DATA;

function stockStatus(item) {
  if (item.stock === 0) return { tone: "danger", text: "품절" };
  if (item.stock < item.safety) return { tone: "warn", text: "안전재고 미달" };
  return { tone: "ok", text: "정상" };
}

function expireStatus(item) {
  const days = D.helpers.daysUntil(item.expire);
  if (days <= 60) return { tone: "danger", text: `D-${days}` };
  if (days <= 90) return { tone: "warn", text: `D-${days}` };
  return null;
}

function InventorySection() {
  const m = D.metrics;
  return (
    <section>
      <SectionTitle
        kicker="INVENTORY"
        title="현재고 현황"
        right={<span className="muted">current_stock View · LOT 기준 실시간</span>}
      />
      <div className="stat-grid stat-grid--5">
        <StatCard label="관리 SKU" value={num(m.skuCount)} unit="종" />
        <StatCard label="총 재고수량" value={num(m.totalStockQty)} unit="EA" />
        <StatCard label="재고자산 (원가)" value={wonShort(m.stockAssetValue)} accent />
        <StatCard label="유통기한 임박" value={num(m.expiringSoonCount)} unit="건" sub="90일 이내" tone="warn" />
        <StatCard label="안전재고 미달" value={num(m.belowSafetyCount)} unit="종" sub={`품절 ${m.outOfStockCount}종 포함`} tone="danger" />
      </div>

      <Card className="table-card">
        <div className="table-head">
          <span>품목별 현재고</span>
          <span className="muted">단가는 매입원가 기준</span>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>브랜드</th><th>상품</th><th>창고 · 지점</th><th>LOT</th>
                <th className="t-right">현재고</th><th className="t-right">안전재고</th>
                <th>유통기한</th><th>상태</th>
              </tr>
            </thead>
            <tbody>
              {D.inventory.map((it) => {
                const ss = stockStatus(it);
                const es = expireStatus(it);
                return (
                  <tr key={it.id}>
                    <td className="t-brand">{it.brand}</td>
                    <td><div className="t-name">{it.name}</div><div className="t-sku">{it.sku}</div></td>
                    <td className="muted">{it.wh}</td>
                    <td className="mono muted">{it.lot}</td>
                    <td className="t-right t-stock">{num(it.stock)}</td>
                    <td className="t-right muted">{num(it.safety)}</td>
                    <td className="mono">
                      <span className="exp-date">{it.expire.slice(2)}</span>
                      {es ? <Badge tone={es.tone}>{es.text}</Badge> : null}
                    </td>
                    <td><Badge tone={ss.tone}>{ss.text}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}

function SalesSection() {
  const diff = D.monthRevenue - D.lastMonthRevenue;
  const diffPct = ((diff / D.lastMonthRevenue) * 100).toFixed(1);
  const up = diff >= 0;
  const maxDaily = Math.max(...D.dailySales.map((d) => d.amt));
  return (
    <section>
      <SectionTitle
        kicker="SALES"
        title="이번달 매출 요약"
        right={<span className="muted">{D.monthLabel} · 1~11일 누적 (MTD)</span>}
      />
      <div className="stat-grid stat-grid--4">
        <StatCard
          label="이번달 매출액" value={wonShort(D.monthRevenue)} accent
          sub={`${up ? "▲" : "▼"} ${Math.abs(diffPct)}% 전월 동기 대비`}
          tone={up ? "ok" : "danger"}
        />
        <StatCard label="판매 수량" value={num(D.salesQty)} unit="EA" />
        <StatCard label="공급가액" value={wonShort(D.supplyAmount)} sub="부가세 제외" tone="muted" />
        <StatCard label="부가세 (10%)" value={wonShort(D.vat)} sub="세금계산서 기준" tone="muted" />
      </div>

      <div className="sales-grid">
        <Card>
          <div className="card-head"><span>일별 매출 추이</span><span className="muted">{D.monthLabel}</span></div>
          <BarChart data={D.dailySales} max={maxDaily} />
        </Card>
        <Card>
          <div className="card-head"><span>채널별 비중</span></div>
          <ChannelDonut channels={D.channels} />
        </Card>
        <Card className="brand-card">
          <div className="card-head"><span>브랜드별 매출 TOP</span><span className="muted">이번달 누적</span></div>
          <HBars data={D.brandSales} />
        </Card>
      </div>
    </section>
  );
}

export default function Dashboard() {
  return <><InventorySection /><SalesSection /></>;
}