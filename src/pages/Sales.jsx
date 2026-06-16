import { useState, useEffect } from 'react';
import { Toolbar, Button, num, won, Badge } from '../components/ui';
import api from '../api/axios';
import { SalesRegisterPopup } from '../components';

const CHANNEL_TONE = { ONLINE: 'ok', OFFLINE: 'muted' };

export default function Sales() {
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [stores, setStores] = useState([]);
    const [popup, setPopup] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/api/sales'),
            api.get('/api/products'),
            api.get('/api/stores'),
        ]).then(([s, p, st]) => {
            setSales(s.data);
            setProducts(p.data);
            setStores(st.data);
        }).finally(() => setLoading(false));
    }, []);

    const findName = (list, key, val) => list.find((x) => x[key] === val);

    const create = async (row) => {
        setErrorMsg('');
        try {
            const res = await api.post('/api/sales', row);
            setSales((s) => [res.data, ...s]);
            setPopup(null);
        } catch (e) {
            const msg = e.response?.data?.error ?? '판매 등록에 실패했습니다.';
            setErrorMsg(msg);
        }
    };

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
                    <div className="section-kicker">SALES</div>
                    <h2 className="page-title">판매</h2>
                    <p className="page-desc">온 · 오프라인 채널 판매 등록 및 이력을 관리합니다.</p>
                </div>
            </div>

            <Toolbar
                search=""
                onSearch={() => { }}
                placeholder="검색 (준비중)"
                action={<Button onClick={() => { setErrorMsg(''); setPopup('create'); }}>+ 판매 등록</Button>}
            />

            {errorMsg && (
                <div className="card" style={{ padding: '12px 16px', marginBottom: 12, borderColor: 'var(--danger, #c0392b)' }}>
                    <span style={{ color: 'var(--danger, #c0392b)' }}>{errorMsg}</span>
                </div>
            )}

            <div className="card table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '60px' }}>판매ID</th>
                            <th style={{ width: '90px' }}>채널</th>
                            <th style={{ width: '160px' }}>상품</th>
                            <th style={{ width: '110px' }}>지점</th>
                            <th style={{ width: '90px' }}>LOT</th>
                            <th className="t-right" style={{ width: '80px' }}>수량</th>
                            <th className="t-right" style={{ width: '100px' }}>판매가</th>
                            <th style={{ width: '120px' }}>주문번호</th>
                            <th style={{ width: '140px' }}>판매일시</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map((s) => {
                            const product = findName(products, 'productNo', s.productNo);
                            const store = findName(stores, 'storeId', s.storeId);
                            return (
                                <tr key={s.saleId}>
                                    <td className="mono muted" style={{ textAlign: 'center' }}>{s.saleId}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <Badge tone={CHANNEL_TONE[s.channel] ?? 'muted'}>{s.channel}</Badge>
                                    </td>
                                    <td>
                                        <div className="t-name">{product?.productNmKo ?? s.productNo}</div>
                                        <div className="t-sku">{s.productNo}</div>
                                    </td>
                                    <td className="muted">{store?.storeNm ?? '-'}</td>
                                    <td className="mono muted" style={{ textAlign: 'center' }}>{s.lotNo ?? '-'}</td>
                                    <td className="t-right mono">{num(s.saleQty ?? 0)}</td>
                                    <td className="t-right mono">{s.salePrice != null ? won(s.salePrice) : '-'}</td>
                                    <td className="mono muted">{s.orderNo ?? '-'}</td>
                                    <td className="mono muted">{(s.saleAt || '').slice(0, 16).replace('T', ' ')}</td>
                                </tr>
                            );
                        })}
                        {sales.length === 0 && (
                            <tr><td colSpan="9"><div className="empty"><div className="empty-mark" /><div className="empty-title">등록된 판매가 없습니다.</div></div></td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {popup === 'create' && (
                <SalesRegisterPopup
                    products={products} stores={stores}
                    onClose={() => setPopup(null)}
                    onSave={create}
                />
            )}
        </section>
    );
}