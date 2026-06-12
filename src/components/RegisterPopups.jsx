import { useState } from 'react';
import {
    Modal, Field, TextInput, Select, Radio, RadioGroup,
    Checkbox, MoneyInput, ImageBox, Button,
} from './ui';

// 코드 자동생성 helper
export const genCode = (prefix, list, key) => {
    const nums = list.map((x) => {
        const m = String(x[key] || '').match(/(\d+)$/);
        return m ? +m[1] : 0;
    });
    const next = (Math.max(0, ...nums) + 1).toString().padStart(3, '0');
    return prefix + next;
};

// ── 팝업 하단 액션바 ──
function PopupFooter({ onClose, onSave, saveLabel = '저장' }) {
    return (
        <>
            <span className="foot-hint"><i className="req">*</i> 필수 입력 항목</span>
            <div className="foot-actions">
                <Button variant="ghost" onClick={onClose}>닫기</Button>
                <Button onClick={onSave}>{saveLabel}</Button>
            </div>
        </>
    );
}

// ════════════ 상품 등록 ════════════
export function ProductRegisterPopup({ brands, vendors, nextSku, onClose, onSave }) {
    const [f, setF] = useState({
        brand: brands[0]?.brandCd ?? '',
        name: '', sku: nextSku, barcode: '', spec: '', unit: 'EA',
        vendor: vendors[0]?.vendorCd ?? '',
        contract: '완사입', taxFree: true, vatIncluded: true,
        cost: '', retail: '', outPrice: '', status: '판매중',
    });
    const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
    const save = () => onSave({
        name: f.name.trim() || '신규 상품',
        sku: f.sku, barcode: f.barcode,
        spec: f.spec, unit: f.unit,
        brandCd: f.brand,
        vendorCd: f.vendor,
        contractType: f.contract,
        taxFree: f.taxFree,
        costPrice: Number(f.cost) || 0,
        retailPrice: Number(f.retail) || 0,
        outPrice: Number(f.outPrice) || 0,
        status: f.status,
    });

    return (
        <Modal title="상품 등록" subtitle="신규 상품을 마스터에 등록합니다" wide onClose={onClose}
            footer={<PopupFooter onClose={onClose} onSave={save} />}>
            <div className="popup-2col">
                <div className="form-grid">
                    <Field label="브랜드">
                        <Select value={f.brand} onChange={(e) => set('brand', e.target.value)}>
                            {brands.map((b) => <option key={b.brandCd} value={b.brandCd}>{b.brandNm}</option>)}
                        </Select>
                    </Field>
                    <Field label="협력사">
                        <Select value={f.vendor} onChange={(e) => set('vendor', e.target.value)}>
                            {vendors.map((v) => <option key={v.vendorCd} value={v.vendorCd}>{v.vendorNm}</option>)}
                        </Select>
                    </Field>

                    <Field label="상품명" required full>
                        <TextInput value={f.name} onChange={(e) => set('name', e.target.value)}
                            placeholder="예: 윤조에센스 90ml" autoFocus />
                    </Field>

                    <Field label="품번 (SKU)">
                        <div className="input-with-tag">
                            <TextInput value={f.sku} onChange={(e) => set('sku', e.target.value)} />
                            <span className="auto-tag">자동</span>
                        </div>
                    </Field>
                    <Field label="바코드">
                        <TextInput value={f.barcode} onChange={(e) => set('barcode', e.target.value)}
                            placeholder="880 0000 00000" />
                    </Field>

                    <Field label="규격">
                        <TextInput value={f.spec} onChange={(e) => set('spec', e.target.value)}
                            placeholder="예: 90ml" />
                    </Field>
                    <Field label="단위">
                        <Select value={f.unit} onChange={(e) => set('unit', e.target.value)}>
                            <option>EA</option><option>SET</option><option>BOX</option>
                        </Select>
                    </Field>

                    <Field label="계약형태">
                        <RadioGroup name="contract" value={f.contract} onChange={(v) => set('contract', v)}
                            options={[{ value: '완사입', label: '완사입' }, { value: '위탁', label: '위탁' }]} />
                    </Field>
                    <Field label="부가세 설정">
                        <div className="vat-row">
                            <RadioGroup name="tax" value={f.taxFree ? 'free' : 'tax'}
                                onChange={(v) => set('taxFree', v === 'free')}
                                options={[{ value: 'free', label: '면세' }, { value: 'tax', label: '과세' }]} />
                            <Checkbox checked={f.vatIncluded} onChange={(v) => set('vatIncluded', v)}>VAT 포함</Checkbox>
                        </div>
                    </Field>

                    <Field label="매입원가"><MoneyInput value={f.cost} onChange={(v) => set('cost', v)} /></Field>
                    <Field label="소비자가"><MoneyInput value={f.retail} onChange={(v) => set('retail', v)} /></Field>
                    <Field label="출고단가"><MoneyInput value={f.outPrice} onChange={(v) => set('outPrice', v)} /></Field>
                    <Field label="사용상태">
                        <RadioGroup name="pstatus" value={f.status} onChange={(v) => set('status', v)}
                            options={[{ value: '판매중', label: '판매중' }, { value: '단종', label: '단종' }]} />
                    </Field>
                </div>

                <div className="popup-aside">
                    <span className="aside-label">상품 이미지</span>
                    <ImageBox />
                    <p className="aside-hint">권장 1:1 비율 · JPG/PNG</p>
                </div>
            </div>
        </Modal>
    );
}

