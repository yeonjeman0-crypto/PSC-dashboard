# ① 제목
Fleet Master 정규화 사양 + ETL 스크립트(tabler-dev/PSC) v1.0

최신 확인 완료: 2025-08-23 (Asia/Seoul)

---

# ② 핵심 요약(3~5줄)
- 선종(Type)은 **PC(T)C**와 **BULK** 두 종류만 사용합니다. 다른 표기는 모두 규칙에 따라 강제 매핑합니다.
- DOC는 **Doublerich Shipping**, **Doriko Ltd** 두 개만 허용합니다. Owner는 “정규 Owner 맵”으로 표준화합니다.
- 중복/변형 표기(예: `BULK (BCBHP)`, `PANAMA (BCBHP)`, 대소문자 차이)는 ETL 단계에서 제거·분리합니다.
- 산출물은 `vessels.json`(Master)로, tabler-dev 전 화면에서 공통 사용합니다.

---

# ③ 데이터 표준 스키마(Master)
```json
{
  "imo": null,
  "name": "WOORI SUN",
  "type": "BULK",              // enum: PC(T)C | BULK
  "owner": "DORIKO LTD",       // 정규 Owner명(Owners 맵 적용 후)
  "doc": "DORIKO LTD",         // DOC: Doublerich Shipping | Doriko Ltd
  "flagIso3": "KOR",           // ISO3166-1 alpha-3
  "flagName": "Korea, Republic of",
  "dwt": 53576,
  "builtYear": 2004,
  "builtYm": "2004-07",
  "tags": ["BCBHP"],            // 괄호 내 부가표시는 태그로 이동
  "source": "doriko_fleet_2025-08-10"
}
```

### 필드 규칙
- `type`: 반드시 **PC(T)C** 또는 **BULK**. 예: `PCC`, `PCTC`, `PC(T)C` → **PC(T)C** / `BULK (BCBHP)` → **BULK** + `tags=["BCBHP"]`.
- `doc`: Owner 기반 **DOC 매핑표**로 결정(두 값만 허용).
- `flagIso3`: 국가명/별칭을 ISO3로 변환(예: PANAMA→PAN, KOREA→KOR, MARSHALL→MHL).
- `builtYear`: `builtYm`에서 연도 추출. 형식 불량 시 NULL, 로그 기록.
- `owner`: “Owners 맵”으로 대소문자·공백·철자 변형 통일.

---

# ④ 정규화 규칙(매핑표)
## 4.1 Type 매핑
```json
{
  "PC(T)C": "PC(T)C",
  "PCC": "PC(T)C",
  "PCTC": "PC(T)C",
  "BULK": "BULK",
  "BULK (BCBHP)": "BULK",
  "BULK(BCBHP)": "BULK"
}
```
괄호 등 부가 문구는 `tags`로 분리 저장.

## 4.2 Owner 정규화(예시, 확장 가능)
```json
{
  "DORIKO LTD": "DORIKO LTD",
  "Doriko Ltd": "DORIKO LTD",
  "DOUBLERICH SHIPPING": "DOUBLERICH SHIPPING",
  "Doublerich Shipping": "DOUBLERICH SHIPPING"
}
```
※ 추가 3개 Owner는 동일 방식으로 확장. (정확 표기는 Settings에서 관리)

## 4.3 DOC 매핑(Owner→DOC)
```json
{
  "DOUBLERICH SHIPPING": "DOUBLERICH SHIPPING",
  "DORIKO LTD": "DORIKO LTD",
  "*": "DORIKO LTD"  // 미지정 Owner 폴백 규칙(임시), 운영 중엔 금지 권장
}
```

## 4.4 Flag 매핑(국가명→ISO3)
```json
{
  "PANAMA": {"iso3":"PAN","name":"Panama"},
  "KOREA": {"iso3":"KOR","name":"Korea, Republic of"},
  "MARSHALL": {"iso3":"MHL","name":"Marshall Islands"}
}
```
괄호 안 표기는 태그로 이동(예: `PANAMA (BCBHP)` → `flagName=Panama`, `tags+=["BCBHP"]`).

---

# ⑤ ETL 파이프라인(순서)
1) **로딩**: 원본 JSON 배열을 로드.
2) **전처리**: 트림, 대문자화(Owner/Type/Flag), 괄호 내용 추출→`tags`.
3) **매핑**: `type`/`owner`/`flag`/`doc` 매핑표 적용.
4) **파생**: `builtYear`=`parseInt(builtYm.slice(0,4))`.
5) **검증**: 필수 필드 채움(`name,type,owner,doc,flagIso3,dwt,builtYear`).
6) **중복 제거**: 키=`name(normalized)+builtYear` (IMO 미제공 시 임시 키). 충돌 시 첫 건 우선, 로그 기록.
7) **정렬/저장**: 이름 오름차순 또는 `doc→type→name`. 산출=`vessels.json`.

---

