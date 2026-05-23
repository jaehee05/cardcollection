// 카드 1번의 이미지 URL에서 "카드 번호" 자리를 추출해서 다른 번호의 URL을 생성한다.
//
// 예) extractPattern(1, "https://x.com/sv7a/001.png")
//   → { prefix: "https://x.com/sv7a/", pad: 3, suffix: ".png" }
// 예) applyPattern(5, pattern) → "https://x.com/sv7a/005.png"

export interface UrlPattern {
  prefix: string;
  pad: number;
  suffix: string;
  // 원본 URL을 같이 들고 다녀서 디버깅이나 미리보기에 사용
  source: string;
  sourceNumber: number;
}

export function extractPattern(
  cardNumber: number,
  url: string,
): UrlPattern | null {
  if (!url || cardNumber <= 0) return null;

  const numStr = String(cardNumber);
  const candidates: string[] = [];
  // pad 길이를 큰 것부터 시도 (가장 구체적인 zero-pad 우선)
  for (let pad = 5; pad >= numStr.length; pad--) {
    candidates.push(numStr.padStart(pad, "0"));
  }
  // 마지막에 padding 없는 원래 숫자도 시도
  if (!candidates.includes(numStr)) candidates.push(numStr);

  for (const variant of candidates) {
    // URL을 뒤에서부터 스캔 (카드 번호는 보통 끝 부분)
    let from = url.length;
    while (from >= variant.length) {
      const idx = url.lastIndexOf(variant, from - 1);
      if (idx < 0) break;
      // 양옆이 숫자가 아닌지 검증
      const before = idx === 0 ? "" : url[idx - 1];
      const after = idx + variant.length >= url.length ? "" : url[idx + variant.length];
      if (!/\d/.test(before) && !/\d/.test(after)) {
        return {
          prefix: url.slice(0, idx),
          pad: variant.length,
          suffix: url.slice(idx + variant.length),
          source: url,
          sourceNumber: cardNumber,
        };
      }
      from = idx;
    }
  }

  return null;
}

export function applyPattern(targetNumber: number, pattern: UrlPattern): string {
  const padded = String(targetNumber).padStart(pattern.pad, "0");
  return pattern.prefix + padded + pattern.suffix;
}

// 미리보기 문자열 — 패턴이 어떤 자리수를 사용하는지 사용자에게 안내
export function describePattern(pattern: UrlPattern): string {
  const placeholder = "#".repeat(pattern.pad);
  return `${pattern.prefix}${placeholder}${pattern.suffix}`;
}
