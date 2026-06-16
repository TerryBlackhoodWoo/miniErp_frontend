import { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { num, Badge, StatCard } from '../components/ui';

const MOVE_TONE = { "입고": "ok", "출고": "warn" };

export default function Inventory() {
  const [ledger, setLedger] = useState([]);
  const [stock, setStock] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stores, setStores] = useState([]);
  const [filter, setFilter] = useState("전체");
  const [search, setSearch] = useState("");
  const [stockSearch, setStockSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/inventories/ledger'),
      api.get('/api/current-stock'),
      api.get('/api/products'),
      api.get('/api/warehouses'),
      api.get('/api/stores'),
    ])
      .then(([ledgerRes, stockRes, productsRes, warehousesRes, storesRes]) => {
        setLedger(ledgerRes.data);
        setStock(stockRes.data);
        setProducts(productsRes.data);
        setWarehouses(warehousesRes.data);
        setStores(storesRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const findName = (list, key, val) => list.find((x) => x[key] === val);

  // current_stock 조회용 Map: productNo|lotNo|expireDate|warehouseId|storeId → currentQty
  const stockMap = useMemo(() => {
    const m = new Map();
    stock.forEach((cs) => {
      if (!cs) return;
      const key = [cs.productNo, cs.lotNo, cs.expireDate, cs.warehouseId, cs.storeId]
        .map((v) => (v === null || v === undefined ? "null" : v))
        .join("|");
      m.set(key, cs.currentQty);
    });
    return m;
  }, [stock]);

  const getBalance = (r) => {
    const key = [r.productNo, r.lotNo, r.expireDate, r.warehouseId, r.storeId]
      .map((v) => (v === null || v === undefined ? "null" : v))
      .join("|");
    return stockMap.has(key) ? stockMap.get(key) : null;
  };

  const types = ["전체", "입고", "출고"];
  const q = search.trim().toLowerCase();

  const rows = ledger.filter((r) => {
    if (filter !== "전체" && r.moveTypeLabel !== filter) return false;
    if (q) {
      const hit =
        (r.productNmKo || "").toLowerCase().includes(q) ||
        (r.productNo || "").toLowerCase().includes(q) ||
        (r.lotNo || "").toLowerCase().includes(q);
      if (!hit) return false;
    }
    return true;
  });

  // 상단 통계 - 전체 ledger 기준 IN/OUT 합계
  const summary = useMemo(() => {
    let inSum = 0, outSum = 0;
    ledger.forEach((r) => {
      const qty = Number(r.qty) || 0;
      if (r.moveType === 'IN') inSum += qty;
      else if (r.moveType === 'OUT') outSum += qty;
    });
    return { in: inSum, out: outSum, net: inSum - outSum };
  }, [ledger]);

  // 현재고 - 0 이하 제외, 상품/창고/지점 이름 매칭
  const stockRows = useMemo(() => {
    const sq = stockSearch.trim().toLowerCase();
    return stock
      .filter((cs) => cs && Number(cs.currentQty) > 0)
      .map((cs) => {
        const product = findName(products, 'productNo', cs.productNo);
        const warehouse = cs.warehouseId != null ? findName(warehouses, 'warehouseId', cs.warehouseId) : null;
        const store = cs.storeId != null ? findName(stores, 'storeId', cs.storeId) : null;
        return {
          key: [cs.productNo, cs.lotNo, cs.expireDate, cs.warehouseId, cs.storeId].join("|"),
          productNo: cs.productNo,
          productNmKo: product?.productNmKo ?? cs.productNo,
          lotNo: cs.lotNo,
          expireDate: cs.expireDate,
          locationLabel: warehouse ? `창고 · ${warehouse.warehouseNm}` : store ? `지점 · ${store.storeNm}` : '-',
          locationTone: warehouse ? 'muted' : 'ok',
          qty: cs.currentQty,
        };
      })
      .filter((r) => {
        if (!sq) return true;
        return (
          r.productNmKo.toLowerCase().includes(sq) ||
          r.productNo.toLowerCase().includes(sq) ||
          (r.lotNo || '').toLowerCase().includes(sq)
        );
      })
      .sort((a, b) => a.productNmKo.localeCompare(b.productNmKo));
  }, [stock, products, warehouses, stores, stockSearch]);

  const stockTotalQty = useMemo(
    () => stockRows.reduce((sum, r) => sum + (Number(r.qty) || 0), 0),
    [stockRows]
  );

  if (loading) {
    return (
      <section>
        <div className="page-head">
          <div>
            <div className="section-kicker">INVENTORY</div>
            <h2 className="page-title">재고 수불</h2>
          </div>
        </div>
        <div className="card table-card"><div className="empty"><div className="empty-title">불러오는 중...</div></div></div>
      </section>
    );
  }

  return (
    <section>
      <div className="page-head">
        <div>
          <div className="section-kicker">INVENTORY</div>
          <h2 className="page-title">재고 수불</h2>
          <p className="page-desc">현재 재고 현황 및 입출고 이력 (LOT 기준)</p>
        </div>
      </div>

      {/* ── 현재고 ── */}
      <div className="section-kicker" style={{ marginTop: 8 }}>CURRENT STOCK</div>
      <h3 className="page-title" style={{ fontSize: 18, marginBottom: 8 }}>현재고</h3>

      <div className="stat-grid stat-grid--4">
        <StatCard label="보유 LOT 수" value={num(stockRows.length)} unit="건" tone="muted" />
        <StatCard label="전체 현재고" value={num(stockTotalQty)} unit="EA" accent />
      </div>

      <div className="ledger-toolbar">
        <div className="search search--inline">
          <span className="search-icon">⌕</span>
          <input value={stockSearch} onChange={(e) => setStockSearch(e.target.value)} placeholder="상품명 · 품번 · LOT 검색" />
        </div>
      </div>

      <div className="card table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>상품 / 품번</th><th>LOT</th><th>유통기한</th><th>위치</th><th className="t-right">현재고</th>
            </tr>
          </thead>
          <tbody>
            {stockRows.map((r) => (
              <tr key={r.key}>
                <td><div className="t-name">{r.productNmKo}</div><div className="t-sku">{r.productNo}</div></td>
                <td className="mono muted">{r.lotNo || "-"}</td>
                <td className="mono muted">{r.expireDate || "-"}</td>
                <td><Badge tone={r.locationTone}>{r.locationLabel}</Badge></td>
                <td className="t-right mono t-stock">{num(r.qty)}</td>
              </tr>
            ))}
            {stockRows.length === 0 && (
              <tr><td colSpan="5"><div className="empty"><div className="empty-mark" /><div className="empty-title">현재 보유 중인 재고가 없습니다.</div></div></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── 수불 이력 ── */}
      <div className="section-kicker" style={{ marginTop: 24 }}>LEDGER</div>
      <h3 className="page-title" style={{ fontSize: 18, marginBottom: 8 }}>입출고 이력</h3>

      <div className="stat-grid stat-grid--4">
        <StatCard label="입고 합계" value={"+" + num(summary.in)} unit="EA" sub="발주·입고" tone="ok" />
        <StatCard label="출고 합계" value={"−" + num(summary.out)} unit="EA" sub="판매·출고" tone="danger" />
        <StatCard label="순증감" value={(summary.net >= 0 ? "+" : "") + num(summary.net)} unit="EA" sub="입고 − 출고" tone="muted" />
        <StatCard label="이력 건수" value={num(ledger.length)} unit="건" accent />
      </div>

      <div className="ledger-toolbar">
        <div className="seg">
          {types.map((t) => (
            <button key={t} className={"seg-btn" + (filter === t ? " is-active" : "")} onClick={() => setFilter(t)}>{t}</button>
          ))}
        </div>
        <div className="search search--inline">
          <span className="search-icon">⌕</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="상품명 · 품번 · LOT 검색" />
        </div>
      </div>

      <div className="card table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>일시</th><th>구분</th><th>상품 / 품번</th><th>LOT</th>
              <th>창고 · 지점</th><th className="t-right">수량</th><th className="t-right">현재고</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const qty = Number(r.qty) || 0;
              const signedQty = r.moveType === 'OUT' ? -qty : qty;
              const balance = getBalance(r);
              return (
                <tr key={r.invId}>
                  <td className="mono muted">{(r.createdAt || "").slice(0, 16).replace("T", " ")}</td>
                  <td><Badge tone={MOVE_TONE[r.moveTypeLabel]}>{r.moveTypeLabel}</Badge></td>
                  <td><div className="t-name">{r.productNmKo}</div><div className="t-sku">{r.productNo}</div></td>
                  <td className="mono muted">{r.lotNo || "-"}</td>
                  <td className="muted">{r.warehouseNm || r.storeNm || "-"}</td>
                  <td className={"t-right mono t-qty " + (signedQty > 0 ? "qty-in" : signedQty < 0 ? "qty-out" : "qty-zero")}>
                    {signedQty > 0 ? "+" : ""}{num(signedQty)}
                  </td>
                  <td className="t-right mono t-stock">{balance !== null ? num(balance) : "-"}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan="7"><div className="empty"><div className="empty-mark" /><div className="empty-title">해당 조건의 수불 내역이 없습니다.</div></div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}