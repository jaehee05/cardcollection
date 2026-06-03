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
