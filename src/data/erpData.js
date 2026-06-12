// miniERP 샘플 데이터 — 면세점 도메인 (2026년 6월 기준)
// 실제 백엔드 API(/api/inventories, /api/sales 등) 연동 전 더미 데이터입니다.

const today = "2026-06-11";

const inventory = [
  { id: 1,  brand: "설화수", name: "윤조에센스 90ml",        sku: "SUL-YJ-090", stock: 142, safety: 60,  cost: 38000,  retail: 132000, lot: "L2602A", expire: "2027-08-31", wh: "인천공항 T1" },
  { id: 2,  brand: "후",     name: "비첩 자생 에센스 50ml",   sku: "WHO-BC-050", stock: 38,  safety: 50,  cost: 41000,  retail: 145000, lot: "L2601B", expire: "2026-07-20", wh: "인천공항 T1" },
  { id: 3,  brand: "라네즈",  name: "워터뱅크 크림 50ml",      sku: "LAN-WB-050", stock: 0,   safety: 40,  cost: 19000,  retail: 48000,  lot: "L2512C", expire: "2026-09-30", wh: "롯데 명동" },
  { id: 4,  brand: "헤라",    name: "블랙쿠션 SPF34 15g",     sku: "HER-BC-015", stock: 96,  safety: 45,  cost: 22000,  retail: 60000,  lot: "L2603A", expire: "2027-03-15", wh: "신라 장충" },
  { id: 5,  brand: "에스티로더", name: "어드밴스드 갈색병 50ml", sku: "EST-ANR-050", stock: 24, safety: 35, cost: 52000, retail: 138000, lot: "L2602D", expire: "2026-08-05", wh: "인천공항 T2" },
  { id: 6,  brand: "랑콤",    name: "제니피끄 세럼 50ml",      sku: "LAN-GEN-050", stock: 71, safety: 40, cost: 58000, retail: 165000, lot: "L2604A", expire: "2027-11-30", wh: "인천공항 T2" },
  { id: 7,  brand: "SK-II",  name: "페이셜 트리트먼트 230ml", sku: "SK2-FTE-230", stock: 18, safety: 30, cost: 96000, retail: 268000, lot: "L2601E", expire: "2026-07-02", wh: "롯데 명동" },
  { id: 8,  brand: "조말론",  name: "잉글리쉬 페어 100ml",     sku: "JML-EPF-100", stock: 53, safety: 25, cost: 71000, retail: 198000, lot: "L2603C", expire: "2028-01-31", wh: "신라 장충" },
  { id: 9,  brand: "시슬리",  name: "블랙로즈 크림 50ml",      sku: "SIS-BR-050", stock: 7,  safety: 20, cost: 142000, retail: 385000, lot: "L2602F", expire: "2027-05-20", wh: "인천공항 T1" },
  { id: 10, brand: "오휘",    name: "더 퍼스트 제너츄어 90ml", sku: "OHU-GEN-090", stock: 64, safety: 35, cost: 64000, retail: 178000, lot: "L2604B", expire: "2027-09-10", wh: "롯데 명동" },
  { id: 11, brand: "설화수",  name: "자음생크림 60ml",        sku: "SUL-JEC-060", stock: 31, safety: 30, cost: 88000, retail: 245000, lot: "L2603E", expire: "2026-08-28", wh: "신라 장충" },
  { id: 12, brand: "라네즈",  name: "립 슬리핑 마스크 20g",    sku: "LAN-LSM-020", stock: 210, safety: 80, cost: 8000, retail: 24000,  lot: "L2604C", expire: "2027-02-14", wh: "인천공항 T1" },
];

const dailySales = [
  { d: 1,  amt: 4820000 }, { d: 2,  amt: 5310000 }, { d: 3,  amt: 3980000 },
  { d: 4,  amt: 6120000 }, { d: 5,  amt: 7240000 }, { d: 6,  amt: 8650000 },
  { d: 7,  amt: 9120000 }, { d: 8,  amt: 5440000 }, { d: 9,  amt: 6010000 },
  { d: 10, amt: 7330000 }, { d: 11, amt: 8190000 },
];

const channels = [
  { key: "OFFLINE", label: "오프라인 (매장)", amt: 41200000, qty: 412 },
  { key: "ONLINE",  label: "온라인 (네이버·쿠팡)", amt: 31010000, qty: 388 },
];

const brandSales = [
  { brand: "설화수",    amt: 15800000 },
  { brand: "랑콤",      amt: 12400000 },
  { brand: "에스티로더", amt: 11200000 },
  { brand: "SK-II",     amt: 9600000  },
  { brand: "조말론",    amt: 8100000  },
  { brand: "기타",      amt: 15110000 },
];

