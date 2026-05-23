// 숫자 전용 input.
// - value === 0이면 화면엔 빈칸 + placeholder="0"으로 표시 (0이 거슬리지 않게)
// - 비어있는 채로 두면 부모엔 0으로 전달 (값은 항상 number)
// - 포커스 시 기존 값 전체 선택 → 바로 새 숫자 타이핑 가능
// - 모바일 키패드는 숫자형(inputMode="numeric")
interface Props
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "type" | "min" | "max"
  > {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}

export function NumberInput({
  value,
  onChange,
  min = 0,
  max,
  placeholder = "0",
  onFocus,
  ...rest
}: Props) {
  return (
    <input
      type="number"
      inputMode="numeric"
      value={value === 0 ? "" : String(value)}
      placeholder={placeholder}
      min={min}
      max={max}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === "") {
          onChange(0);
          return;
        }
        const n = Number(raw);
        if (!Number.isFinite(n)) return;
        let next = n;
        if (typeof min === "number") next = Math.max(min, next);
        if (typeof max === "number") next = Math.min(max, next);
        onChange(next);
      }}
      onFocus={(e) => {
        // 모바일 Safari에서 select() 즉시 호출이 무시될 때가 있어 다음 틱으로
        const el = e.target;
        requestAnimationFrame(() => {
          try {
            el.select();
          } catch {
            /* ignore */
          }
        });
        onFocus?.(e);
      }}
      {...rest}
    />
  );
}
