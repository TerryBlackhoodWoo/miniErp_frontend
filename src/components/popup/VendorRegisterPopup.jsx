import { useState } from 'react';
import { Modal, Field, TextInput } from '../ui';
import { PopupFooter } from '../shared';

export function VendorRegisterPopup({ initialData, onClose, onSave }) {
    const isEdit = !!initialData;
    const [f, setF] = useState({
        vendorCd: initialData?.vendorCd ?? '',
        vendorNm: initialData?.vendorNm ?? '',
    });
    const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
    const save = () => onSave({ vendorCd: f.vendorCd.trim(), vendorNm: f.vendorNm.trim() });

    return (
        <Modal
            title={isEdit ? '협력사 수정' : '협력사 등록'}
            subtitle={isEdit ? '협력사 정보를 수정합니다' : '신규 거래처(공급사)를 등록합니다'}
            onClose={onClose}
            footer={<PopupFooter onClose={onClose} onSave={save} saveLabel={isEdit ? '수정' : '저장'} />}
        >
            <div className="form-grid">
                <Field label="협력사 코드" required>
                    <div className="input-with-tag">
                        <TextInput
                            value={f.vendorCd}
                            onChange={(e) => set('vendorCd', e.target.value)}
                            placeholder="예: AMP-19"
                            autoFocus
                            disabled={isEdit}
                        />
                        <span className="auto-tag">{isEdit ? 'PK' : '6자'}</span>
                    </div>
                </Field>
                <Field label="협력사명" required>
                    <TextInput value={f.vendorNm} onChange={(e) => set('vendorNm', e.target.value)}
                        placeholder="예: 아모레퍼시픽" />
                </Field>
            </div>
        </Modal>
    );
}