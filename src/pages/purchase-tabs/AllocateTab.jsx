import { num, Button, StatusPill } from '../../components/ui';
import api from '../../api/axios';

export default function AllocateTab({
    orders, setOrders, products, stores, warehouses,
}) {
    const findName = (list, key, val) => list.find((x) => x[key] === val);

    const allocate = async (orderId) => {
        const res = await api.post(`/api/purchase-orders/${orderId}/allocate`);
        setOrders((os) => os.map((o) => o.orderId === res.data.orderId ? res.data : o));
    };

    return (
        <table className="data-table">
            <thead>
                <tr>
                    <th style={{ width: '60px' }}>발주ID</th>
                    <th style={{ width: '180px' }}>상품</th>
                    <th style={{ width: '110px' }}>창고</th>
                    <th style={{ width: '110px' }}>지점</th>
                    <th style={{ width: '90px' }}>LOT</th>
                    <th className="t-right" style={{ width: '90px' }}>실입고</th>
                    <th style={{ width: '90px' }}>상태</th>
                    <th style={{ width: '110px' }}></th>
                </tr>
            </thead>
            <tbody>
                {orders.map((o) => {
                    const product = findName(products, 'productNo', o.productNo);
                    const store = findName(stores, 'storeId', o.storeId);
                    const warehouse = findName(warehouses, 'warehouseId', o.warehouseId);
                    return (
                        <tr key={o.orderId}>
                            <td className="mono muted" style={{ textAlign: 'center' }}>{o.orderId}</td>
                            <td>
                                <div className="t-name">{product?.productNmKo ?? o.productNo}</div>
                                <div className="t-sku">{o.productNo}</div>
                            </td>
                            <td className="muted">{warehouse?.warehouseNm ?? '-'}</td>
                            <td className="muted">{store?.storeNm ?? '-'}</td>
                            <td className="mono muted" style={{ textAlign: 'center' }}>{o.lotNo ?? '—'}</td>
                            <td className="t-right mono">{o.receivedQty != null ? num(o.receivedQty) : '—'}</td>
                            <td style={{ textAlign: 'center' }}>
                                <StatusPill tone="ok">입고완료</StatusPill>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                <Button variant="ghost" onClick={() => allocate(o.orderId)}>
                                    배분 승인
                                </Button>
                            </td>
                        </tr>
                    );
                })}
                {orders.length === 0 && (
                    <tr><td colSpan="8"><div className="empty"><div className="empty-mark" /><div className="empty-title">배분 대기 중인 발주가 없습니다.</div></div></td></tr>
                )}
            </tbody>
        </table>
    );
}