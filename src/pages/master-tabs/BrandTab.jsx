import { Badge } from '../../components/ui';
import { BrandRegisterPopup } from '../../components';
import api from '../../api/axios';

export default function BrandTab({
    brands, setBrands, vendors,
    match, popup, setPopup, editTarget, setEditTarget,
}) {
    const isOpen = popup === 'brand';

    const closePopup = () => { setPopup(null); setEditTarget(null); };

    const save = async (row) => {
        const res = await api.post('/api/brands', row);
        setBrands((b) => [res.data, ...b]);
        closePopup();
    };

    const update = async (row) => {
        const res = await api.put(`/api/brands/${row.brandCd}`, row);
        setBrands((bs) => bs.map((b) => b.brandCd === res.data.brandCd ? res.data : b));
        closePopup();
    };

    return (
        <>
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
                            <tr key={b.brandCd} onClick={() => { setEditTarget(b); setPopup('brand'); }} style={{ cursor: 'pointer' }}>
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

            {isOpen && (
                <BrandRegisterPopup
                    vendors={vendors}
                    initialData={editTarget}
                    onClose={closePopup}
                    onSave={editTarget ? update : save}
                />
            )}
        </>
    );
}