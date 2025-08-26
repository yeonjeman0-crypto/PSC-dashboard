# ① 제목
PSC Raw 2025 v2 → ETL 사양 + UI 매핑(tabler-dev) v1.0

최신 확인 완료: 2025-08-23 (Asia/Seoul)

---

# ② 핵심 요약(3~5줄)
- 업로드된 **psc_2025_raw_v2.json**을 tabler-dev 구조로 분해하여 `inspections.json`·`deficiencies.json` 2개 Fact로 표준화합니다.
- 선종(Type)은 **PC(T)C / BULK**만 허용, Owner는 표준 맵으로 통일, DOC는 **Doublerich Shipping / Doriko Ltd** 두 값만 사용합니다.
- `deficiency_details[].code`는 **액션코드**이므로 `actionCode`로 이관하고, 5자리 결함코드가 없을 경우 **Action 기반 Top 차트**로 대체합니다.
- MOU·국가·항만은 표준 ENUM과 UN/LOCODE Master로 조인합니다.

---

# ③ 원본 구조 요약 및 이슈
## 3.1 필드(요약)
`records[]`: inspection_id, year, month, date, vessel_name, vessel_type, nation, port, mou, owner, total_deficiencies, deficiency_details[{deficiency, code, action}], action_codes[], detention, inspector, duration

## 3.2 주요 이슈
- `deficiency_details[].code` 값이 15/16/17/30/48/99 등 **Action Code**임 → 필드명 오해 소지. (결함 5자리 코드 아님)
- `vessel_type` 다양한 표기 가능성 → **PC(T)C / BULK**로 강제 매핑 필요
- Owner 표기(대문자/약어/철자) 통일 필요, DOC는 두 값만 허용
- `nation`은 자유 텍스트 → ISO2/3 변환 또는 UN/LOCODE와 조합 필요
- `duration` 자유 텍스트 → KPI 집계 비포함, 상세 표시만

---

# ④ 표준 산출물(파일) 정의
## 4.1 inspections.json
```json
{
  "id": "2025KRINC-00001",
  "date": "2025-02-03",
  "imo": 0,
  "vesselName": "GMT ASTRO",
  "type": "PC(T)C",
  "owner": "SAMJOO",
  "doc": "DORIKO LTD",
  "mou": "Tokyo",
  "countryCode": "KR",
  "locode": "KRINC",
  "defCount": 11,
  "actionCodes": ["17","16","99"],
  "detained": false,
  "inspector": "PSC Officer Chen Wei"
}
```

## 4.2 deficiencies.json
```json
{
  "inspectionId": "2025KRINC-00001",
  "seq": 1,
  "actionCode": "17",
  "defCode": null,           // 5자리 결함코드 미제공 → null
  "title": "Starboard lifeboat not ready for immediate use",
  "remark": null,
  "convention": null
}
```
- 주의: 원본에 5자리 결함코드가 없다면 `defCode=null`. 이후 필요 시 수기/추가 ETL로 보강.

## 4.3 Master 참조(별도)
- `actionCodes.json`(확정), `defCodes.json`(Paris MoU 코드, 선택), `ports.json`(UN/LOCODE), `vessels.json`(Fleet Master)

---

# ⑤ ETL 매핑(필드별)
| 원본 | 표준 | 규칙 |
|---|---|---|
| inspection_id | id | `YYYY`+국가ISO2+항만코드(LOCODE 5) + 일련 → 생성. 원본 키는 보조키로 보관 가능 |
| date | date | ISO 유지(`YYYY-MM-DD`) |
| vessel_name | vesselName | 트림 |
| vessel_type | type | 매핑: {PCC,PCTC,PC(T)C→PC(T)C / BULK*→BULK}. 괄호 문구는 `vessels.tags`로 |
| owner | owner | Owner 정규 맵 적용(대문자, 공백 정리) |
| owner→DOC | doc | Owner→DOC 매핑: {Doublerich Shipping|Doriko Ltd} 외 금지 |
| mou | mou | ENUM: {Tokyo, Paris, USCG, Riyadh, Mediterranean, Indian} 등. 표준 라벨로 정규화 |
| nation, port | countryCode, locode | UN/LOCODE 조인: 이름→LOCODE 역매핑, 실패 시 `countryCode`만 채움 |
| total_deficiencies | defCount | 그대로 |
| action_codes[] | actionCodes[] | 문자열 배열 보존, 중복 제거 |
| detention | detained | boolean 유지 |
| inspector/duration | inspector/duration | 상세 표시용(집계 제외) |
| deficiency_details[].deficiency | title | deficiencies.json로 1:N 분해 |
| deficiency_details[].code | actionCode | 15/16/17/30/48/99 등 액션코드로 저장 |
| deficiency_details[].action | — | UI 툴팁 표기용(`actionCodes` 설명과 매핑) |