# ⑥ 검증 규칙(품질)
- Type ∈ {`PC(T)C`,`BULK`} 아니면 오류.
- Owner는 정규 목록에만 존재해야 함. 미일치 발견 시 **실패**로 처리(운영), 개발 단계에서는 경고+자동 매핑 시도.
- DOC ∈ {`DOUBLERICH SHIPPING`,`DORIKO LTD`}.
- Flag는 ISO3·정식 국명 동시 보유.
- DWT는 정수, 0 초과.
- builtYm 형식 `YYYY-MM`. 실패 시 레코드 제외 또는 수동보정 목록에 기록.

---

# ⑦ tabler-dev 사용 화면 반영(요소)
- `/vessels.html` 테이블 컬럼: `DOC | Type | IMO | Name | Flag | Built | DWT`  
  - 필터: `DOC(2)`, `Type(2)`, `Flag`, `Built Range`  
  - KPI: `Fleet Size`, `Avg Age`, `≥20y`, `PC(T)C vs BULK 비중`
- `/psc-dashboard.html` KPI: `Ships Inspected` 계산 시 정규 Type 반영.
- `/risk.html` 산식: Age factor 계산 시 `builtYear` 사용.

---

# ⑧ 구현 스크립트(JS, 브라우저/Node 공용)
```js
const TYPE_MAP={"PC(T)C":"PC(T)C","PCC":"PC(T)C","PCTC":"PC(T)C","BULK":"BULK","BULK (BCBHP)":"BULK","BULK(BCBHP)":"BULK"};
const OWNER_MAP={"DORIKO LTD":"DORIKO LTD","DORIKO LTD":"DORIKO LTD","DORIKO LTD ":"DORIKO LTD","DORIKO  LTD":"DORIKO LTD","DORIKO":"DORIKO LTD","DOUBLERICH SHIPPING":"DOUBLERICH SHIPPING","DOUBLERICH SHIPPING ":"DOUBLERICH SHIPPING","DOUBLERICH":"DOUBLERICH SHIPPING"};
const DOC_MAP={"DOUBLERICH SHIPPING":"DOUBLERICH SHIPPING","DORIKO LTD":"DORIKO LTD"};
const FLAG_MAP={"PANAMA":{"iso3":"PAN","name":"Panama"},"KOREA":{"iso3":"KOR","name":"Korea, Republic of"},"MARSHALL":{"iso3":"MHL","name":"Marshall Islands"}};

function extractTags(text){
  const m=String(text||"").match(/\(([^)]+)\)/g)||[];return m.map(s=>s.replace(/[()]/g,"").trim());
}
function normalizeRow(r){
  const name=(r.Vessel||"").trim();
  const rawType=(r.Type||"").toUpperCase().replace(/\s+/g,' ').trim();
  const rawOwner=(r.Owner||"").toUpperCase().replace(/\s+/g,' ').trim();
  const rawFlag=(r.Flag||"").toUpperCase().replace(/\s+/g,' ').trim();
  const tags=[...extractTags(r.Type),...extractTags(r.Flag)];
  const type=TYPE_MAP[rawType]|| (rawType.includes('BULK')? 'BULK': rawType.includes('PCTC')||rawType.includes('PCC')?'PC(T)C':null);
  const owner=OWNER_MAP[rawOwner]||rawOwner; // 미정은 그대로, 사후 검증
  const doc=DOC_MAP[owner]||'DORIKO LTD'; // 임시 폴백 규칙(운영 전 제거)
  const flag=FLAG_MAP[rawFlag.replace(/\s*\([^)]*\)\s*/,'')] || null;
  const builtYm=(r.Built||"").slice(0,7);
  const builtYear=builtYm?parseInt(builtYm.slice(0,4),10):null;
  const dwt=parseInt(r.DWT,10)||null;
  return {imo:null,name,type,owner,doc,flagIso3:flag?.iso3||null,flagName:flag?.name||null,dwt,builtYear,builtYm,tags,source:'doriko_fleet_2025-08-10'};
}
function dedupe(rows){
  const seen=new Set();
  const out=[];
  for(const x of rows){
    const key=(x.name||'').toUpperCase()+"|"+(x.builtYear||'');
    if(seen.has(key)) continue; seen.add(key); out.push(x);
  }
  return out;
}
```

---

# ⑨ 운영 체크리스트
- [ ] Type 두 종류만 존재 확인(검증 스텝)
- [ ] DOC 두 종류만 존재 확인(검증 스텝)
- [ ] Owner 표준화율 100%(미정 항목 0건)
- [ ] Flag ISO3 매핑 누락 0건
- [ ] 중복 0건(키: name+builtYear 기준)
- [ ] `vessels.json` 배포 후 전 화면 필터·KPI 동작 확인

---

# ⑩ 차기 과제
- IMO 수집·보강 후 **중복키를 IMO로 전환**
- Owners 맵에 실제 5개 목록 확정 반영
- Flag 매핑 확장(예: PAN, KOR, MHL 외 다국가)

