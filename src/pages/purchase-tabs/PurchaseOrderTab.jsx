import { won, num, Badge, StatusPill, Button } from '../../components/ui';
import { PurchaseOrderRegisterPopup, ReceivePopup } from '../../components';
import api from '../../api/axios';

export default function PurchaseOrderTab({
    orders, setOrders, products, stores, warehouses,
    popup, setPopup, receiveTarget, setReceiveTarget,
}) {
    const isCreateOpen = popup === 'create';
    const isReceiveOpen = popup === 'receive';

    const closePopup = () => { setPopup(null); setReceiveTarget(null); };

    const create = async (row) => {
        const res = await api.post('/api/purchase-orders', row);
        setOrders((o) => [res.data, ...o]);
        closePopup();
    };

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
                        <th style={{ width: '160px' }}>상품</th>
                        <th style={{ width: '100px' }}>지점</th>
                        <th style={{ width: '100px' }}>창고</th>
                        <th className="t-right" style={{ width: '80px' }}>발주수량</th>
                        <th className="t-right" style={{ width: '80px' }}>실입고</th>
                        <th style={{ width: '90px' }}>LOT</th>
                        <th style={{ width: '90px' }}>유통기한</th>
                        <th className="t-right" style={{ width: '70px' }}>파레트</th>
                        <th className="t-right" style={{ width: '90px' }}>물류비</th>
                        <th style={{ width: '90px' }}>상태</th>
                        <th style={{ width: '90px' }}></th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((o) => {
                        const product = findName(products, 'productNo', o.productNo);
                        const store = findName(stores, 'storeId', o.storeId);
                        const warehouse = findName(warehouses, 'warehouseId', o.warehouseId);
                        const isPending = o.status === 'PENDING';
                        return (
                            <tr key={o.orderId}>
                                <td className="mono muted" style={{ textAlign: 'center' }}>{o.orderId}</td>
                                <td>
                                    <div className="t-name">{product?.productNmKo ?? o.productNo}</div>
                                    <div className="t-sku">{o.productNo}</div>
                                </td>
                                <td className="muted">{store?.storeNm ?? '-'}</td>
                                <td className="muted">{warehouse?.warehouseNm ?? '-'}</td>
                                <td className="t-right mono">{num(o.orderQty ?? 0)}</td>
                                <td className="t-right mono">{o.receivedQty != null ? num(o.receivedQty) : '—'}</td>
                                <td className="mono muted" style={{ textAlign: 'center' }}>{o.lotNo ?? '—'}</td>
                                <td className="mono muted" style={{ textAlign: 'center' }}>{o.expireDate ?? '—'}</td>
                                <td className="t-right mono">{o.palletCount ?? '—'}</td>
                                <td className="t-right mono">{o.logisticsCost != null ? won(o.logisticsCost) : '—'}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <StatusPill tone={isPending ? 'warn' : 'ok'}>
                                        {isPending ? '입고대기' : '입고완료'}
                                    </StatusPill>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    {isPending && (
                                        <Button variant="ghost" onClick={() => { setReceiveTarget(o); setPopup('receive'); }}>
                                            입고처리
                                        </Button>
                                    )}
                                </td>
                                <td className="muted">
                                    {warehouse?.warehouseNm ?? '-'}
                                    {o.isDirect && <Badge tone="warn" style={{ marginLeft: 6 }}>직배송</Badge>}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {isCreateOpen && (
                <PurchaseOrderRegisterPopup
                    products={products} stores={stores} warehouses={warehouses}
                    onClose={closePopup}
                    onSave={create}
                />
            )}
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