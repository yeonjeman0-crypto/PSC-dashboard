# ① 제목
Paris MoU Deficiency Codes 가공·UI 적용 사양 v1.0 (tabler-dev 기준)

최신 확인 완료: 2025-08-23 (Asia/Seoul)

---

# ② 목적·핵심 요약
- 업로드된 **Paris MoU 결함(Deficiency) 코드** JSON을 **표준 Master 스키마**로 정규화하고, tabler-dev UI에 **툴팁·필터·차트**로 즉시 사용하도록 정의합니다.
- **계층 구조(대분류 2자리 → 중분류 3자리 → 코드 5자리)**를 유지하되, 프런트에서 상호작용하기 쉽도록 **평탄화(flatten)** 자료도 함께 제공합니다.
- **Top10 차트, 테이블, Heat Table, 필터**의 매핑 규칙과 **색상 팔레트**를 고정합니다.

---

# ③ 입력 구조 → 표준 스키마
## 3.1 입력(원본) 요약
- 루트 키: `paris_mou_deficiency_codes`
- 트리 구조: `categories[01..] → subcategories[011..] → deficiencies[{"01101":"title"}]`
- 메타: `metadata.source/system/version/disclaimer`

## 3.2 표준 Master 스키마(배열형)
다음 배열을 `defCodes.json`으로 생성합니다.
```json
[
  {
    "code": "01101",
    "title": "Cargo ship safety equipment (including exemption)",
    "category": "01",
    "categoryTitle": "Certificates & Documentation",
    "subcategory": "011",
    "subcategoryTitle": "Ship Certificate"
  }
]
```
- 키 규칙: lowerCamelCase 아닌 **명확 영문 스네이크 없음**(위 예시 필드명 고정)
- 코드 규칙: 5자리 문자열(선행 0 유지), `category=code.slice(0,2)`, `subcategory=code.slice(0,3)`

## 3.3 생성 산출물
- **Master(배열)**: `defCodes.json` (상기 스키마)
- **Tree(선택)**: 카테고리→서브카테고리→코드 트리 그대로 보존(`defCodesTree.json`) — Settings나 좌측 트리 네비용

---

# ④ 가공(ETL) 절차
1) 원본 JSON 로드
2) 각 `category` 반복 → `categoryTitle` 확보
3) 각 `subcategory` 반복 → `subcategoryTitle` 확보
4) 각 `deficiencies` 반복 → `{code,title}` 추출
5) **평탄화 레코드** 생성 → 배열에 push
6) 정렬: `code` 오름차순
7) 중복 검사: `code` 유일성 보장
8) 저장: `src/assets/data/defCodes.json` (빌드 후 `dist/assets/data/defCodes.json`)

> 실패 처리: title 누락 시 해당 코드 제외하고 로그 기록.

---

# ⑤ UI 매핑(페이지별)
## 5.1 Dashboard(`/psc-dashboard.html`)
- **Top Deficiency Codes (Bar)**: `groupBy(deficiencies.code)` 상위 10 → 라벨은 `defCodes.title` 사용.
- **툴팁**: `"{code} · {title}\n{category} {categoryTitle} › {subcategoryTitle}"`
- **Heat Table**: 카테고리 필터가 설정된 경우, 해당 카테고리 코드들만 집계.

## 5.2 Deficiencies(`/deficiencies.html`)
- 좌측: **Top10 Bar(월 탭)**, 우측: **코드별 추이 Line** + **카테고리 분포 Donut**
- 하단 테이블 컬럼: `Date, MOU, LOCODE, IMO, Code, Title, Remark, Convention`
- **필터**: `category(2)`, `subcategory(3)`, `code(5)` — 입력 시 계층 동기화
- **행 hover 툴팁**: 상동

## 5.3 Inspections(`/inspections.html`)
- 보조 컬럼: 가장 많은 결함코드 Top1 (최근 인스펙션 join)
- 행 클릭 상세: 해당 `inspectionId`의 결함 리스트를 `Code · Title`로 표시

## 5.4 Vessels(`/vessels.html`)
- 모달: 최근 24M 결함 Top5 코드 리스트(코드+타이틀)

## 5.5 Reports(`/reports.html`)
- 월간 보고서에 `Def. Top10` 섹션, 표와 막대 동시 출력

---

# ⑥ 색상 시스템(카테고리별)
- 카테고리(2자리)에 고정 색상 할당. 계열은 안정성·식별성 고려.

