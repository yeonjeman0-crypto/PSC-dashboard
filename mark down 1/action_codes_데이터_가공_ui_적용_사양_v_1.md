# ① 제목
Action Codes 데이터 가공·UI 적용 사양 v1.0 (tabler-dev 기준)

---

# ② 핵심 요약(3~5줄)
- 업로드된 **PSC Action Codes** JSON을 기준 **Master→Fact 조인** 구조로 표준화합니다.
- 코드별 **파생 필드(색상/배지/긴급도/SLA/구분)**를 계산하여 **tabler-dev** UI의 배지·테이블·차트에 바로 매핑합니다.
- 네비게이션 **Dashboard / Inspections / Deficiencies / Vessels / Ports / Risk / Reports / Settings** 각 화면에서 액션코드를 어떻게 표시·집계할지 정의합니다.
- 색상 토큰과 Bootstrap 배지 변형을 명시해 디자인 일관성을 확보합니다.

---

# ③ 데이터 스키마 표준화
## 3.1 원본(JSON) → Master 스키마
- 입력(예):
```json
{
  "psc_action_codes": {
    "10": {"code":"10","description":"Deficiency rectified","category":"rectified","urgency":"completed"},
    "17": {"code":"17","description":"Rectify deficiency before departure","category":"before_departure","urgency":"critical"},
    "30": {"code":"30","description":"Detainable deficiency","category":"detention","urgency":"critical"}
  },
  "categories": {
    "rectified": "Non-conformity already addressed",
    "before_departure": "Must be completed prior to vessel departure",
    "detention": "Vessel detention related action"
  }
}
```
- 표준화 Master(배열형 권장):
```json
{
  "actionCodes": [
    {"code":"10","description":"Deficiency rectified","category":"rectified","urgency":"completed"},
    {"code":"16","description":"Rectify deficiency within 14 days","category":"time_bound","urgency":"high","timeframe":"14_days"},
    {"code":"17","description":"Rectify deficiency before departure","category":"before_departure","urgency":"critical"},
    {"code":"18","description":"Rectify deficiency within 3 months","category":"time_bound","urgency":"medium","timeframe":"3_months"},
    {"code":"30","description":"Detainable deficiency","category":"detention","urgency":"critical"},
    {"code":"46","description":"Rectify detainable deficiency at agreed repair port","category":"detention","urgency":"critical"},
    {"code":"48","description":"As in the agreed flag state condition","category":"flag_state","urgency":"medium"},
    {"code":"49","description":"As in the agreed rectification action plan (RAP)","category":"action_plan","urgency":"medium"},
    {"code":"99","description":"Others (specify in clear text)","category":"other","urgency":"variable"}
  ],
  "categories": {
    "rectified":"Non-conformity already addressed",
    "next_port":"Action required at subsequent port call",
    "time_bound":"Specific timeline for rectification",
    "before_departure":"Must be completed prior to vessel departure",
    "detention":"Vessel detention related action",
    "flag_state":"Flag state administration involvement",
    "action_plan":"Formal rectification plan required",
    "other":"Custom action as specified by PSC officer"
  }
}
```
- 키 규칙: lowerCamelCase, `code`는 문자열 유지(선행 0 대비), `timeframe`은 `14_days|3_months` 등 enum.

## 3.2 파생 필드(프런트 계산)
- `isDetainable` = `category === 'detention' || code in ['30','46']`
- `isBeforeDeparture` = `category === 'before_departure' || code === '17'`
- `slaDays` = `timeframe === '14_days' ? 14 : timeframe === '3_months' ? 90 : null`
- `statusDefault` = `code === '10' ? 'closed' : 'open'`
- `severity`(1~5): `completed=1`, `medium=3`, `high=4`, `critical=5`, `variable=2`
- UI 배지 색상 매핑(기본 Bootstrap + 커스텀):
  - `completed → success`(emerald)
  - `medium/high → warning`(amber) ※ high는 테두리 굵게 처리
  - `critical → danger`(rose)
  - `variable → secondary`
  - `detention 카테고리 → custom 'violet' 배지`(CSS 추가)

예시 파생 결과:
```json
{"code":"17","category":"before_departure","urgency":"critical","isDetainable":false,"isBeforeDeparture":true,"slaDays":null,"statusDefault":"open","severity":5,"badge":"danger"}
```

## 3.3 Fact 조인 규칙
- `inspections.actionCode` ↔ `actionCodes.code`(string)
- 조인 후 테이블·KPI·차트에서 `badge/label/urgency/slaDays` 사용
- `dueDate` = `date + slaDays`(있는 경우). `overdue = today > dueDate && status!=='closed'`

---

# ④ 화면(UI) 설계 — tabler-dev 컴포넌트 매핑
## 공통
- 카드: `.card > .card-body`
- 배지: `.badge bg-<variant>` + 커스텀 `.bg-violet` 클래스
- 테이블: `.table.table-vcenter` + `.table-responsive`
- 아이콘: Tabler Icons `ti ti-alert-triangle`(Def), `ti ti-shield-lock`(Detention), `ti ti-flag`(Flag state), `ti ti-clipboard-check`(Rectified)

## 4.1 Dashboard
- KPI 3×3: 상단 카운트/율
- 우측 상단: **Action Category Mix** 도넛(각 카테고리 비율). 색상: rectified=success, time_bound=warning, before_departure=danger, detention=violet, flag_state=info, action_plan=primary, other=secondary
- Funnel(대체 도넛): Inspections vs Deficiencies vs Detentions
- Heat Table: 월×MOU 결함률
- 인터랙션: 도넛 조각 클릭 → `/inspections.html?category=time_bound` 등 필터 이동

