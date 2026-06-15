import { useState } from 'react';
import { Modal, Field, TextInput, Select, RadioGroup } from '../ui';
import { PopupFooter } from '../shared';

export function BrandRegisterPopup({ vendors, initialData, onClose, onSave }) {
    const isEdit = !!initialData;
    const [f, setF] = useState({
        brandCd: initialData?.brandCd ?? '',
        vendorCd: initialData?.vendorCd ?? vendors[0]?.vendorCd ?? '',
        brandNm: initialData?.brandNm ?? '',
        brandType: initialData?.brandType ?? 'DOMESTIC',
        supplyRate: initialData?.supplyRate ?? '',
    });
    const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
    const save = () => onSave({
        brandCd: f.brandCd.trim(),
        vendorCd: f.vendorCd,
        brandNm: f.brandNm.trim(),
        brandType: f.brandType,
        supplyRate: Number(f.supplyRate) || null,
    });

    return (
        <Modal
            title={isEdit ? '브랜드 수정' : '브랜드 등록'}
            subtitle={isEdit ? '브랜드 정보를 수정합니다' : '신규 브랜드를 등록합니다'}
            onClose={onClose}
            footer={<PopupFooter onClose={onClose} onSave={save} saveLabel={isEdit ? '수정' : '저장'} />}
        >
            <div className="form-grid">
                <Field label="브랜드 코드" required>
                    <div className="input-with-tag">
                        <TextInput
                            value={f.brandCd}
                            onChange={(e) => set('brandCd', e.target.value)}
                            placeholder="예: SUL-17"
                            autoFocus
                            disabled={isEdit}
                        />
                        <span className="auto-tag">{isEdit ? 'PK' : '6자'}</span>
                    </div>
                </Field>
                <Field label="협력사" required>
                    <Select value={f.vendorCd} onChange={(e) => set('vendorCd', e.target.value)}>
                        {vendors.map((v) => <option key={v.vendorCd} value={v.vendorCd}>{v.vendorNm}</option>)}
                    </Select>
                </Field>
                <Field label="브랜드명" required full>
                    <TextInput value={f.brandNm} onChange={(e) => set('brandNm', e.target.value)}
                        placeholder="예: 설화수" />
                </Field>
                <Field label="브랜드 유형">
                    <RadioGroup name="brandType" value={f.brandType} onChange={(v) => set('brandType', v)}
                        options={[{ value: 'DOMESTIC', label: '국산' }, { value: 'IMPORT', label: '수입' }]} />
                </Field>
                <Field label="공급률">
                    <div className="input-with-tag">
                        <TextInput type="number" value={f.supplyRate}
                            onChange={(e) => set('supplyRate', e.target.value)}
                            placeholder="예: 65" />
                        <span className="auto-tag">%</span>
                    </div>
                </Field>
            </div>
        </Modal>
    );
}