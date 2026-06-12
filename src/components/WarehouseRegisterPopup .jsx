export function WarehouseRegisterPopup({ nextCode, onClose, onSave }) {
    const [f, setF] = useState({
        name: '', code: nextCode, type: '공항',
        location: '', manager: '', phone: '',
        status: '사용중', costPerPallet: '',
    });
    const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
    const save = () => onSave({
        name: f.name.trim() || '신규 창고',
        code: f.code, type: f.type,
        location: f.location || '-',
        manager: f.manager || '-',
        phone: f.phone || '-',
        status: f.status,
        costPerPallet: Number(f.costPerPallet) || 0,
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
                <Field label="파레트당 물류비">
                    <MoneyInput value={f.costPerPallet} onChange={(v) => set('costPerPallet', v)} />
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