## 4.2 Inspections
- 테이블 컬럼: Date | MOU | Country | LOCODE | IMO | Vessel | **Action (Badge)** | **SLA/Due** | Detained
- Action 셀: `code` 왼쪽 라벨 + `badge`(색) + `description` 툴팁
- SLA/Due: `timeframe`→`dueDate` 표시, `overdue`이면 붉은 점 아이콘
- 필터: `Action code`, `Category`, `Urgency`, `Overdue only`

## 4.3 Deficiencies
- Top10 Def. Bar, 코드별 Line
- 테이블에 `Action code`는 간접(inspectionId 조인)로 보조 컬럼 제공 가능

## 4.4 Vessels
- 리스트에 최근 12M `Action category mix` 미니 도넛(옵션)
- 행 클릭 모달에 최근 인스펙션의 액션·SLA 히스토리

## 4.5 Ports Map
- 버블 팝업에 `Top action category`와 `Detention share` 표시

## 4.6 Risk
- 리스크 산식은 결함률 중심이나, `detention` 카테고리 비중 가중(예: +10%) 옵션 제공

## 4.7 Reports
- 월간 보고서에 `Action breakdown` 섹션(카테고리별 건수, Overdue 건수)

## 4.8 Settings
- `DATA_PATHS.actions` 파일 경로 UI로 변경, 카테고리 색상 맵 편집 가능

---

# ⑤ 색상·테마(디자인 시스템)
## 5.1 토큰
- Primary(Inspections): `#6366f1` indigo → `.bg-primary`
- Danger(Deficiencies/Before-departure/High): `#f43f5e` → `.bg-danger`
- Warning(Time-bound): `#f59e0b` → `.bg-warning`
- Success(Rectified): `#10b981` → `.bg-success`
- **Violet(Detention 전용, 커스텀)**: `#8b5cf6` → `.bg-violet` (SCSS에 추가)
- Secondary(Other/Variable): 기본 회색

## 5.2 SCSS 스니펫
```scss
.badge.bg-violet { background-color:#8b5cf6; color:#fff; }
.badge.outline-high { border:2px solid #f59e0b; color:#f59e0b; background:transparent; }
.card-rounded { border-radius:1rem; }
```

---

# ⑥ 집계·계산 정의(액션코드 관점)
- `Action total = count(inspections where actionCode not null)`
- 카테고리별 분포 = `groupBy(join(actionCodes).category)`
- Overdue = `overdue==true` 건수
- Detention share = `count(category=='detention') / Action total`
- Before-departure pending = `count(code=='17' and status=='open')`

---

# ⑦ 파이프라인(가공 순서)
1) **Master 로드**: `actionCodes.json` 로딩 → 배열 변환 → 파생 필드 계산(색/배지/SLA)
2) **Fact 로드**: `inspections.json`, `deficiencies.json` 로딩
3) **조인**: `inspections ⨝ actionCodes` on `actionCode`
4) **파생**: `dueDate/overdue` 계산(inspection.date 기준)
5) **집계**: KPI·도넛·테이블용 그룹바이 생성
6) **렌더**: 페이지별 카드/배지/차트에 바인딩

---

# ⑧ 예시 코드(프런트 변환 유틸)
```js
function normalizeActionMapToArray(map){
  return Object.values(map).map(x=>({
    code: String(x.code),
    description: x.description,
    category: x.category,
    urgency: x.urgency,
    timeframe: x.timeframe || null
  }));
}
function enrichAction(a){
  const isDetainable = a.category==='detention' || ['30','46'].includes(a.code);
  const isBeforeDeparture = a.category==='before_departure' || a.code==='17';
  const slaDays = a.timeframe==='14_days'?14: a.timeframe==='3_months'?90: null;
  const sev = {completed:1, variable:2, medium:3, high:4, critical:5}[a.urgency] || 2;
  const badge = isDetainable? 'violet' : a.urgency==='critical'? 'danger' : a.urgency==='medium'? 'warning' : a.urgency==='high'? 'warning' : a.urgency==='completed'? 'success':'secondary';
  return {...a, isDetainable, isBeforeDeparture, slaDays, statusDefault: a.code==='10'?'closed':'open', severity:sev, badge};
}
// dueDate 계산(inspection.date 필요)
function withDue(inspection, action){
  const dueDate = action.slaDays? new Date(new Date(inspection.date).getTime()+action.slaDays*86400000) : null;
  const overdue = dueDate? (new Date()>dueDate && inspection.status!=='closed') : false;
  return {...inspection, dueDate, overdue, action};
}
```

---

# ⑨ 페이지별 배치 체크리스트(실장)
- Dashboard: 도넛(카테고리), Top10 Def bar, Funnel, Heat Table
- Inspections: Action 배지·SLA/Due 컬럼·Overdue 필터
- Deficiencies: 조인된 Action 정보 툴팁/보조컬럼
- Vessels: 미니 도넛(최근 12M action mix) 옵션
- Ports: 팝업에 action mix 표시
- Risk: detention 가중치 옵션(설정에서 토글)
- Reports: Action breakdown 섹션 포함
- Settings: `DATA_PATHS.actions` 편집, 배지 색 맵 수정 UI

---

# ⑩ 품질·검증
- `code` 문자열, 공백·선행 0 허용
- `category`·`urgency`는 enum 검증, 미정 값은 `other/secondary`로 폴백
- `timeframe` 파싱 실패 시 SLA 비적용
- 빌드 전 ESLint/format, 샘플 50건으로 KPI·Overdue 검증

