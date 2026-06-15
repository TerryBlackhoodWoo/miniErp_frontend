import { useState } from 'react';
import { Modal, Field, TextInput, Select } from '../ui';
import { PopupFooter } from '../shared';

export function StoreRegisterPopup({ initialData, onClose, onSave }) {
    const isEdit = !!initialData;
    const [f, setF] = useState({
        storeId: initialData?.storeId,
        storeNm: initialData?.storeNm ?? '',
        storeType: initialData?.storeType ?? '공항',
        storeCd: initialData?.storeCd ?? '',
    });
    const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
    const save = () => onSave({
        storeId: f.storeId,
        storeNm: f.storeNm.trim(),
        storeType: f.storeType,
        storeCd: f.storeCd.trim(),
    });

    return (
        <Modal
            title={isEdit ? '지점 수정' : '지점 등록'}
            subtitle={isEdit ? '지점 정보를 수정합니다' : '판매 지점을 등록합니다'}
            onClose={onClose}
            footer={<PopupFooter onClose={onClose} onSave={save} saveLabel={isEdit ? '수정' : '저장'} />}
        >
            <div className="form-grid">
                <Field label="지점명" required full>
                    <TextInput value={f.storeNm} onChange={(e) => set('storeNm', e.target.value)}
                        placeholder="예: 인천공항 T1점" autoFocus />
                </Field>
                <Field label="지점 유형">
                    <Select value={f.storeType} onChange={(e) => set('storeType', e.target.value)}>
                        <option>공항</option>
                        <option>시내</option>
                        <option>백화점</option>
                    </Select>
                </Field>
                <Field label="면세점 코드">
                    <TextInput value={f.storeCd} onChange={(e) => set('storeCd', e.target.value)}
                        placeholder="예: ICN-T1" />
                </Field>
            </div>
        </Modal>
    );
}