const monthRevenue = channels.reduce((s, c) => s + c.amt, 0);
const lastMonthRevenue = 64800000;
const salesQty = channels.reduce((s, c) => s + c.qty, 0);
const supplyAmount = Math.round(monthRevenue / 1.1);
const vat = monthRevenue - supplyAmount;

const daysUntil = (dateStr) => Math.round((new Date(dateStr) - new Date(today)) / 86400000);
const NINETY_DAYS = 90;
const totalStockQty = inventory.reduce((s, i) => s + i.stock, 0);
const stockAssetValue = inventory.reduce((s, i) => s + i.stock * i.cost, 0);
const expiringSoon = inventory.filter((i) => i.stock > 0 && daysUntil(i.expire) <= NINETY_DAYS);
const belowSafety = inventory.filter((i) => i.stock < i.safety);
const outOfStock = inventory.filter((i) => i.stock === 0);

const vendors = [
  { id: 1, name: "아모레퍼시픽", bizNo: "106-81-12345", manager: "김아모", phone: "02-709-5000", terms: "위탁 60일", status: "거래중", since: "2021-03" },
  { id: 2, name: "LG생활건강",   bizNo: "107-86-23456", manager: "박엘지", phone: "02-3773-1114", terms: "완사입",    status: "거래중", since: "2021-05" },
  { id: 3, name: "에스티로더컴퍼니즈", bizNo: "120-81-34567", manager: "이로더", phone: "02-3440-2000", terms: "위탁 45일", status: "거래중", since: "2022-01" },
  { id: 4, name: "로레알코리아", bizNo: "211-88-45678", manager: "최랑콤", phone: "02-3705-8000", terms: "위탁 60일", status: "거래중", since: "2022-07" },
  { id: 5, name: "P&G프레스티지", bizNo: "220-81-56789", manager: "정피지", phone: "02-2007-3000", terms: "완사입",    status: "거래중", since: "2023-02" },
  { id: 6, name: "시슬리코리아", bizNo: "314-81-67890", manager: "한시슬", phone: "02-540-9000",  terms: "위탁 45일", status: "거래중지", since: "2020-09" },
];

const brands = [
  { id: 1, name: "설화수",     vendorId: 1, category: "스킨케어",  skuCount: 2 },
  { id: 2, name: "헤라",       vendorId: 1, category: "메이크업",  skuCount: 1 },
  { id: 3, name: "라네즈",     vendorId: 1, category: "스킨케어",  skuCount: 2 },
  { id: 4, name: "후",         vendorId: 2, category: "스킨케어",  skuCount: 1 },
  { id: 5, name: "오휘",       vendorId: 2, category: "스킨케어",  skuCount: 1 },
  { id: 6, name: "에스티로더", vendorId: 3, category: "스킨케어",  skuCount: 1 },
  { id: 7, name: "조말론",     vendorId: 3, category: "향수",      skuCount: 1 },
  { id: 8, name: "랑콤",       vendorId: 4, category: "스킨케어",  skuCount: 1 },
  { id: 9, name: "SK-II",      vendorId: 5, category: "스킨케어",  skuCount: 1 },
  { id: 10, name: "시슬리",    vendorId: 6, category: "스킨케어",  skuCount: 1 },
];

const vendorOf = (brandName) => {
  const b = brands.find((x) => x.name === brandName);
  return b ? vendors.find((v) => v.id === b.vendorId).name : "—";
};

const products = inventory.map((it) => {
  const consign = ["설화수", "에스티로더", "조말론", "랑콤", "시슬리"].includes(it.brand);
  return {
    id: it.id, name: it.name, sku: it.sku, brand: it.brand,
    vendor: vendorOf(it.brand),
    contract: consign ? "위탁" : "완사입",
    costBase: consign ? "공급원가" : "매입원가",
    cost: it.cost, retail: it.retail,
    status: it.stock === 0 ? "품절" : "판매중",
  };
});

