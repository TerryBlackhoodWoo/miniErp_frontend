import { num, Badge, Button } from '../../components/ui';
import { ReceivePopup } from '../../components';
import api from '../../api/axios';

export default function ReceiveTab({
    orders, setOrders, products, stores, warehouses,
    popup, setPopup, receiveTarget, setReceiveTarget,
}) {
    const isReceiveOpen = popup === 'receive';
    const closePopup = () => { setPopup(null); setReceiveTarget(null); };

    const receive = async (orderId, body) => {
        const res = await api.post(`/api/purchase-orders/${orderId}/receive`, body);
        setOrders((os) => os.map((o) => o.orderId === res.data.orderId ? res.data : o));
        closePopup();
    };

    const findName = (list, key, val) => list.find((x) => x[key] === val);

    return (
        <>
            <table className="data-table">
                <thead>
                    <tr>
                        <th style={{ width: '60px' }}>발주ID</th>
                        <th style={{ width: '180px' }}>상품</th>
                        <th style={{ width: '120px' }}>지점</th>
                        <th style={{ width: '120px' }}>창고</th>
                        <th className="t-right" style={{ width: '90px' }}>발주수량</th>
                        <th style={{ width: '100px' }}></th>
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
                                <td className="muted">{store?.storeNm ?? '-'}</td>
                                <td className="muted">
                                    {o.isDirect ? '직배송' : (warehouse?.warehouseNm ?? '-')}
                                    {o.isDirect && <Badge tone="warn" style={{ marginLeft: 6 }}>직배송</Badge>}
                                </td>
                                <td className="t-right mono">{num(o.orderQty ?? 0)}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <Button variant="ghost" onClick={() => { setReceiveTarget(o); setPopup('receive'); }}>
                                        입고처리
                                    </Button>
                                </td>
                            </tr>
                        );
                    })}
                    {orders.length === 0 && (
                        <tr><td colSpan="6"><div className="empty"><div className="empty-mark" /><div className="empty-title">입고 대기 중인 발주가 없습니다.</div></div></td></tr>
                    )}
                </tbody>
            </table>

            {isReceiveOpen && receiveTarget && (
                <ReceivePopup
                    order={receiveTarget}
                    onClose={closePopup}
                    onSave={receive}
                />
            )}
        </>
    );
}