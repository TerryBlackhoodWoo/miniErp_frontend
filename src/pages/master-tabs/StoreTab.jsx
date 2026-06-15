import { Badge } from '../../components/ui';
import { StoreRegisterPopup } from '../../components';
import api from '../../api/axios';

export default function StoreTab({
    stores, setStores,
    match, popup, setPopup, editTarget, setEditTarget,
}) {
    const isOpen = popup === 'store';

    const closePopup = () => { setPopup(null); setEditTarget(null); };

    const save = async (row) => {
        const res = await api.post('/api/stores', row);
        setStores((s) => [res.data, ...s]);
        closePopup();
    };

    const update = async (row) => {
        const res = await api.put(`/api/stores/${row.storeId}`, row);
        setStores((ss) => ss.map((s) => s.storeId === res.data.storeId ? res.data : s));
        closePopup();
    };

    return (
        <>
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
                        <tr key={s.storeId} onClick={() => { setEditTarget(s); setPopup('store'); }} style={{ cursor: 'pointer' }}>
                            <td className="t-brand">{s.storeNm}</td>
                            <td style={{ textAlign: 'center' }}>
                                <Badge tone="neutral">{s.storeType ?? '-'}</Badge>
                            </td>
                            <td className="mono muted" style={{ textAlign: 'center' }}>{s.storeCd ?? '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isOpen && (
                <StoreRegisterPopup
                    initialData={editTarget}
                    onClose={closePopup}
                    onSave={editTarget ? update : save}
                />
            )}
        </>
    );
}