---

# ⑥ 정규화 규칙(고정)
## 6.1 Type
- 허용: **PC(T)C / BULK**
- 변형 매핑: `PCC,PCTC,PC(T)C → PC(T)C`, `BULK (… ) → BULK`

## 6.2 Owner → DOC
- Owner Canonical Map 작성(예: SAMJOO, GMT, SW 등 5개 회사) → 철자/대소문자 변형 통일
- DOC Map: `{ SAMJOO→DORIKO LTD, GMT→DORIKO LTD, SW→DOUBLERICH SHIPPING, … }` 운영 설정파일에서 관리

## 6.3 MOU
- 표기 통일: `USCG`, `Tokyo`, `Paris`, `Riyadh`, `Mediterranean`, `Indian` 등 표준 레이블만 사용

## 6.4 국가/항만
- `ports.json`(UN/LOCODE)과 조인. 실패 시 `countryCode`만 우선 주입, `locode`는 null 유지

---

# ⑦ KPI·차트 계산(이 데이터 기준)
- **Total Inspections** = `|inspections|`
- **Total Deficiencies** = `Σ defCount` 또는 `|deficiencies|`(권장)
- **Deficiency Rate(%)** = `|deficiencies| / |inspections| × 100` → 1자리 반올림
- **Detentions** = `count(detained=true)`
- **Detention Rate(%)** = `Detentions / |inspections| × 100`
- **Ships Inspected** = `count(distinct vesselName or IMO)`
- **Avg Def./Vessel** = `|deficiencies| / Ships Inspected`
- **Top Action Codes** = `groupBy(deficiencies.actionCode)` 상위 10  
  ※ `defCode`가 없으므로 초기 릴리스는 **Action 기반 Top**을 기본 차트로 사용. `defCodes` 보강 시 전환 가능.

---

# ⑧ UI 매핑(tabler-dev)
## 8.1 Dashboard
- KPI 3×3: 위 산식 적용
- 우측 상단: **Top Action Codes (Bar)**, 색상: Action urgency 매핑(success/warning/danger/violet)
- 우측 하단: **Funnel(도넛 대체)** = `[Inspections, Deficiencies, Detentions]`
- 좌측: Ports 랭킹 카드(초기) 또는 지도(좌표 확보 시)
- 하단: Heat Table(월×MOU) → `defCount/inspection` 비율

## 8.2 Inspections
- 테이블: `Date | MOU | Country | Port(LOCODE) | Vessel | Type | Owner | DOC | Def. | Action mix | Detained`
- 상세: 결함 리스트(각 행의 `actionCode` 배지, `title` 문구)

## 8.3 Deficiencies
- Top10 차트: **Action Top10**로 시작 → `defCodes` 보강 후 **DefCode Top10**로 스위치

## 8.4 Reports
- 월간 리포트: `Action breakdown`, `Detention trend`, `MOU 비교`

---

# ⑨ 색상·배지(액션코드 매핑)
- `completed(10) → success(#10b981)`
- `time-bound(16/18) → warning(#f59e0b)`
- `before_departure(17) → danger(#f43f5e)`
- `detention(30/46) → violet(#8b5cf6)`
- `other(48/49/99) → secondary`

---

