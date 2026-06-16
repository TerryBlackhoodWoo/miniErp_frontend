import { useState } from 'react';
import { Modal, Field, Select, TextInput } from '../ui';
import { PopupFooter } from '../shared';

export function SalesRegisterPopup({ products, stores, onClose, onSave }) {
    const [f, setF] = useState({
        storeId: stores[0]?.storeId ?? '',
        productNo: products[0]?.productNo ?? '',
        channel: 'OFFLINE',
        orderNo: '',
        saleQty: '',
        salePrice: '',
    });
    const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

    const selectedProduct = products.find((p) => p.productNo === f.productNo);

    const save = () => {
        onSave({
            storeId: Number(f.storeId),
            productNo: f.productNo,
            channel: f.channel,
            orderNo: f.channel === 'ONLINE' ? (f.orderNo || null) : null,
            saleQty: Number(f.saleQty) || 0,
            salePrice: f.salePrice ? Number(f.salePrice) : (selectedProduct?.salePrice ?? selectedProduct?.retailPrice ?? null),
        });
    };

    return (
        <Modal title="판매 등록" subtitle="신규 판매를 등록합니다" onClose={onClose}
            footer={<PopupFooter onClose={onClose} onSave={save} saveLabel="판매 확정" />}>
            <div className="form-grid">
                <Field label="판매 채널" required>
                    <Select value={f.channel} onChange={(e) => set('channel', e.target.value)}>
                        <option value="OFFLINE">OFFLINE</option>
                        <option value="ONLINE">ONLINE</option>
                    </Select>
                </Field>
                <Field label="판매 지점" required>
                    <Select value={f.storeId} onChange={(e) => set('storeId', e.target.value)}>
                        {stores.map((s) => <option key={s.storeId} value={s.storeId}>{s.storeNm}</option>)}
                    </Select>
                </Field>
                <Field label="상품" required full>
                    <Select value={f.productNo} onChange={(e) => set('productNo', e.target.value)}>
                        {products.map((p) => <option key={p.productNo} value={p.productNo}>{p.productNmKo} ({p.productNo})</option>)}
                    </Select>
                </Field>
                <Field label="판매 수량" required>
                    <TextInput type="number" value={f.saleQty}
                        onChange={(e) => set('saleQty', e.target.value)}
                        placeholder="예: 5" />
                </Field>
                <Field label="판매가">
                    <TextInput type="number" value={f.salePrice}
                        onChange={(e) => set('salePrice', e.target.value)}
                        placeholder={selectedProduct?.salePrice ? `기본: ${selectedProduct.salePrice}` : '예: 25000'} />
                </Field>
                {f.channel === 'ONLINE' && (
                    <Field label="주문번호" full>
                        <TextInput value={f.orderNo} onChange={(e) => set('orderNo', e.target.value)}
                            placeholder="예: NV20260616-001" />
                    </Field>
                )}
            </div>
            <p className="aside-hint" style={{ marginTop: 8 }}>
                LOT은 유통기한이 빠른 순(FIFO)으로 자동 선택되며, 재고가 부족하면 등록이 거부됩니다.
            </p>
        </Modal>
    );
}