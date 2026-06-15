import { won, Badge, StatusPill } from '../../components/ui';
import { WarehouseRegisterPopup } from '../../components';
import api from '../../api/axios';

export default function WarehouseTab({
    warehouses, setWarehouses, nextCode,
    match, popup, setPopup, editTarget, setEditTarget,
}) {
    const isOpen = popup === 'warehouse';

    const closePopup = () => { setPopup(null); setEditTarget(null); };

    const save = async (row) => {
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
        closePopup();
    };

    const update = async (row) => {
        const res = await api.put(`/api/warehouses/${row.warehouseId}`, {
            warehouseId: row.warehouseId,
            warehouseNm: row.name,
            warehouseType: row.type,
            location: row.location,
            manager: row.manager,
            phone: row.phone,
            status: row.status,
            costPerPallet: row.costPerPallet,
        });
        setWarehouses((ws) => ws.map((w) => w.warehouseId === res.data.warehouseId ? res.data : w));
        closePopup();
    };

    return (
        <>
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
                        <tr key={w.warehouseId} onClick={() => { setEditTarget(w); setPopup('warehouse'); }} style={{ cursor: 'pointer' }}>
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

            {isOpen && (
                <WarehouseRegisterPopup
                    nextCode={nextCode}
                    initialData={editTarget}
                    onClose={closePopup}
                    onSave={editTarget ? update : save}
                />
            )}
        </>
    );
}