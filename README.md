# 콜렉션북 (cardcollection)

내가 보유한 포켓몬 카드를 입력하고, 그 카드들로 덱을 짜는 개인용 웹앱.

## 주요 기능
- **내 카드** (`?tab=cards`): 보유 카드 인벤토리.
  - **시리즈에서 추가**: 마스터 DB(Firestore)의 시리즈를 골라 카드 그리드에서 클릭 한 번에 +1. 번호 빠른 입력(엔터), 인쇄번호 전체 추가(시크릿 제외) 지원.
  - **직접 추가**: 마스터 DB에 없는 카드를 자유롭게 입력 (이름·시리즈마크·레귤레이션·번호·타입·HP·진화단계·희귀도·이미지URL·보유수량·메모).
  - 검색·필터·정렬, 보유만 보기.
- **덱** (`?tab=decks`): 보유 카드로 덱 구성. 60장·같은 이름 4장·스탠다드 합법(G/H/I)·보유 수량 초과 여부 자동 표시. 덱 메모.
- **카드 DB 관리자** (푸터 ⚙ 관리자): Firestore `sets` 컬렉션 편집 — 세트 추가/편집, 엑셀 TSV 붙여넣기, 이미지 URL 패턴 일괄 채움.
- **JSON 백업/복원**: 푸터 ↓/↑ 버튼으로 인벤토리+덱 데이터를 파일로.

## 데이터 저장
- **카드 마스터 DB** (`sets` 컬렉션) → **Firestore** (`cardcollection-30324`). 모든 기기에서 공유.
- **인벤토리·덱** → **localStorage** (이 기기 한정). 백업으로 옮기세요.

인벤토리 카드 중 마스터에서 가져온 카드는 `sourceSetId`+`sourceNumber`로 링크되어, 마스터의 이름/이미지/희귀도/레귤이 바뀌면 자동 반영됩니다.

## 개발
```bash
npm install
npm run dev     # http://localhost:5173
npm run build
```

> npm 캐시 권한 이슈 발생 시: `NPM_CONFIG_CACHE=/tmp/npm-cache-cardcoll npm ...`

## 배포
Vercel. main 브랜치 push로 자동 배포.

Live: https://cardcollection.vercel.app

## Firestore 규칙
`firestore.rules`에 sets 컬렉션 공개 read/write (MVP). 콘솔 테스트 모드 또는 `firebase deploy --only firestore:rules`.

## 스택
Vite + React 19 + TypeScript + Tailwind v3 + Firebase Firestore.
