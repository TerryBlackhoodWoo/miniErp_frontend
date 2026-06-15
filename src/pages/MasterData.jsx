import { useState, useEffect } from 'react';
import { Tabs, Toolbar, Button } from '../components/ui';
import { genCode } from '../components';
import api from '../api/axios';

import ProductTab from './master-tabs/ProductTab';
import BrandTab from './master-tabs/BrandTab';
import VendorTab from './master-tabs/VendorTab';
import WarehouseTab from './master-tabs/WarehouseTab';
import StoreTab from './master-tabs/StoreTab';

export default function MasterData() {
    const [tab, setTab] = useState('product');
    const [products, setProducts] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [brands, setBrands] = useState([]);
    const [stores, setStores] = useState([]);
    const [search, setSearch] = useState('');
    const [popup, setPopup] = useState(null);
    const [editTarget, setEditTarget] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/api/products'),
            api.get('/api/vendors'),
            api.get('/api/warehouses'),
            api.get('/api/brands'),
            api.get('/api/stores'),
        ]).then(([p, v, w, b, s]) => {
            setProducts(p.data);
            setVendors(v.data);
            setWarehouses(w.data);
            setBrands(b.data);
            setStores(s.data);
        }).finally(() => setLoading(false));
    }, []);

    useEffect(() => { setSearch(''); setEditTarget(null); }, [tab]);

    const tabs = [
        { key: 'product', label: '상품', count: products.length },
        { key: 'brand', label: '브랜드', count: brands.length },
        { key: 'vendor', label: '협력사', count: vendors.length },
        { key: 'warehouse', label: '창고', count: warehouses.length },
        { key: 'store', label: '지점', count: stores.length },
    ];

    const q = search.trim().toLowerCase();
    const match = (s) => !q || (s || '').toLowerCase().includes(q);

    const addLabel = {
        product: '상품 등록', brand: '브랜드 등록',
        vendor: '협력사 등록', warehouse: '창고 등록', store: '지점 등록',
    }[tab];

    const placeholder = {
        product: '상품명 · 품번 검색', brand: '브랜드명 검색',
        vendor: '협력사명 검색', warehouse: '창고명 검색', store: '지점명 검색',
    }[tab];

    if (loading) return (
        <section>
            <div className="empty" style={{ padding: '80px 0' }}>
                <div className="empty-title">불러오는 중...</div>
            </div>
        </section>
    );

    const commonProps = { match, popup, setPopup, editTarget, setEditTarget };

    return (
        <section>
            <div className="page-head">
                <div>
                    <div className="section-kicker">MASTER</div>
                    <h2 className="page-title">기초정보 관리</h2>
                    <p className="page-desc">상품 · 브랜드 · 협력사 · 창고 · 지점 마스터를 관리합니다.</p>
                </div>
            </div>

            <Tabs tabs={tabs} value={tab} onChange={setTab} />
            <Toolbar
                search={search}
                onSearch={setSearch}
                placeholder={placeholder}
                action={<Button onClick={() => { setEditTarget(null); setPopup(tab); }}>+ {addLabel}</Button>}
            />

            <div className="card table-card">
                {tab === 'product' && (
                    <ProductTab
                        products={products} setProducts={setProducts}
                        brands={brands} vendors={vendors}
                        nextSku={genCode('SKU-', products, 'productNo')}
                        {...commonProps}
                    />
                )}
                {tab === 'brand' && (
                    <BrandTab
                        brands={brands} setBrands={setBrands}
                        vendors={vendors}
                        {...commonProps}
                    />
                )}
                {tab === 'vendor' && (
                    <VendorTab
                        vendors={vendors} setVendors={setVendors}
                        brands={brands}
                        {...commonProps}
                    />
                )}
                {tab === 'warehouse' && (
                    <WarehouseTab
                        warehouses={warehouses} setWarehouses={setWarehouses}
                        nextCode={genCode('WH-', warehouses, 'warehouseId')}
                        {...commonProps}
                    />
                )}
                {tab === 'store' && (
                    <StoreTab
                        stores={stores} setStores={setStores}
                        {...commonProps}
                    />
                )}
            </div>
        </section>
    );
}