const opening = { "SUL-YJ-090": 30, "WHO-BC-050": 70, "HER-BC-015": 40, "LAN-GEN-050": 25, "SK2-FTE-230": 50, "LAN-LSM-020": 130 };
const nameOf = (sku) => (products.find((p) => p.sku === sku) || {}).name || sku;
const ledgerSeed = [
  { date: "2026-06-02", sku: "SUL-YJ-090", lot: "L2602A", type: "입고",     qty: 120, wh: "인천공항 T1", note: "PO-2606-001 입고" },
  { date: "2026-06-02", sku: "LAN-GEN-050", lot: "L2604A", type: "입고",     qty: 60,  wh: "인천공항 T2", note: "PO-2606-002 입고" },
  { date: "2026-06-03", sku: "WHO-BC-050", lot: "L2601B", type: "판매출고",  qty: -22, wh: "인천공항 T1", note: "오프라인 판매" },
  { date: "2026-06-04", sku: "SUL-YJ-090", lot: "L2602A", type: "판매출고",  qty: -8,  wh: "인천공항 T1", note: "온라인 주문 N2606-0412" },
  { date: "2026-06-05", sku: "HER-BC-015", lot: "L2603A", type: "입고",     qty: 80,  wh: "신라 장충",   note: "PO-2606-005 입고" },
  { date: "2026-06-06", sku: "SK2-FTE-230", lot: "L2601E", type: "판매출고", qty: -18, wh: "롯데 명동",   note: "오프라인 판매" },
  { date: "2026-06-06", sku: "LAN-LSM-020", lot: "L2604C", type: "입고",     qty: 200, wh: "인천공항 T1", note: "PO-2606-008 입고" },
  { date: "2026-06-08", sku: "HER-BC-015", lot: "L2603A", type: "판매출고",  qty: -24, wh: "신라 장충",   note: "오프라인 판매" },
  { date: "2026-06-08", sku: "SK2-FTE-230", lot: "L2601E", type: "반출",     qty: -14, wh: "롯데 명동",   note: "본사 반출(행사)" },
  { date: "2026-06-09", sku: "LAN-GEN-050", lot: "L2604A", type: "판매출고",  qty: -11, wh: "인천공항 T2", note: "온라인 주문 C2606-2210" },
  { date: "2026-06-10", sku: "SUL-YJ-090", lot: "L2602A", type: "조정",     qty: 0,   wh: "인천공항 T1", note: "실사 차이 없음" },
  { date: "2026-06-10", sku: "LAN-LSM-020", lot: "L2604C", type: "판매출고",  qty: -20, wh: "인천공항 T1", note: "GWP 증정 차감" },
  { date: "2026-06-11", sku: "WHO-BC-050", lot: "L2601B", type: "판매출고",  qty: -10, wh: "인천공항 T1", note: "오프라인 판매" },
];
const run = { ...opening };
const ledger = ledgerSeed.map((r, i) => {
  run[r.sku] = (run[r.sku] || 0) + r.qty;
  return { id: i + 1, ...r, name: nameOf(r.sku), balance: run[r.sku] };
});
const openTotal = Object.values(opening).reduce((s, n) => s + n, 0);
const inTotal = ledger.filter((r) => r.qty > 0).reduce((s, r) => s + r.qty, 0);
const outTotal = ledger.filter((r) => r.qty < 0).reduce((s, r) => s + Math.abs(r.qty), 0);
const ledgerSummary = { open: openTotal, in: inTotal, out: outTotal, close: openTotal + inTotal - outTotal };

const mkSettle = (id, month, vendor, sales, rate, commRate, status) => {
  const supply = Math.round(sales / 1.1);
  const vat = sales - supply;
  const commission = Math.round(supply * commRate);
  const payout = supply - commission;
  return { id, month, vendor, sales, supply, vat, commission, payout, status };
};
const settlements = [
  mkSettle(1, "2026-05", "아모레퍼시픽", 28400000, 0.55, 0.12, "마감"),
  mkSettle(2, "2026-05", "에스티로더컴퍼니즈", 19800000, 0.5, 0.15, "마감"),
  mkSettle(3, "2026-05", "로레알코리아", 14200000, 0.52, 0.14, "마감"),
  mkSettle(4, "2026-05", "LG생활건강", 9600000, 0.6, 0.10, "마감"),
  mkSettle(5, "2026-05", "P&G프레스티지", 7300000, 0.58, 0.10, "마감"),
  mkSettle(6, "2026-06", "아모레퍼시픽", 12100000, 0.55, 0.12, "진행중"),
  mkSettle(7, "2026-06", "에스티로더컴퍼니즈", 8900000, 0.5, 0.15, "진행중"),
  mkSettle(8, "2026-06", "로레알코리아", 6400000, 0.52, 0.14, "진행중"),
];
const settleRecon = { month: "2026-05", openStock: 246300000, inbound: 88200000, outbound: 71500000, closeStock: 263000000 };

const ERP_DATA = {
  today,
  monthLabel: "2026년 6월",
  inventory, vendors, brands, products,
  ledger, ledgerSummary, settlements, settleRecon,
  dailySales, channels, brandSales,
  monthRevenue, lastMonthRevenue, salesQty, supplyAmount, vat,
  metrics: {
    skuCount: inventory.length,
    totalStockQty, stockAssetValue,
    expiringSoonCount: expiringSoon.length,
    belowSafetyCount: belowSafety.length,
    outOfStockCount: outOfStock.length,
  },
  helpers: { daysUntil },
};

export default ERP_DATA;