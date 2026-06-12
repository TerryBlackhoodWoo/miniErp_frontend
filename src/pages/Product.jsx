import { useState, useEffect } from 'react';
import { won, Tabs, Toolbar, Button, Badge, StatusPill } from '../components/ui';
import {
    ProductRegisterPopup, VendorRegisterPopup, WarehouseRegisterPopup,
    BrandRegisterPopup, StoreRegisterPopup, genCode,
} from '../components/ProductRegisterPopup ';
import api from '../api/axios';

export default function Product() {
    const [tab, setTab] = useState('product');
    const [products, setProducts] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [brands, setBrands] = useState([]);
    const [stores, setStores] = useState([]);
    const [search, setSearch] = useState('');
    const [popup, setPopup] = useState(null);
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

    useEffect(() => { setSearch(''); }, [tab]);

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

    const saveVendor = async (row) => { const res = await api.post('/api/vendors', row); setVendors((v) => [res.data, ...v]); setPopup(null); };
    const saveBrand = async (row) => { const res = await api.post('/api/brands', row); setBrands((b) => [res.data, ...b]); setPopup(null); };
    const saveWarehouse = async (row) => {
        const res = await api.post('/api/warehouses', {
            warehouseNm: row.name,
            warehouseType: row.type,
            location: row.location,
            manager: row.manager,
            phone: row.phone,
            status: row.status,
            costPerPallet: row.costPerPallet,
        });
        setWarehouses((w) => [res.data, ...w]);
        setPopup(null);
    };
    const saveProduct = async (row) => { const res = await api.post('/api/products', row); setProducts((p) => [res.data, ...p]); setPopup(null); };
    const saveStore = async (row) => { const res = await api.post('/api/stores', row); setStores((s) => [res.data, ...s]); setPopup(null); };

    if (loading) return (
        <section>
            <div className="empty" style={{ padding: '80px 0' }}>
                <div className="empty-title">불러오는 중...</div>
            </div>
        </section>
    );

    return (
        <section>
            <div className="page-head">
                <div>
                    <div className="section-kicker">MASTER</div>
                    <h2 className="page-title">상품 관리</h2>
                    <p className="page-desc">상품 · 브랜드 · 협력사 · 창고 · 지점 마스터를 관리합니다.</p>
                </div>
            </div>

            <Tabs tabs={tabs} value={tab} onChange={setTab} />
            <Toolbar search={search} onSearch={setSearch} placeholder={placeholder}
                action={<Button onClick={() => setPopup(tab)}>+ {addLabel}</Button>} />

            <div className="card table-card">

                {/* ── 상품 ── */}
                {tab === 'product' && (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '220px' }}>상품명 / 품번</th>
                                <th style={{ width: '100px' }}>브랜드</th>
                                <th style={{ width: '110px' }}>협력사</th>
                                <th style={{ width: '80px' }}>용량</th>
                                <th className="t-right" style={{ width: '100px' }}>소비자가</th>
                                <th className="t-right" style={{ width: '100px' }}>매입원가</th>
                                <th className="t-right" style={{ width: '100px' }}>공급원가</th>
                                <th className="t-right" style={{ width: '100px' }}>제조원가</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products
                                .filter((p) => match(p.productNmKo) || match(p.productNo))
                                .map((p) => {
                                    const brandNm = brands.find((b) => b.brandCd === p.brandCd)?.brandNm ?? p.brandCd;
                                    const vendorNm = vendors.find((v) => v.vendorCd === p.vendorCd)?.vendorNm ?? p.vendorCd;
                                    return (
                                        <tr key={p.productNo}>
                                            <td>
                                                <div className="t-name">{p.productNmKo}</div>
                                                <div className="t-sku">{p.productNo}</div>
                                            </td>
                                            <td className="t-brand">{brandNm}</td>
                                            <td className="muted">{vendorNm}</td>
                                            <td style={{ textAlign: 'center' }} className="muted">
                                                {p.capacity != null ? `${p.capacity}${p.unit ?? ''}` : '—'}
                                            </td>
                                            <td className="t-right mono">{won(p.retailPrice ?? 0)}</td>
                                            <td className="t-right mono">{won(p.costPrice ?? 0)}</td>
                                            <td className="t-right mono">{won(p.supplyCost ?? 0)}</td>
                                            <td className="t-right mono">{won(p.mfgCost ?? 0)}</td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                )}

                {/* ── 브랜드 ── */}
                {tab === 'brand' && (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '200px' }}>브랜드명 / 코드</th>
                                <th style={{ width: '150px' }}>협력사</th>
                                <th style={{ width: '100px' }}>유형</th>
                                <th className="t-right" style={{ width: '100px' }}>공급률</th>
                            </tr>
                        </thead>
                        <tbody>
                            {brands.filter((b) => match(b.brandNm) || match(b.brandCd)).map((b) => {
                                const vendorNm = vendors.find((v) => v.vendorCd === b.vendorCd)?.vendorNm ?? b.vendorCd;
                                return (
                                    <tr key={b.brandCd}>
                                        <td>
                                            <div className="t-name">{b.brandNm}</div>
                                            <div className="t-sku">{b.brandCd}</div>
                                        </td>
                                        <td className="muted">{vendorNm}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <Badge tone={b.brandType === 'IMPORT' ? 'warn' : 'ok'}>
                                                {b.brandType === 'IMPORT' ? '수입' : '국산'}
                                            </Badge>
                                        </td>
                                        <td className="t-right mono">
                                            {b.supplyRate != null ? b.supplyRate + '%' : '—'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                {/* ── 협력사 ── */}
                {tab === 'vendor' && (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '220px' }}>협력사명 / 코드</th>
                                <th style={{ width: '100px' }}>브랜드 수</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vendors.filter((v) => match(v.vendorNm) || match(v.vendorCd)).map((v) => {
                                const brandCount = brands.filter((b) => b.vendorCd === v.vendorCd).length;
                                return (
                                    <tr key={v.vendorCd}>
                                        <td>
                                            <div className="t-name">{v.vendorNm}</div>
                                            <div className="t-sku">{v.vendorCd}</div>
                                        </td>
                                        <td style={{ textAlign: 'center' }} className="muted">{brandCount}개</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                {tab === 'warehouse' && (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '150px' }}>창고명</th>
                                <th style={{ width: '80px' }}>유형</th>
                                <th style={{ width: '180px' }}>위치</th>
                                <th style={{ width: '90px' }}>담당자</th>
                                <th style={{ width: '120px' }}>연락처</th>
                                <th className="t-right" style={{ width: '110px' }}>파레트 단가</th>
                                <th style={{ width: '80px' }}>상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {warehouses.filter((w) => match(w.warehouseNm)).map((w) => (
                                <tr key={w.warehouseId}>
                                    <td className="t-brand">{w.warehouseNm}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <Badge tone="neutral">{w.warehouseType ?? '-'}</Badge>
                                    </td>
                                    <td className="muted t-note">{w.location ?? '-'}</td>
                                    <td style={{ textAlign: 'center' }}>{w.manager ?? '-'}</td>
                                    <td className="mono muted" style={{ textAlign: 'center' }}>{w.phone ?? '-'}</td>
                                    <td className="t-right mono">{won(w.costPerPallet ?? 0)}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <StatusPill tone={w.status === '사용중' ? 'ok' : 'danger'}>
                                            {w.status ?? '사용중'}
                                        </StatusPill>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {/* ── 지점 ── */}
                {tab === 'store' && (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '220px' }}>지점명</th>
                                <th style={{ width: '100px' }}>유형</th>
                                <th style={{ width: '120px' }}>면세점 코드</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stores.filter((s) => match(s.storeNm) || match(s.storeCd)).map((s) => (
                                <tr key={s.storeId}>
                                    <td className="t-brand">{s.storeNm}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <Badge tone="neutral">{s.storeType ?? '-'}</Badge>
                                    </td>
                                    <td className="mono muted" style={{ textAlign: 'center' }}>{s.storeCd ?? '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {popup === 'product' && <ProductRegisterPopup brands={brands} vendors={vendors} nextSku={genCode('SKU-', products, 'productNo')} onClose={() => setPopup(null)} onSave={saveProduct} />}
            {popup === 'brand' && <BrandRegisterPopup vendors={vendors} onClose={() => setPopup(null)} onSave={saveBrand} />}
            {popup === 'vendor' && <VendorRegisterPopup onClose={() => setPopup(null)} onSave={saveVendor} />}
            {popup === 'warehouse' && <WarehouseRegisterPopup nextCode={genCode('WH-', warehouses, 'warehouseId')} onClose={() => setPopup(null)} onSave={saveWarehouse} />}
            {popup === 'store' && <StoreRegisterPopup onClose={() => setPopup(null)} onSave={saveStore} />}
        </section>
    );
}