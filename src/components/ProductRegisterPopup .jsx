export function ProductRegisterPopup({ brands, vendors, nextSku, onClose, onSave }) {
    const [f, setF] = useState({
        brand: brands[0]?.brandCd ?? '',
        name: '', sku: nextSku, barcode: '', capacity: '', unit: 'EA',
        vendor: vendors[0]?.vendorCd ?? '',
        taxFree: true, vatIncluded: true,
        cost: '', retail: '', supplyCost: '', mfgCost: '',
        qtyPerBox: '', boxPerPallet: '',
        status: '판매중',
    });
    const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
    const save = () => onSave({
        productNo: f.sku,
        brandCd: f.brand,
        vendorCd: f.vendor,
        productNmKo: f.name.trim() || '신규 상품',
        barcode: f.barcode,
        capacity: Number(f.capacity) || null,
        unit: f.unit,
        taxFree: f.taxFree,
        retailPrice: Number(f.retail) || 0,
        costPrice: Number(f.cost) || null,
        supplyCost: Number(f.supplyCost) || null,
        mfgCost: Number(f.mfgCost) || null,
        qtyPerBox: Number(f.qtyPerBox) || null,
        boxPerPallet: Number(f.boxPerPallet) || null,
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

                    <Field label="용량">
                        <TextInput type="number" value={f.capacity}
                            onChange={(e) => set('capacity', e.target.value)}
                            placeholder="예: 90" />
                    </Field>
                    <Field label="단위">
                        <Select value={f.unit} onChange={(e) => set('unit', e.target.value)}>
                            <option>EA</option><option>ml</option><option>g</option>
                            <option>cc</option><option>inch</option>
                        </Select>
                    </Field>

                    <Field label="부가세 설정" full>
                        <div className="vat-row">
                            <RadioGroup name="tax" value={f.taxFree ? 'free' : 'tax'}
                                onChange={(v) => set('taxFree', v === 'free')}
                                options={[{ value: 'free', label: '면세' }, { value: 'tax', label: '과세' }]} />
                            <Checkbox checked={f.vatIncluded} onChange={(v) => set('vatIncluded', v)}>VAT 포함</Checkbox>
                        </div>
                    </Field>

                    <Field label="소비자가" required><MoneyInput value={f.retail} onChange={(v) => set('retail', v)} /></Field>
                    <Field label="매입원가"><MoneyInput value={f.cost} onChange={(v) => set('cost', v)} /></Field>
                    <Field label="공급원가"><MoneyInput value={f.supplyCost} onChange={(v) => set('supplyCost', v)} /></Field>
                    <Field label="제조원가"><MoneyInput value={f.mfgCost} onChange={(v) => set('mfgCost', v)} /></Field>

                    <Field label="박스당 입수 (EA)">
                        <div className="input-with-tag">
                            <TextInput type="number" value={f.qtyPerBox}
                                onChange={(e) => set('qtyPerBox', e.target.value)}
                                placeholder="예: 24" />
                            <span className="auto-tag">EA</span>
                        </div>
                    </Field>
                    <Field label="파레트당 박스 수">
                        <div className="input-with-tag">
                            <TextInput type="number" value={f.boxPerPallet}
                                onChange={(e) => set('boxPerPallet', e.target.value)}
                                placeholder="예: 40" />
                            <span className="auto-tag">BOX</span>
                        </div>
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