# ⑩ 샘플 변환(2건)
## A) 2025-02-03 Incheon / GMT ASTRO
**inspections.json**
```json
{"id":"2025KRINC-00001","date":"2025-02-03","imo":0,"vesselName":"GMT ASTRO","type":"PC(T)C","owner":"SAMJOO","doc":"DORIKO LTD","mou":"Tokyo","countryCode":"KR","locode":"KRINC","defCount":11,"actionCodes":["17","16","99"],"detained":false,"inspector":"PSC Officer Chen Wei"}
```
**deficiencies.json**(발췌)
```json
[{"inspectionId":"2025KRINC-00001","seq":1,"actionCode":"17","defCode":null,"title":"Starboard lifeboat not ready for immediate use","remark":null,"convention":null},
 {"inspectionId":"2025KRINC-00001","seq":2,"actionCode":"99","defCode":null,"title":"Ship security drill not carried out after 25% crew change","remark":null,"convention":null}]
```

## B) 2025-05-26 Incheon / YOUNG SHIN (Detention)
**inspections.json**
```json
{"id":"2025KRINC-00002","date":"2025-05-26","imo":0,"vesselName":"YOUNG SHIN","type":"PC(T)C","owner":"SAMJOO","doc":"DORIKO LTD","mou":"Tokyo","countryCode":"KR","locode":"KRINC","defCount":8,"actionCodes":["30","17","16"],"detained":true,"inspector":"PSC Officer Chen Wei"}
```
**deficiencies.json**(발췌)
```json
[{"inspectionId":"2025KRINC-00002","seq":1,"actionCode":"30","defCode":null,"title":"Air pipe defective - opening not provided with weathertight closing","remark":null,"convention":null},
 {"inspectionId":"2025KRINC-00002","seq":2,"actionCode":"17","defCode":null,"title":"Fire door defective - fitted with hold-back device","remark":null,"convention":null}]
```

---

# ⑪ 구현 스니펫(JS)
```js
function normalizeType(t){
  const s=String(t||'').toUpperCase();
  if(s.includes('PCTC')||s.includes('PCC')) return 'PC(T)C';
  if(s.includes('BULK')) return 'BULK';
  return null; // 검증에서 제외
}
function buildId(date,countryCode,locode,seq){
  const y=date.slice(0,4);return `${y}${countryCode||'XX'}-${locode||'XXXXX'}-${String(seq).padStart(5,'0')}`;
}
function toInspection(rec,idx,portIndex,ownerMap,docMap){
  const type=normalizeType(rec.vessel_type);
  const owner=(ownerMap[rec.owner?.toUpperCase()?.trim()]||rec.owner||'').toUpperCase();
  const doc=docMap[owner]||'DORIKO LTD';
  const portRow=portIndex.findByName?.(rec.nation,rec.port) || null; // 구현 필요
  const countryCode=portRow?.countryCode||null; const locode=portRow?.locode||null;
  const id=buildId(rec.date,countryCode,locode,idx+1);
  return {id,date:rec.date,imo:0,vesselName:rec.vessel_name,type,owner,doc,mou:rec.mou,countryCode,locode,defCount:rec.total_deficiencies,actionCodes:[...new Set(rec.action_codes||[])],detained:!!rec.detention,inspector:rec.inspector};
}
function toDeficiencies(rec,inspectionId){
  const arr=rec.deficiency_details||[];
  return arr.map((d,i)=>({inspectionId,seq:i+1,actionCode:String(d.code||''),defCode:null,title:d.deficiency||null,remark:null,convention:null}));
}
```

---

# ⑫ 검증·품질 체크리스트
- [ ] Type ∈ {PC(T)C, BULK} 100%
- [ ] Owner Canonical 100% 일치, DOC ∈ {Doublerich Shipping, Doriko Ltd}
- [ ] MOU ENUM 표준 라벨 100%
- [ ] UN/LOCODE 조인 성공률 ≥ 95% (미조인 로그)
- [ ] `defCode` 미보강 상태 허용(초기), Action 기반 차트 정상 동작
- [ ] KPI/차트 수치 대조: 통계 섹션과 일치 확인(총 검사수/결함수/디텐션수)

---

# ⑬ 배치·연동 순서
1) 원본 변환 → `inspections.json`·`deficiencies.json` 생성(`src/assets/data/`)
2) `DATA_PATHS` 갱신
3) `/psc-dashboard.html`·`/inspections.html`·`/deficiencies.html` 바인딩
4) Action Top 차트·Funnel·Heat Table 동작 검증
5) 추후 `defCode` 보강 시 차트 전환

