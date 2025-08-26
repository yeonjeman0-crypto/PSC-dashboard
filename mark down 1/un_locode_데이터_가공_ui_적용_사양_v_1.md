# ① 제목
UN/LOCODE 데이터 가공·UI 적용 사양 v1.0 (tabler-dev 기준)

최신 확인 완료: 2025-08-23 (Asia/Seoul)

---

# ② 핵심 요약(3~5줄)
- 업로드된 **UN/LOCODE** 원본을 프로젝트 표준 **ports Master**로 정규화합니다.
- 필수 필드: `locode(5) · countryCode(ISO2) · countryName · portCode(3) · portName` + 파생 `isPort · isAggregate · isAirport`.
- Inspections/Deficiencies와는 `locode`로 조인합니다. 지도 기능은 좌표 확보 전에는 **테이블·버블 대체**로 운용합니다.
- 페이지별 사용처: `/inspections.html` 이름 표시, `/ports.html` 랭킹·추이, `/psc-dashboard.html` Heat Table 필터.

---

# ③ 상세 내용

## 3.1 원본 → 표준 스키마
### 입력(원본)
- 필드: `locode, country_code, country_name, port_code, port_name`

### 출력(Master: `ports.json`)
```json
{
  "locode": "KRPNK",
  "countryCode": "KR",
  "countryName": "Korea, Republic of",
  "portCode": "PNK",
  "portName": "Pyeongtaek",
  "isPort": true,
  "isAirport": false,
  "isAggregate": false,
  "displayName": "KR PNK · Pyeongtaek"
}
```

### 파생 규칙
- `isAirport = /\bApt\b|Airport/i.test(portName)`
- `isAggregate = (portCode === 'ZZZ') || /^O P\b/i.test(portName)`
- `isPort = !(isAirport || isAggregate)`  
  (좌표가 없으므로, **해상항만 특화 분류는 보수적으로**: 공항/집합코드 제외를 우선 적용)
- `displayName = `${countryCode} ${portCode} · ${portName}`

### 정합·클린징
- `locode`: 5자 대문자, 공백 제거, 정규식 `/^[A-Z]{5}$/`
- `countryCode`: 2자 대문자, `countryName` 트림
- `portCode`: 3자 대문자, `portName` 트림·중복 공백 제거
- 중복 제거: `locode` 기준 유일성 보장

## 3.2 저장·경로
- 개발: `src/assets/data/ports.json`  → 빌드: `dist/assets/data/ports.json`
- 상수: `DATA_PATHS.ports = 'assets/data/ports.json'`

## 3.3 조인 규칙(다른 데이터와)
- `inspections.locode` ↔ `ports.locode`
- 표시 필드: `countryName, portName`(테이블), `displayName`(툴팁)
- 누락 조인 시 폴백: `portName = locode.slice(2)`, `countryCode = locode.slice(0,2)`

## 3.4 페이지별 사용
### A) Dashboard(`/psc-dashboard.html`)
- Heat Table 필터에서 `MOU`와 함께 `국가/항만` 선택기 제공(Autocomplete, `ports.json` 기반)
- 지도 대체 카드(좌표 확보 전): 국가별/항만별 검사수 Top N 표와 막대 그래프(검사수 기준)

### B) Inspections(`/inspections.html`)
- 테이블 컬럼: `Country, Port(LOCODE)`
- 렌더: `Country = join(countryName)`, `Port = portName (locode)` 형태 표기
- 필터: `countryCode`, `locode` 다중 선택

### C) Ports Map(`/ports.html`)
- **1단계(좌표 없음)**: 
  - 좌측: 항만 랭킹(검사수/결함/디텐션율), 상단에 국가 필터
  - 우측: 선택 항만의 월별 추이(라인) + 액션코드 분포 도넛
- **2단계(좌표 확보 후)**: 
  - 버블 지도: 버블=검사수^0.5, 색=디텐션율

### D) Reports(`/reports.html`)
- 항만 섹션: 국가 상위 10항만 표 + 검사/결함 막대

## 3.5 색상·아이콘
- 국가/항만 라벨: 기본 **Indigo** 계열 텍스트, 공항/집합코드는 **secondary** 회색 뱃지로 구분
- 아이콘: Port=`ti ti-anchor`, Country=`ti ti-flag-3`, Airport(제외건)=`ti ti-plane`

## 3.6 검증·품질 체크
- 유효성: `locode(5)`, `countryCode(2)`, `portCode(3)`
- 제외 규칙: `isAirport==true` 또는 `isAggregate==true`는 지도/랭킹 집계에서 제외(테이블 검색은 허용)
- 중복: `locode` 유일성 엄수, 충돌 시 첫 레코드 채택 로그
- 성능: 로드 후 인덱스 맵 생성 `{ [locode]: row }` (O(1) 조인)

---

# ④ 표·리스트

## A. ETL 단계 체크리스트
1) 원본 로드(`unlocode.json`)  
2) 필드 리매핑: `country_code→countryCode` …  
3) 파생 계산: `isAirport/isAggregate/isPort/displayName`  
4) 정합성 검사 및 중복 제거  
5) 정렬(옵션): `countryCode asc, portCode asc`  
6) 저장: `ports.json`  
7) 빌드 후 `/dist/assets/data/ports.json` 확인

## B. JS 유틸(스니펫)
```js
function normalizePorts(rows){
  const seen=new Set();
  const out=[];
  for(const r of rows){
    const locode=(r.locode||'').toUpperCase().trim();
    const countryCode=(r.country_code||'').toUpperCase().trim();
    const countryName=(r.country_name||'').trim();
    const portCode=(r.port_code||'').toUpperCase().trim();
    const portName=(r.port_name||'').trim();
    if(!/^[A-Z]{5}$/.test(locode) || countryCode.length!==2 || portCode.length!==3) continue;
    const isAirport=/\b(Apt|Airport)\b/i.test(portName);
    const isAggregate=portCode==='ZZZ' || /^O P\b/i.test(portName);
    const isPort=!(isAirport||isAggregate);
    if(seen.has(locode)) continue; seen.add(locode);
    out.push({locode,countryCode,countryName,portCode,portName,isPort,isAirport,isAggregate,displayName:`${countryCode} ${portCode} · ${portName}`});
  }
  return out;
}
```

## C. 페이지별 바인딩 요약
| 페이지 | 사용 필드 | 용도 |
|---|---|---|
| Dashboard | countryName, portName, locode | 필터, 표 라벨 |
| Inspections | countryName, portName | 테이블 표시·검색 |
| Ports | locode, displayName, isPort | 랭킹·추이, 공항/집합 제외 |
| Reports | countryName, portName | 국가 Top 항만 표 |

---

# ⑤ 차기 작업
- 좌표 확장 스키마: `lat, lon`(선택) → 지도 전환 준비
- MOU-국가 매핑표 추가(필터 정확도 향상)
- 국가명 다국어 라벨(ko/en 병기 옵션)
