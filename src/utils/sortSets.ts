import type { CardSet } from "../types";

// 확장팩(세트)을 "최신순"으로 정렬하기 위한 비교 함수.
// 우선순위: 발매일 desc → 세트 코드 자연 정렬 desc → 이름.
//
// 코드 자연 정렬: localeCompare(numeric:true) 사용 → "SV10" > "SV7a" 정확히 처리.
export function compareSetsLatestFirst(a: CardSet, b: CardSet): number {
  const ra = a.releaseDate ?? "";
  const rb = b.releaseDate ?? "";
  if (ra && rb && ra !== rb) {
    return rb.localeCompare(ra);
  }
  const ca = a.code ?? "";
  const cb = b.code ?? "";
  if (ca && cb && ca !== cb) {
    return cb.localeCompare(ca, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  }
  // 한쪽만 코드가 있으면 코드 있는 쪽이 앞
  if (ca && !cb) return -1;
  if (!ca && cb) return 1;
  return (a.name ?? "").localeCompare(b.name ?? "");
}
