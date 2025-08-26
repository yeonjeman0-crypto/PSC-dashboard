/**
 * 실제 PSC 검사가 발생한 항만 데이터 추출기
 * 30회 검사 기반으로 실제 항만별 분포 분석
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 1. 실제 검사 데이터에서 항만 추출
function extractInspectionPorts() {
    try {
        // 실제 검사 기록 읽기
        const inspectionData = JSON.parse(
            fs.readFileSync('./Raw Data from User/02-inspection-records.json', 'utf8')
        );

        console.log(`📊 분석 중: 총 ${inspectionData.total_records}회 검사`);
        
        // 항만별 검사 통계 집계
        const portStats = {};
        
        inspectionData.records.forEach(record => {
            const portKey = `${record.port.name}, ${record.port.country}`;
            
            if (!portStats[portKey]) {
                portStats[portKey] = {
                    portName: record.port.name,
                    country: record.port.country,
                    mouRegion: record.mou_region,
                    inspections: 0,
                    detentions: 0,
                    totalDeficiencies: 0,
                    vesselTypes: new Set(),
                    inspectionIds: []
                };
            }
            
            // 통계 업데이트
            portStats[portKey].inspections++;
            portStats[portKey].totalDeficiencies += record.deficiency_count;
            portStats[portKey].vesselTypes.add(record.vessel.type);
            portStats[portKey].inspectionIds.push(record.inspection_id);
            
            if (record.detention) {
                portStats[portKey].detentions++;
            }
        });

        // Set을 Array로 변환 및 억류율 계산
        Object.keys(portStats).forEach(key => {
            const port = portStats[key];
            port.vesselTypes = Array.from(port.vesselTypes);
            port.detentionRate = port.inspections > 0 ? 
                Math.round((port.detentions / port.inspections) * 100 * 10) / 10 : 0;
        });

        console.log('\n🎯 실제 검사 발생 항만:');
        Object.values(portStats).forEach(port => {
            console.log(`   ${port.portName} (${port.country}): ${port.inspections}회 검사, ${port.detentions}회 억류 (${port.detentionRate}%)`);
        });

        return portStats;

    } catch (error) {
        console.error('❌ 항만 데이터 추출 실패:', error.message);
        throw error;
    }
}

// 2. UN/LOCODE에서 항만 좌표 매핑
function mapPortCoordinates(portStats) {
    try {
        // UN/LOCODE 레지스트리 읽기
        const unlocodeData = JSON.parse(
            fs.readFileSync('./Raw Data from User/06-unlocode-registry.json', 'utf8')
        );

        console.log(`\n📍 UN/LOCODE 레지스트리: ${unlocodeData.total_locations}개 위치`);

        const coordMappedPorts = {};

        Object.keys(portStats).forEach(portKey => {
            const port = portStats[portKey];
            let coordinates = null;
            let locode = null;

            // UN/LOCODE에서 항만 검색 (다양한 패턴으로)
            if (unlocodeData.major_maritime_ports) {
                // 주요 항만에서 먼저 검색
                const majorPorts = [
                    ...unlocodeData.major_maritime_ports.asia_pacific || [],
                    ...unlocodeData.major_maritime_ports.europe || [],
                    ...unlocodeData.major_maritime_ports.americas || []
                ];

                const found = majorPorts.find(p => 
                    p.port_name.toLowerCase().includes(port.portName.toLowerCase()) ||
                    port.portName.toLowerCase().includes(p.port_name.toLowerCase())
                );

                if (found && found.coordinates) {
                    coordinates = found.coordinates;
                    locode = found.locode;
                }
            }

            // 좌표가 없으면 수동 매핑 (실제 주요 항만들)
            if (!coordinates) {
                const manualCoords = getManualCoordinates(port.portName, port.country);
                if (manualCoords) {
                    coordinates = manualCoords.coordinates;
                    locode = manualCoords.locode;
                }
            }

            if (coordinates) {
                coordMappedPorts[portKey] = {
                    ...port,
                    coordinates,
                    locode,
                    latitude: coordinates.lat,
                    longitude: coordinates.lng
                };
                
                console.log(`   ✅ ${port.portName}: ${coordinates.lat}°N, ${coordinates.lng}°E (${locode || 'Manual'})`);
            } else {
                console.log(`   ❌ ${port.portName}: 좌표 매핑 실패`);
                // 좌표 없어도 일단 포함
                coordMappedPorts[portKey] = {
                    ...port,
                    coordinates: null,
                    locode: null,
                    latitude: null,
                    longitude: null
                };
            }
        });

        return coordMappedPorts;

    } catch (error) {
        console.error('❌ 좌표 매핑 실패:', error.message);
        throw error;
    }
}

// 3. 수동 좌표 매핑 (실제 주요 항만들)
function getManualCoordinates(portName, country) {
    const manualMapping = {
        // 실제 검사 데이터에서 발견된 항만들
        'San Francisco': { locode: 'USSFO', coordinates: { lat: 37.7749, lng: -122.4194 } },
        'Zhoushan': { locode: 'CNZOS', coordinates: { lat: 30.0366, lng: 122.2067 } },
        'Tianjin': { locode: 'CNTXG', coordinates: { lat: 39.1042, lng: 117.2017 } },
        'Koper': { locode: 'SIKOP', coordinates: { lat: 45.5488, lng: 13.7301 } },
        'Busan': { locode: 'KRPUS', coordinates: { lat: 35.0951, lng: 129.0383 } },
        'Pusan': { locode: 'KRPUS', coordinates: { lat: 35.0951, lng: 129.0383 } },
        'Tokyo': { locode: 'JPTYO', coordinates: { lat: 35.6762, lng: 139.6503 } },
        'Hong Kong': { locode: 'HKHKG', coordinates: { lat: 22.3193, lng: 114.1694 } },
        'Singapore': { locode: 'SGSIN', coordinates: { lat: 1.3521, lng: 103.8198 } },
        'Rotterdam': { locode: 'NLRTM', coordinates: { lat: 51.9225, lng: 4.4792 } },
        'Hamburg': { locode: 'DEHAM', coordinates: { lat: 53.5511, lng: 9.9937 } },
        'Antwerp': { locode: 'BEANR', coordinates: { lat: 51.2213, lng: 4.4051 } },
        'Los Angeles': { locode: 'USLAX', coordinates: { lat: 33.7361, lng: -118.2644 } },
        'Long Beach': { locode: 'USLGB', coordinates: { lat: 33.7701, lng: -118.2137 } },
        'Shanghai': { locode: 'CNSHA', coordinates: { lat: 31.2304, lng: 121.4737 } },
        'Ningbo': { locode: 'CNNBO', coordinates: { lat: 29.8683, lng: 121.5440 } },
        'Qingdao': { locode: 'CNTAO', coordinates: { lat: 36.0611, lng: 120.3785 } },
        'Shenzhen': { locode: 'CNSZN', coordinates: { lat: 22.5431, lng: 114.0579 } },
        'Gwangyang': { locode: 'KRKYA', coordinates: { lat: 34.9406, lng: 127.7342 } },
        'Ulsan': { locode: 'KRULM', coordinates: { lat: 35.5372, lng: 129.3169 } },
        'Yokohama': { locode: 'JPYOK', coordinates: { lat: 35.4437, lng: 139.6380 } },
        'Nagoya': { locode: 'JPNGO', coordinates: { lat: 35.1815, lng: 136.9066 } },
        'Kaohsiung': { locode: 'TWKHH', coordinates: { lat: 22.6273, lng: 120.3014 } }
    };

    const key = Object.keys(manualMapping).find(name => 
        name.toLowerCase() === portName.toLowerCase() ||
        portName.toLowerCase().includes(name.toLowerCase())
    );

    return key ? manualMapping[key] : null;
}

// 4. 실행 및 출력
function main() {
    console.log('🚢 실제 PSC 검사 항만 지리정보 매핑 시작\n');

    try {
        // Step 1: 실제 검사 항만 추출
        const portStats = extractInspectionPorts();
        
        // Step 2: 좌표 매핑
        const mappedPorts = mapPortCoordinates(portStats);
        
        // Step 3: JSON 파일로 저장
        const output = {
            metadata: {
                generatedAt: new Date().toISOString(),
                totalPorts: Object.keys(mappedPorts).length,
                totalInspections: Object.values(mappedPorts).reduce((sum, port) => sum + port.inspections, 0),
                totalDetentions: Object.values(mappedPorts).reduce((sum, port) => sum + port.detentions, 0),
                dataSource: '02-inspection-records.json + 06-unlocode-registry.json'
            },
            ports: mappedPorts
        };

        // inspection_fact.json으로 저장
        fs.writeFileSync('./psc-dashboard/src/assets/data/inspection_fact.json', 
                         JSON.stringify(output, null, 2));

        console.log(`\n✅ 완료! inspection_fact.json 생성`);
        console.log(`   📊 총 ${Object.keys(mappedPorts).length}개 항만`);
        console.log(`   📍 좌표 매핑 성공: ${Object.values(mappedPorts).filter(p => p.coordinates).length}개 항만`);
        
        // 요약 통계
        const withCoords = Object.values(mappedPorts).filter(p => p.coordinates);
        const totalInspections = withCoords.reduce((sum, p) => sum + p.inspections, 0);
        const totalDetentions = withCoords.reduce((sum, p) => sum + p.detentions, 0);
        const avgDetentionRate = withCoords.length > 0 ? 
            Math.round(withCoords.reduce((sum, p) => sum + p.detentionRate, 0) / withCoords.length * 10) / 10 : 0;

        console.log(`   📈 좌표 있는 항만 검사: ${totalInspections}회`);
        console.log(`   🚨 억류: ${totalDetentions}회 (평균 억류율 ${avgDetentionRate}%)`);

        return output;

    } catch (error) {
        console.error('❌ 프로세스 실패:', error.message);
        process.exit(1);
    }
}

// 실행
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { extractInspectionPorts, mapPortCoordinates };