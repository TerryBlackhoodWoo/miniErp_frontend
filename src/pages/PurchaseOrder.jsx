import { useState, useEffect } from 'react';
import { Toolbar, Button } from '../components/ui';
import api from '../api/axios';
import PurchaseOrderTab from './purchase-tabs/PurchaseOrderTab';
import ReceiveTab from './purchase-tabs/ReceiveTab';
import AllocateTab from './purchase-tabs/AllocateTab';

export default function PurchaseOrder() {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [stores, setStores] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [popup, setPopup] = useState(null);
    const [receiveTarget, setReceiveTarget] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/api/purchase-orders'),
            api.get('/api/products'),
            api.get('/api/stores'),
            api.get('/api/warehouses'),
        ]).then(([po, p, s, w]) => {
            setOrders(po.data);
            setProducts(p.data);
            setStores(s.data);
            setWarehouses(w.data);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <section>
            <div className="empty" style={{ padding: '80px 0' }}>
                <div className="empty-title">불러오는 중...</div>
            </div>
        </section>
    );

    const pendingOrders = orders.filter((o) => o.status === 'PENDING');
    const receivedOrders = orders.filter((o) => o.status === 'RECEIVED');

    return (
        <section>
            <div className="page-head">
                <div>
                    <div className="section-kicker">LOGISTICS</div>
                    <h2 className="page-title">발주 · 입고</h2>
                    <p className="page-desc">발주 등록, 입고 처리, 지점 배분을 관리합니다.</p>
                </div>
            </div>

            {/* ── 입고 대기 (협력사 → 창고) ── */}
            <div className="section-kicker" style={{ marginTop: 8 }}>RECEIVING</div>
            <h3 className="page-title" style={{ fontSize: 18, marginBottom: 8 }}>입고 대기</h3>
            <div className="card table-card">
                <ReceiveTab
                    orders={pendingOrders} setOrders={setOrders}
                    products={products} stores={stores} warehouses={warehouses}
                    popup={popup} setPopup={setPopup}
                    receiveTarget={receiveTarget} setReceiveTarget={setReceiveTarget}
                />
            </div>

            {/* ── 배분 대기 (창고 → 지점) ── */}
            <div className="section-kicker" style={{ marginTop: 24 }}>ALLOCATION</div>
            <h3 className="page-title" style={{ fontSize: 18, marginBottom: 8 }}>배분 대기</h3>
            <div className="card table-card">
                <AllocateTab
                    orders={receivedOrders} setOrders={setOrders}
                    products={products} stores={stores} warehouses={warehouses}
                />
            </div>

            {/* ── 발주 목록 ── */}
            <div className="section-kicker" style={{ marginTop: 24 }}>PURCHASE ORDERS</div>
            <h3 className="page-title" style={{ fontSize: 18, marginBottom: 8 }}>발주 목록</h3>
            <Toolbar
                search=""
                onSearch={() => { }}
                placeholder="검색 (준비중)"
                action={<Button onClick={() => setPopup('create')}>+ 발주 등록</Button>}
            />
            <div className="card table-card">
                <PurchaseOrderTab
                    orders={orders} setOrders={setOrders}
                    products={products} stores={stores} warehouses={warehouses}
                    popup={popup} setPopup={setPopup}
                />
            </div>
        </section>
    );
}