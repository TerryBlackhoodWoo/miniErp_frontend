import { Badge } from '../../components/ui';
import { VendorRegisterPopup } from '../../components';
import api from '../../api/axios';

export default function VendorTab({
    vendors, setVendors, brands,
    match, popup, setPopup, editTarget, setEditTarget,
}) {
    const isOpen = popup === 'vendor';

    const closePopup = () => { setPopup(null); setEditTarget(null); };

    const save = async (row) => {
        const res = await api.post('/api/vendors', row);
        setVendors((v) => [res.data, ...v]);
        closePopup();
    };

    const update = async (row) => {
        const res = await api.put(`/api/vendors/${row.vendorCd}`, row);
        setVendors((vs) => vs.map((v) => v.vendorCd === res.data.vendorCd ? res.data : v));
        closePopup();
    };

    return (
        <>
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
                            <tr key={v.vendorCd} onClick={() => { setEditTarget(v); setPopup('vendor'); }} style={{ cursor: 'pointer' }}>
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

            {isOpen && (
                <VendorRegisterPopup
                    initialData={editTarget}
                    onClose={closePopup}
                    onSave={editTarget ? update : save}
                />
            )}
        </>
    );
}