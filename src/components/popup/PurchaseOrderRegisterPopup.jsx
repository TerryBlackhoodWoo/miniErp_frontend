import { useState } from 'react';
import { Modal, Field, Select, TextInput, Checkbox } from '../ui';
import { PopupFooter } from '../shared';

export function PurchaseOrderRegisterPopup({ products, stores, warehouses, onClose, onSave }) {
    const [f, setF] = useState({
        storeId: stores[0]?.storeId ?? '',
        warehouseId: warehouses[0]?.warehouseId ?? '',
        productNo: products[0]?.productNo ?? '',
        orderQty: '',
        isDirect: false,
    });
    const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

    const save = () => {
        const product = products.find((p) => p.productNo === f.productNo);
        onSave({
            storeId: Number(f.storeId),
            warehouseId: Number(f.warehouseId),
            productNo: f.productNo,
            brandCd: product?.brandCd,
            vendorCd: product?.vendorCd,
            orderQty: Number(f.orderQty) || 0,
            isDirect: f.isDirect,
        });
    };

    return (
        <Modal title="발주 등록" subtitle="신규 발주를 등록합니다" onClose={onClose}
            footer={<PopupFooter onClose={onClose} onSave={save} />}>
            <div className="form-grid">
                <Field label="발주 지점" required>
                    <Select value={f.storeId} onChange={(e) => set('storeId', e.target.value)}>
                        {stores.map((s) => <option key={s.storeId} value={s.storeId}>{s.storeNm}</option>)}
                    </Select>
                </Field>
                <Field label="입고 창고" required>
                    <Select value={f.warehouseId} onChange={(e) => set('warehouseId', e.target.value)}>
                        {warehouses.map((w) => <option key={w.warehouseId} value={w.warehouseId}>{w.warehouseNm}</option>)}
                    </Select>
                </Field>
                <Field label="" full>
                    <Checkbox checked={f.isDirect} onChange={(v) => set('isDirect', v)}>
                        직배송 (창고 경유 기록 자동 생성)
                    </Checkbox>
                </Field>
                <Field label="상품" required full>
                    <Select value={f.productNo} onChange={(e) => set('productNo', e.target.value)}>
                        {products.map((p) => <option key={p.productNo} value={p.productNo}>{p.productNmKo} ({p.productNo})</option>)}
                    </Select>
                </Field>
                <Field label="발주 수량" required>
                    <TextInput type="number" value={f.orderQty}
                        onChange={(e) => set('orderQty', e.target.value)}
                        placeholder="예: 240" />
                </Field>
            </div>
        </Modal>
    );
}