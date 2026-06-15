import { useState } from 'react';
import { Modal, Field, TextInput } from '../ui';
import { PopupFooter } from '../shared';

export function ReceivePopup({ order, onClose, onSave }) {
    const [f, setF] = useState({
        receivedQty: order.orderQty ?? '',
        lotNo: '',
        expireDate: '',
        logisticsMemo: '',
    });
    const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

    const save = () => onSave(order.orderId, {
        receivedQty: Number(f.receivedQty) || 0,
        lotNo: f.lotNo,
        expireDate: f.expireDate || null,
        logisticsMemo: f.logisticsMemo,
    });

    return (
        <Modal title="입고 처리" subtitle={`발주 #${order.orderId} · ${order.productNo}`} onClose={onClose}
            footer={<PopupFooter onClose={onClose} onSave={save} saveLabel="입고 확정" />}>
            <div className="form-grid">
                <Field label="실입고 수량" required>
                    <TextInput type="number" value={f.receivedQty}
                        onChange={(e) => set('receivedQty', e.target.value)}
                        placeholder="예: 240" />
                </Field>
                <Field label="LOT 번호" required>
                    <TextInput value={f.lotNo} onChange={(e) => set('lotNo', e.target.value)}
                        placeholder="예: L2602A" />
                </Field>
                <Field label="유통기한">
                    <TextInput type="date" value={f.expireDate}
                        onChange={(e) => set('expireDate', e.target.value)} />
                </Field>
                <Field label="물류 메모">
                    <TextInput value={f.logisticsMemo} onChange={(e) => set('logisticsMemo', e.target.value)}
                        placeholder="예: CJ대한통운" />
                </Field>
            </div>
            <p className="aside-hint" style={{ marginTop: 8 }}>
                박스/파레트 수, 물류비는 상품의 입수단위 및 창고 파레트단가를 기준으로 자동 계산됩니다.
            </p>
        </Modal>
    );
}