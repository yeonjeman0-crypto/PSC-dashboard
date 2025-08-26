# PSC Dashboard 완성 실행 계획서
## DORIKO LIMITED - Maritime Safety Management System

### 📅 작성일: 2025-08-26
### 👤 담당자: Superintendent

---

## 🎯 **목표: Production-Ready PSC Dashboard 구축**

### **✅ Phase 1: 데이터 완전성 확보 (즉시 실행)**

#### **1.1 데이터 동기화**
```bash
# 터미널에서 실행
cd "C:\Users\sicka\Downloads\새 폴더"
node sync-dashboard-data.js
```

**예상 결과:**
- 30개 inspection records 완전 로딩
- 87개 deficiency records 매핑
- 14개 선박 profile 생성
- MOU별 통계 자동 계산

#### **1.2 데이터 검증**
- [ ] Dashboard data 파일 생성 확인
- [ ] 모든 inspection이 표시되는지 확인
- [ ] Deficiency와 inspection 연결 확인
- [ ] MOU 분류 정확성 확인

---

### **✅ Phase 2: 시스템 통합 (30분 소요)**

#### **2.1 Navigation 통합**
**파일:** `psc-dashboard/src/components/navigation.js`

현재 독립적인 페이지들을 통합 네비게이션으로 연결:
- Dashboard (메인)
- Inspections (검사 관리)
- Vessels (선박 관리)
- Deficiencies (non-conformity 분석)
- Reports (보고서)
- Geographic (지리적 분석)

#### **2.2 실시간 데이터 로딩**
각 페이지에서 `dashboard_data.json` 사용하도록 수정:
```javascript
// 모든 페이지 상단에 추가
const loadDashboardData = async () => {
    const response = await fetch('/src/assets/data/dashboard_data.json');
    return await response.json();
};
```

---

### **✅ Phase 3: 핵심 기능 완성 (1시간 소요)**

#### **3.1 PSC Inspection 관리**
**완료 사항:**
- MOU 필터링 ✅
- Action code 매핑 ✅
- Timeline visualization ✅

**추가 필요:**
- [ ] Inspection 일정 캘린더 뷰
- [ ] Follow-up action 추적 시스템
- [ ] Detention release 프로세스

#### **3.2 Non-conformity 추적**
**구현 필요:**
```javascript
// Action Code별 처리 상태
const actionTracking = {
    '17': { label: 'Before departure', dueTime: 'immediate', status: 'open' },
    '16': { label: 'Within 14 days', dueTime: '14d', status: 'pending' },
    '15': { label: 'Next port', dueTime: 'next_port', status: 'scheduled' },
    '30': { label: 'Detention', dueTime: 'until_resolved', status: 'critical' },
    '10': { label: 'Completed', dueTime: null, status: 'closed' }
};
```

#### **3.3 Risk Assessment 통합**
**파일:** `fleet_risk_assessment.json` 활용
- 선박별 risk score 계산
- Risk matrix 시각화
- High-risk vessel 알림

---

### **✅ Phase 4: 운영 환경 설정 (30분 소요)**

#### **4.1 서버 구동 표준화**
```batch
@echo off
echo Starting DORIKO PSC Dashboard...
cd /d "C:\Users\sicka\Downloads\새 폴더\psc-dashboard"

:: Python 서버 우선 시도
python --version >nul 2>&1
if %errorlevel% == 0 (
    start http://localhost:8000
    python -m http.server 8000
) else (
    :: Node 서버 대체
    npx http-server -p 8000 -o
)
```

#### **4.2 자동 업데이트 설정**
Windows Task Scheduler 등록:
- 매일 08:00 데이터 동기화 실행
- 매주 월요일 전체 시스템 검증

---

### **✅ Phase 5: 품질 보증 (1시간 소요)**

#### **5.1 기능 테스트**
- [ ] 모든 페이지 로딩 테스트
- [ ] 필터링 기능 검증
- [ ] Export 기능 확인
- [ ] 모바일 반응형 테스트

#### **5.2 데이터 무결성**
- [ ] Inspection count 일치 확인 (30개)
- [ ] Deficiency mapping 검증
- [ ] MOU 분류 정확성
- [ ] Action code 적용 확인

#### **5.3 성능 최적화**
- [ ] 로딩 시간 < 2초
- [ ] 필터링 반응 < 500ms
- [ ] 메모리 사용량 모니터링

---

## 🚀 **즉시 실행 명령어**

### **Step 1: 데이터 동기화**
```bash
cd "C:\Users\sicka\Downloads\새 폴더"
node sync-dashboard-data.js
```

### **Step 2: Dashboard 실행**
```bash
cd psc-dashboard
start-server.bat
```

### **Step 3: 시스템 검증**
브라우저에서 열기:
1. http://localhost:8000 (메인 대시보드)
2. http://localhost:8000/src/pages/inspections.html (검사 관리)
3. http://localhost:8000/src/pages/vessels.html (선박 관리)

---

## 📊 **예상 결과**

### **완성 후 기능:**
1. **실시간 PSC 모니터링**
   - 30개 inspection 완전 표시
   - MOU별 성과 분석
   - Detention 추적

2. **Non-conformity 관리**
   - 87개 deficiency 분류
   - Action code별 처리 상태
   - Follow-up 일정 관리

3. **Risk Assessment**
   - 선박별 risk score
   - High-risk vessel 알림
   - Trend 분석

4. **보고서 생성**
   - PSC 성과 보고서
   - MOU별 통계
   - Fleet performance dashboard

---

## ⚠️ **주의사항**

1. **데이터 보안**
   - 실제 선박 정보 포함
   - 외부 공유 금지
   - 백업 필수

2. **운영 안정성**
   - 일일 백업 실행
   - 에러 로그 모니터링
   - 정기 업데이트

3. **규정 준수**
   - IMO 요구사항 반영
   - MOU 가이드라인 준수
   - Company SMS 정합성

---

## 📞 **기술 지원**

**문제 발생 시:**
1. 에러 로그 확인: `psc-dashboard/logs/`
2. 데이터 무결성 검증: `node validate-data.js`
3. 시스템 재시작: `restart-dashboard.bat`

**완료 예정 시간: 3시간**

---

## ✅ **체크리스트**

- [ ] 데이터 동기화 완료
- [ ] Dashboard 정상 구동
- [ ] 30개 inspection 표시 확인
- [ ] MOU 필터링 작동
- [ ] Export 기능 정상
- [ ] 모바일 반응형 확인
- [ ] 백업 설정 완료
- [ ] 문서화 완료

---

**작성:** Superintendent, DORIKO LIMITED
**검토:** Fleet Management Team
**승인:** Technical Director
