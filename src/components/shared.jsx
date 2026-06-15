import { Button } from './ui';

// 코드 자동생성 helper
export const genCode = (prefix, list, key) => {
    const nums = list.map((x) => {
        const m = String(x[key] || '').match(/(\d+)$/);
        return m ? +m[1] : 0;
    });
    const next = (Math.max(0, ...nums) + 1).toString().padStart(3, '0');
    return prefix + next;
};

// 팝업 하단 액션바
export function PopupFooter({ onClose, onSave, saveLabel = '저장' }) {
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