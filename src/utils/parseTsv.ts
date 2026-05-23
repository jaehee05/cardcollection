import type {
  CardStage,
  PokemonCard,
  PokemonType,
  Rarity,
} from "../types";
import { RARITY_LABEL, RARITY_ORDER, TYPE_LABEL } from "../types";

export interface ParsedRow {
  // 1-based row index in the pasted text, headers 제외
  rowIndex: number;
  card?: Partial<PokemonCard>;
  error?: string;
}

// 엑셀/구글시트에서 셀을 복사하면 행은 \n, 열은 \t로 구분됨.
// 컬럼 순서: 번호 | 이름 | 희귀도 | 타입 | HP | 진화단계 | 시세 | 이미지URL(선택) | 일러스트(선택)
//
// 첫 행이 헤더면 자동으로 인식해서 스킵한다.
// 빈 줄은 무시.
export function parseClipboardTsv(text: string, setId: string): ParsedRow[] {
  if (!text) return [];
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const out: ParsedRow[] = [];
  let dataRow = 0;
  let headerSkipped = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") continue;
    // 첫 비어있지 않은 행이 헤더처럼 보이면 스킵
    if (!headerSkipped && isHeaderRow(line)) {
      headerSkipped = true;
      continue;
    }
    headerSkipped = true;
    dataRow += 1;

    const cells = line.split("\t").map((c) => c.trim());
    const [
      numberRaw,
      name,
      rarityRaw,
      typeRaw,
      hpRaw,
      stageRaw,
      priceRaw,
      imageUrl,
      illustrator,
    ] = cells;

    const number = Number((numberRaw ?? "").replace(/[^0-9]/g, ""));
    if (!number || number <= 0) {
      out.push({ rowIndex: dataRow, error: `1열(번호)에 숫자가 없어요: "${numberRaw}"` });
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
        error: `3열(희귀도)을 알 수 없어요: "${rarityRaw}". C/U/R/RR/AR/SR/SAR/UR 또는 한글명 사용.`,
      });
      continue;
    }
    const type = parseType(typeRaw);
    if (!type) {
      out.push({
        rowIndex: dataRow,
        error: `4열(타입)을 알 수 없어요: "${typeRaw}".`,
      });
      continue;
    }

    const hp = hpRaw ? Number(hpRaw.replace(/[^0-9]/g, "")) : undefined;
    const stage = parseStage(stageRaw);
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
        type,
        hp: Number.isFinite(hp) ? hp : undefined,
        stage,
        marketPrice: Number.isFinite(marketPrice) ? marketPrice : 0,
        imageUrl: imageUrl || undefined,
        illustrator: illustrator || undefined,
      },
    });
  }

  return out;
}

function isHeaderRow(line: string): boolean {
  // 첫 셀이 숫자면 데이터, 아니면 헤더로 추정
  const first = line.split("\t")[0]?.trim() ?? "";
  if (!first) return false;
  return !/^\d/.test(first);
}

function parseRarity(raw: string | undefined): Rarity | null {
  if (!raw) return null;
  const norm = raw.trim().toUpperCase();
  if ((RARITY_ORDER as string[]).includes(norm)) return norm as Rarity;
  // 한글명 역인덱스
  for (const r of RARITY_ORDER) {
    if (RARITY_LABEL[r] === raw.trim()) return r;
  }
  // 일부 별칭
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
  };
  const key = raw.trim().toLowerCase();
  for (const [k, v] of Object.entries(aliases)) {
    if (k.toLowerCase() === key) return v;
  }
  return null;
}

function parseType(raw: string | undefined): PokemonType | null {
  if (!raw) return null;
  const norm = raw.trim().toLowerCase();
  // 영문 키 직접
  if ((Object.keys(TYPE_LABEL) as PokemonType[]).includes(norm as PokemonType)) {
    return norm as PokemonType;
  }
  // 한글 → 키
  for (const [k, label] of Object.entries(TYPE_LABEL) as [PokemonType, string][]) {
    if (label === raw.trim()) return k;
  }
  const aliases: Record<string, PokemonType> = {
    풀: "grass",
    불: "fire",
    불꽃: "fire",
    물: "water",
    번개: "lightning",
    전기: "lightning",
    초: "psychic",
    에스퍼: "psychic",
    격투: "fighting",
    악: "darkness",
    어둠: "darkness",
    강철: "metal",
    드래곤: "dragon",
    무: "colorless",
    무색: "colorless",
    노말: "colorless",
    트레이너: "trainer",
    굿즈: "trainer",
    서포트: "trainer",
    스타디움: "trainer",
    에너지: "energy",
  };
  return aliases[raw.trim()] ?? null;
}

function parseStage(raw: string | undefined): CardStage {
  if (!raw) return "기본";
  const norm = raw.trim();
  const ok: CardStage[] = ["기본", "1진화", "2진화", "트레이너", "에너지"];
  if ((ok as string[]).includes(norm)) return norm as CardStage;
  if (norm.includes("기본") || norm.toLowerCase() === "basic") return "기본";
  if (norm.includes("1") || norm.toLowerCase().includes("stage 1")) return "1진화";
  if (norm.includes("2") || norm.toLowerCase().includes("stage 2")) return "2진화";
  if (norm.toLowerCase().includes("trainer")) return "트레이너";
  if (norm.toLowerCase().includes("energy")) return "에너지";
  return "기본";
}

export const TSV_TEMPLATE_HEADER =
  "번호\t이름\t희귀도\t타입\tHP\t진화단계\t시세\t이미지URL\t일러스트";