// ════════════ 협력사 등록 ════════════
export function VendorRegisterPopup({ onClose, onSave }) {
    const [f, setF] = useState({ vendorCd: '', vendorNm: '' });
    const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
    const save = () => onSave({ vendorCd: f.vendorCd.trim(), vendorNm: f.vendorNm.trim() });

    return (
        <Modal title="협력사 등록" subtitle="신규 거래처(공급사)를 등록합니다" onClose={onClose}
            footer={<PopupFooter onClose={onClose} onSave={save} />}>
            <div className="form-grid">
                <Field label="협력사 코드" required>
                    <div className="input-with-tag">
                        <TextInput value={f.vendorCd} onChange={(e) => set('vendorCd', e.target.value)}
                            placeholder="예: AMP-19" autoFocus />
                        <span className="auto-tag">6자</span>
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

// ════════════ 브랜드 등록 ════════════
export function BrandRegisterPopup({ vendors, onClose, onSave }) {
    const [f, setF] = useState({
        brandCd: '', vendorCd: vendors[0]?.vendorCd ?? '',
        brandNm: '', brandType: 'DOMESTIC', supplyRate: '',
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
        <Modal title="브랜드 등록" subtitle="신규 브랜드를 등록합니다" onClose={onClose}
            footer={<PopupFooter onClose={onClose} onSave={save} />}>
            <div className="form-grid">
                <Field label="브랜드 코드" required>
                    <div className="input-with-tag">
                        <TextInput value={f.brandCd} onChange={(e) => set('brandCd', e.target.value)}
                            placeholder="예: SUL-17" autoFocus />
                        <span className="auto-tag">6자</span>
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

// ════════════ 창고 등록 ════════════
export function WarehouseRegisterPopup({ nextCode, onClose, onSave }) {
    const [f, setF] = useState({
        name: '', code: nextCode, type: '공항', location: '', manager: '', phone: '', status: '사용중',
    });
    const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
    const save = () => onSave({
        name: f.name.trim() || '신규 창고', code: f.code, type: f.type,
        location: f.location || '-', manager: f.manager || '-',
        phone: f.phone || '-', status: f.status,
    });

    return (
        <Modal title="창고 등록" subtitle="재고를 보관·관리할 창고(지점)를 등록합니다" onClose={onClose}
            footer={<PopupFooter onClose={onClose} onSave={save} />}>
            <div className="form-grid">
                <Field label="창고명" required full>
                    <TextInput value={f.name} onChange={(e) => set('name', e.target.value)}
                        placeholder="예: 인천공항 T1" autoFocus />
                </Field>
                <Field label="창고코드">
                    <div className="input-with-tag">
                        <TextInput value={f.code} onChange={(e) => set('code', e.target.value)} />
                        <span className="auto-tag">자동</span>
                    </div>
                </Field>
                <Field label="유형">
                    <Select value={f.type} onChange={(e) => set('type', e.target.value)}>
                        <option>공항</option><option>시내</option><option>물류센터</option>
                    </Select>
                </Field>
                <Field label="위치 / 주소" full>
                    <TextInput value={f.location} onChange={(e) => set('location', e.target.value)}
                        placeholder="예: 인천공항 제1터미널 면세구역" />
                </Field>
                <Field label="담당자">
                    <TextInput value={f.manager} onChange={(e) => set('manager', e.target.value)}
                        placeholder="김창고" />
                </Field>
                <Field label="연락처">
                    <TextInput value={f.phone} onChange={(e) => set('phone', e.target.value)}
                        placeholder="032-000-0000" />
                </Field>
                <Field label="사용상태" full>
                    <RadioGroup name="wstatus" value={f.status} onChange={(v) => set('status', v)}
                        options={[{ value: '사용중', label: '사용중' }, { value: '미사용', label: '미사용' }]} />
                </Field>
            </div>
        </Modal>
    );
}