| Category | Title                         | Color (HEX) |
|----------|-------------------------------|-------------|
| 01       | Certificates & Documentation  | #0ea5e9 (sky-500)
| 02       | Structural Safety             | #06b6d4 (cyan-500)
| 03       | Water/Weathertight            | #22c55e (emerald-500)
| 04       | Emergency Systems             | #f59e0b (amber-500)
| 05       | Fire Safety                   | #ef4444 (red-500)
| 06       | Alarm/Monitoring              | #a855f7 (violet-500)
| 07       | Propulsion & Aux Machinery    | #14b8a6 (teal-500)
| 08       | Lifesaving Appliances         | #f97316 (orange-500)
| 09       | Dangerous Goods               | #eab308 (yellow-500)
| 10       | ISM                           | #6366f1 (indigo-500)
| 11       | SOLAS Operational             | #84cc16 (lime-500)
| 12       | Radio Communications          | #8b5cf6 (violet-500)
| 13       | Nautical Publications         | #3b82f6 (blue-500)
| 14       | MARPOL                        | #0d9488 (teal-600)
| 15       | ISPS                          | #db2777 (rose-600)
| 16       | MLC                           | #10b981 (emerald-600)

- 적용 규칙: `series.color`는 해당 코드의 `category` 색상, 다중 혼합 시 범례로 색상 매핑을 유지.

---

# ⑦ 프런트 계산 로직(조인)
- `deficiencies[]`와 `defCodes[]`의 조인 키: `code`
- 조인 후 필드: `code, title, category, categoryTitle, subcategory, subcategoryTitle`
- **Top10**: `count by code desc` → 상위 10 → `label=title`, `tooltip=code+경로`
- **Heat Table**: 월·MOU 필터로 `count(def)/count(insp)` 계산, 카테고리 필터가 있으면 해당 카테고리의 코드만 포함

---

# ⑧ 예시(입력 → 출력)
입력 트리 일부:
```
01 Certificates & Documentation
└─ 011 Ship Certificate
   ├─ 01101 Cargo ship safety equipment (including exemption)
   ├─ 01102 Cargo ship safety construction (including exempt.)
   └─ 01103 Passenger ship safety (including exemption)
```
평탄화 레코드(3건):
```json
[
  {"code":"01101","title":"Cargo ship safety equipment (including exemption)","category":"01","categoryTitle":"Certificates & Documentation","subcategory":"011","subcategoryTitle":"Ship Certificate"},
  {"code":"01102","title":"Cargo ship safety construction (including exempt.)","category":"01","categoryTitle":"Certificates & Documentation","subcategory":"011","subcategoryTitle":"Ship Certificate"},
  {"code":"01103","title":"Passenger ship safety (including exemption)","category":"01","categoryTitle":"Certificates & Documentation","subcategory":"011","subcategoryTitle":"Ship Certificate"}
]
```

---

# ⑨ 구현 스니펫(JS)
```js
function flattenParis(tree){
  const out=[];
  const cats=tree.paris_mou_deficiency_codes.categories;
  Object.values(cats).forEach(c=>{
    const catCode=c.code, catTitle=c.title;
    Object.values(c.subcategories||{}).forEach(sc=>{
      const subCode=sc.code, subTitle=sc.title;
      const defs=sc.deficiencies||{};
      Object.entries(defs).forEach(([code,title])=>{
        out.push({ code, title, category:catCode, categoryTitle:catTitle, subcategory:subCode, subcategoryTitle:subTitle });
      });
    });
  });
  // 정렬·중복 제거
  out.sort((a,b)=>a.code.localeCompare(b.code));
  return out;
}
```

---

# ⑩ 검증·품질 체크
- 코드 규칙: **5자리 문자열**(선행 0 유지), 유일성 검사
- 타이틀 누락/공백 제외 처리
- 카테고리·서브카테고리: 각각 **2자리/3자리**와 타이틀 매핑 필수
- 색상: 카테고리 색상토큰 매핑 검증(미정 카테고리는 회색)

---

# ⑪ 배치·경로
- 저장: `src/assets/data/defCodes.json`
- 데이터 상수: `DATA_PATHS.defCodes = 'assets/data/defCodes.json'`
- 페이지 사용: `/psc-dashboard.html`, `/deficiencies.html`, `/inspections.html`, `/vessels.html`, `/reports.html`

---

# ⑫ 차기 단계
- `deficiencies.json`와 조인 적용하여 실제 화면 집계 검증
- 카테고리 02~16 전체 색상 매핑 확정(파일 전체 로딩 후 자동 생성 가능)
- 보고서 템플릿에 `Deficiency breakdown` 섹션 추가

