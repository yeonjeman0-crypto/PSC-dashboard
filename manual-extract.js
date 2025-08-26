// 직접 데이터 분석 스크립트
import fs from 'fs';

console.log('🚢 실제 PSC 검사 항만 분석 시작\n');

// 검사 데이터 읽기
const rawInspections = fs.readFileSync('./Raw Data from User/02-inspection-records.json', 'utf8');
const inspectionData = JSON.parse(rawInspections);

console.log(`📊 총 검사 수: ${inspectionData.total_records}`);
console.log(`📅 기간: ${inspectionData.period.start_date} ~ ${inspectionData.period.end_date}`);

// 항만별 통계 집계
const portStats = {};

inspectionData.records.forEach(record => {
    const portKey = record.port.name;
    
    if (!portStats[portKey]) {
        portStats[portKey] = {
            portName: record.port.name,
            country: record.port.country,
            mouRegion: record.mou_region,
            inspections: 0,
            detentions: 0,
            deficiencies: 0,
            vessels: new Set()
        };
    }
    
    portStats[portKey].inspections++;
    portStats[portKey].deficiencies += record.deficiency_count;
    portStats[portKey].vessels.add(record.vessel.name);
    
    if (record.detention) {
        portStats[portKey].detentions++;
    }
});

// 결과 정리
Object.keys(portStats).forEach(key => {
    const port = portStats[key];
    port.vesselCount = port.vessels.size;
    port.vessels = Array.from(port.vessels);
    port.detentionRate = port.inspections > 0 ? 
        Math.round((port.detentions / port.inspections) * 100 * 10) / 10 : 0;
    port.avgDeficiencies = port.inspections > 0 ? 
        Math.round((port.deficiencies / port.inspections) * 10) / 10 : 0;
});

console.log('\n🎯 실제 검사 발생 항만 목록:');
Object.values(portStats)
    .sort((a, b) => b.inspections - a.inspections)
    .forEach((port, idx) => {
        console.log(`${idx + 1}. ${port.portName} (${port.country})`);
        console.log(`   📈 ${port.inspections}회 검사, ${port.detentions}회 억류 (${port.detentionRate}%)`);
        console.log(`   🚢 ${port.vesselCount}척 선박, 평균 ${port.avgDeficiencies}개 결함`);
        console.log(`   🌏 ${port.mouRegion}`);
        console.log('');
    });

// 수동 좌표 매핑 (실제 검사 발생 항만들)
const coordMapping = {
    'San Francisco': { lat: 37.7749, lng: -122.4194, locode: 'USSFO' },
    'Zhoushan': { lat: 30.0366, lng: 122.2067, locode: 'CNZOS' },
    'Tianjin': { lat: 39.1042, lng: 117.2017, locode: 'CNTXG' },
    'Koper': { lat: 45.5488, lng: 13.7301, locode: 'SIKOP' },
    'Masan': { lat: 35.2061, lng: 128.5644, locode: 'KRMSP' },
    'Incheon': { lat: 37.4563, lng: 126.7052, locode: 'KRICN' },
    'Kaohsiung': { lat: 22.6273, lng: 120.3014, locode: 'TWKHH' },
    'Misurata': { lat: 32.3745, lng: 15.0919, locode: 'LYMSR' },
    'Jeddah': { lat: 21.4858, lng: 39.1925, locode: 'SAJED' },
    'Benecia': { lat: 38.0494, lng: -122.1583, locode: 'USBEN' },
    // 추가 주요 항만들
    'Busan': { lat: 35.0951, lng: 129.0383, locode: 'KRPUS' },
    'Hong Kong': { lat: 22.3193, lng: 114.1694, locode: 'HKHKG' },
    'Singapore': { lat: 1.3521, lng: 103.8198, locode: 'SGSIN' },
    'Rotterdam': { lat: 51.9225, lng: 4.4792, locode: 'NLRTM' },
    'Hamburg': { lat: 53.5511, lng: 9.9937, locode: 'DEHAM' },
    'Tokyo': { lat: 35.6762, lng: 139.6503, locode: 'JPTYO' },
    'Yokohama': { lat: 35.4437, lng: 139.6380, locode: 'JPYOK' },
    'Los Angeles': { lat: 33.7361, lng: -118.2644, locode: 'USLAX' },
    'Long Beach': { lat: 33.7701, lng: -118.2137, locode: 'USLGB' }
};

// 좌표 적용
Object.keys(portStats).forEach(portName => {
    const coords = coordMapping[portName];
    if (coords) {
        portStats[portName] = {
            ...portStats[portName],
            latitude: coords.lat,
            longitude: coords.lng,
            locode: coords.locode
        };
    } else {
        console.log(`❌ 좌표 없음: ${portName}`);
    }
});

// 최종 데이터 생성
const finalData = {
    metadata: {
        generatedAt: new Date().toISOString(),
        totalPorts: Object.keys(portStats).length,
        totalInspections: Object.values(portStats).reduce((sum, p) => sum + p.inspections, 0),
        totalDetentions: Object.values(portStats).reduce((sum, p) => sum + p.detentions, 0),
        mappedPorts: Object.values(portStats).filter(p => p.latitude).length,
        dataSource: 'Real PSC inspection data (02-inspection-records.json)'
    },
    ports: portStats
};

// 디렉토리 생성 및 저장
try {
    fs.mkdirSync('./psc-dashboard/src/assets/data', { recursive: true });
} catch (e) {}

fs.writeFileSync('./psc-dashboard/src/assets/data/inspection_fact.json', 
                 JSON.stringify(finalData, null, 2));

console.log('✅ inspection_fact.json 생성 완료!');
console.log(`📍 좌표 매핑된 항만: ${finalData.metadata.mappedPorts}/${finalData.metadata.totalPorts}`);

// 요약 출력
const mappedPorts = Object.values(portStats).filter(p => p.latitude);
console.log('\n📍 좌표 매핑된 항만들:');
mappedPorts.forEach(port => {
    console.log(`   ${port.portName}: ${port.latitude}°N, ${port.longitude}°E (${port.locode})`);
});