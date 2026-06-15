import { won,Badge } from '../../components/ui';
import { ProductRegisterPopup } from '../../components';
import api from '../../api/axios';

export default function ProductTab({
    products, setProducts, brands, vendors, nextSku,
    match, popup, setPopup, editTarget, setEditTarget,
}) {
    const isOpen = popup === 'product';

    const closePopup = () => { setPopup(null); setEditTarget(null); };

    const save = async (row) => {
        const res = await api.post('/api/products', row);
        setProducts((p) => [res.data, ...p]);
        closePopup();
        return res.data; 
    };

    const update = async (row) => {
        const res = await api.put(`/api/products/${row.productNo}`, row);
        setProducts((ps) => ps.map((p) => p.productNo === res.data.productNo ? res.data : p));
        closePopup();
        return res.data; 
    };

    return (
        <>
        <table className="data-table">
            <thead>
                <tr>
                    <th style={{ width: '200px' }}>상품명 / 품번</th>
                    <th style={{ width: '90px' }}>브랜드</th>
                    <th style={{ width: '100px' }}>협력사</th>
                    <th style={{ width: '70px' }}>용량</th>
                    <th style={{ width: '70px' }}>면세</th>
                    <th className="t-right" style={{ width: '90px' }}>소비자가</th>
                    <th className="t-right" style={{ width: '90px' }}>매입원가</th>
                    <th className="t-right" style={{ width: '90px' }}>공급원가</th>
                    <th className="t-right" style={{ width: '90px' }}>제조원가</th>
                    <th style={{ width: '80px' }}>입수단위</th>
                </tr>
            </thead>
            <tbody>
                {products
                    .filter((p) => match(p.productNmKo) || match(p.productNo))
                    .map((p) => {
                        const brandNm = brands.find((b) => b.brandCd === p.brandCd)?.brandNm ?? p.brandCd;
                        const vendorNm = vendors.find((v) => v.vendorCd === p.vendorCd)?.vendorNm ?? p.vendorCd;
                        return (
                            <tr key={p.productNo} onClick={() => { setEditTarget(p); setPopup('product'); }} style={{ cursor: 'pointer' }}>
                                <td>
                                    <div className="t-name">{p.productNmKo}</div>
                                    <div className="t-sku">{p.productNo}</div>
                                </td>
                                <td className="t-brand">{brandNm}</td>
                                <td className="muted">{vendorNm}</td>
                                <td style={{ textAlign: 'center' }} className="muted">
                                    {p.capacity != null ? `${p.capacity}${p.unit ?? ''}` : '—'}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <Badge tone={p.taxFree ? 'neutral' : 'ok'}>{p.taxFree ? '면세' : '과세'}</Badge>
                                </td>
                                <td className="t-right mono">{won(p.retailPrice ?? 0)}</td>
                                <td className="t-right mono">{won(p.costPrice ?? 0)}</td>
                                <td className="t-right mono">{won(p.supplyCost ?? 0)}</td>
                                <td className="t-right mono">{won(p.mfgCost ?? 0)}</td>
                                <td style={{ textAlign: 'center' }} className="muted">
                                    {p.qtyPerBox != null && p.boxPerPallet != null
                                        ? `${p.qtyPerBox}×${p.boxPerPallet}`
                                        : '—'}
                                </td>
                            </tr>
                        );
                    })}
            </tbody>

        </table>

            {isOpen && (
                <ProductRegisterPopup
                    brands={brands} vendors={vendors}
                    nextSku={nextSku}
                    initialData={editTarget}
                    onClose={closePopup}
                    onSave={editTarget ? update : save}
                />
            )}
        </>
    );
}