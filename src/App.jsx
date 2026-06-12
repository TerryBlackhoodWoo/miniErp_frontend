import { useState } from 'react';
import ERP_DATA from './data/erpData';
import Dashboard from './pages/Dashboard';
import Product from './pages/Product';
import Inventory from './pages/Inventory';
import Settlement from './pages/Settlement';

const D = ERP_DATA;

const NAV = [
  { key: "dashboard", label: "대시보드" },
  { key: "product",   label: "상품" },
  { key: "po",        label: "발주 · 입고" },
  { key: "inventory", label: "재고 수불" },
  { key: "sales",     label: "판매" },
  { key: "settlement", label: "정산" },
];

const PAGE_META = {
  dashboard:  { title: "대시보드",    desc: "면세점 통합 운영 현황" },
  product:    { title: "상품 관리",   desc: "협력사 · 브랜드 · 상품 마스터" },
  po:         { title: "발주 · 입고", desc: "구매 발주 및 입고 처리" },
  inventory:  { title: "재고 수불",   desc: "입출고 이력 관리" },
  sales:      { title: "판매",        desc: "온 · 오프라인 채널 판매" },
  settlement: { title: "정산",        desc: "월별 협력사 정산" },
};

function LogoMark() {
  const [failed, setFailed] = useState(false);
  return (
    <div className="brand-mark">
      {failed ? "m" : <img src="/brand-logo.svg" alt="miniERP" onError={() => setFailed(true)} />}
    </div>
  );
}

function Sidebar({ active, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <LogoMark />
        <div className="brand-text">
          <div className="brand-name">miniERP</div>
          <div className="brand-sub">면세점 운영</div>
        </div>
      </div>
      <nav className="nav">
        {NAV.map((n) => (
          <button
            key={n.key}
            className={"nav-item" + (active === n.key ? " is-active" : "")}
            onClick={() => onNavigate(n.key)}
          >
            {n.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-foot">
        <div className="foot-user">
          <div className="foot-avatar">우</div>
          <div>
            <div className="foot-name">MD · 우영</div>
            <div className="foot-role">재고 · SCM 관리자</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function ComingSoon({ name }) {
  return (
    <section>
      <div className="empty" style={{ padding: "80px 0" }}>
        <div className="empty-mark" />
        <div className="empty-title">{name} 화면 준비 중</div>
        <div className="empty-desc">이 메뉴는 다음 단계에서 구현될 예정입니다.</div>
      </div>
    </section>
  );
}

export default function App() {
  const [page, setPage] = useState("dashboard");
  const meta = PAGE_META[page];

  return (
    <div className="layout">
      <Sidebar active={page} onNavigate={setPage} />
      <main className="main">
        <header className="topbar">
          <div>
            <h1>{meta.title}</h1>
            <p>{meta.desc} · {D.monthLabel} 기준</p>
          </div>
          <div className="topbar-right">
            <div className="today-pill">
              <span className="today-dot" />
              {D.today.replace(/-/g, ".")} 기준
            </div>
          </div>
        </header>
        <div className="content">
          {page === "dashboard"  && <Dashboard />}
          {page === "product"    && <Product />}
          {page === "inventory"  && <Inventory />}
          {page === "settlement" && <Settlement />}
          {page === "po"         && <ComingSoon name="발주 · 입고" />}
          {page === "sales"      && <ComingSoon name="판매" />}
        </div>
      </main>
    </div>
  );
}