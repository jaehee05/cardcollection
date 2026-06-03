import type { PokemonCard, Rarity } from "../types";
import { RARITY_LABEL, RARITY_ORDER } from "../types";

export interface ParsedRow {
  rowIndex: number;
  card?: Partial<PokemonCard>;
  error?: string;
}

// 엑셀/구글시트에서 셀을 복사하면 행은 \n, 열은 \t로 구분됨.
//
// 컬럼 (왼쪽이 필수, 오른쪽으로 갈수록 옵션):
//   번호 | 이름 | 희귀도 | 시세 | 이미지URL | 일러스트
//
// 번호 셀은 `001` 처럼 단순 숫자도 되고, `001/080` 처럼 "번호/총수" 형식도 인식.
// 첫 행이 헤더면 자동으로 인식해서 스킵.
export function parseClipboardTsv(text: string, setId: string): ParsedRow[] {
  if (!text) return [];
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const out: ParsedRow[] = [];
  let dataRow = 0;
  let headerSkipped = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") continue;
    if (!headerSkipped && isHeaderRow(line)) {
      headerSkipped = true;
      continue;
    }
    headerSkipped = true;
    dataRow += 1;

    const cells = line.split("\t").map((c) => c.trim());
    const [numberRaw, name, rarityRaw, priceRaw, imageUrl, illustrator] = cells;

    const number = parseCardNumber(numberRaw);
    if (!number || number <= 0) {
      out.push({
        rowIndex: dataRow,
        error: `1열(번호)에 숫자가 없어요: "${numberRaw ?? ""}"`,
      });
      continue;
    }
    if (!name) {
      out.push({ rowIndex: dataRow, error: "2열(이름)이 비어있어요" });
      continue;
    }

    const rarity = parseRarity(rarityRaw);
    if (!rarity) {
      out.push({
        rowIndex: dataRow,
        error: `3열(희귀도)을 알 수 없어요: "${rarityRaw ?? ""}". C/U/R/RR/AR/SR/SAR/UR/MUR 또는 한글명 사용.`,
      });
      continue;
    }

    const marketPrice = priceRaw
      ? Number(priceRaw.replace(/[^0-9.-]/g, ""))
      : 0;

    out.push({
      rowIndex: dataRow,
      card: {
        id: `${setId}-${String(number).padStart(3, "0")}`,
        setId,
        number,
        name,
        rarity,
        marketPrice: Number.isFinite(marketPrice) ? marketPrice : 0,
        imageUrl: imageUrl || undefined,
        illustrator: illustrator || undefined,
      },
    });
  }

  return out;
}

// "001" / "1" / "001/080" / "1 / 80" 등 다양한 표기에서 카드 번호만 뽑는다.
function parseCardNumber(raw: string | undefined): number {
  if (!raw) return 0;
  const head = raw.split("/")[0]?.trim() ?? "";
  const digits = head.replace(/[^0-9]/g, "");
  return digits ? Number(digits) : 0;
}

function isHeaderRow(line: string): boolean {
  const first = line.split("\t")[0]?.trim() ?? "";
  if (!first) return false;
  return !/\d/.test(first);
}

function parseRarity(raw: string | undefined): Rarity | null {
  if (!raw) return null;
  const norm = raw.trim().toUpperCase();
  if ((RARITY_ORDER as string[]).includes(norm)) return norm as Rarity;
  for (const r of RARITY_ORDER) {
    if (RARITY_LABEL[r] === raw.trim()) return r;
  }
  const aliases: Record<string, Rarity> = {
    커먼: "C",
    common: "C",
    언커먼: "U",
    uncommon: "U",
    레어: "R",
    rare: "R",
    더블레어: "RR",
    "더블 레어": "RR",
    아트레어: "AR",
    "아트 레어": "AR",
    슈퍼레어: "SR",
    "슈퍼 레어": "SR",
    스페셜아트: "SAR",
    "스페셜 아트": "SAR",
    "스페셜 아트레어": "SAR",
    "스페셜 아트 레어": "SAR",
    울트라레어: "UR",
    "울트라 레어": "UR",
    메가울트라레어: "MUR",
    "메가 울트라레어": "MUR",
    "메가 울트라 레어": "MUR",
  };
  const key = raw.trim().toLowerCase();
  for (const [k, v] of Object.entries(aliases)) {
    if (k.toLowerCase() === key) return v;
  }
  return null;
}
