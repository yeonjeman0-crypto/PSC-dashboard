"""
Maritime Risk Calculator - Clean Version
Core risk calculation functionality without Unicode characters
"""

import json
import numpy as np
from datetime import datetime
from typing import Dict, List, Tuple, Optional

class RiskCalculator_Maritime:
    """Maritime risk assessment specialist with core functionality."""
    
    def __init__(self, data_path: str = "processed_data"):
        """Initialize the Risk Calculator with processed maritime data."""
        self.data_path = data_path
        self.vessel_data = None
        self.inspection_data = None
        self.risk_scores = {}
        
        # Risk scoring parameters
        self.age_weights = {
            'very_new': (0, 5, 0.1),      # 0-5 years: 10% risk
            'new': (5, 15, 0.25),         # 5-15 years: 25% risk  
            'mature': (15, 25, 0.5),      # 15-25 years: 50% risk
            'old': (25, 35, 0.75),        # 25-35 years: 75% risk
            'very_old': (35, 100, 1.0)    # 35+ years: 100% risk
        }
        
        # Load data
        self._load_data()
        
    def _load_data(self):
        """Load processed maritime data from JSON files."""
        try:
            # Load vessel master data
            with open(f"{self.data_path}/core_master/vessel_master.json", 'r') as f:
                self.vessel_data = json.load(f)
                
            # Load inspection analytics
            with open(f"{self.data_path}/analytics/inspection_fact.json", 'r') as f:
                self.inspection_data = json.load(f)
                
            print(f"SUCCESS: Loaded data for {len(self.vessel_data['vessels'])} vessels")
            print(f"SUCCESS: Loaded {self.inspection_data['fleet_kpis']['total_inspections']} inspections")
            print(f"SUCCESS: Loaded {self.inspection_data['compliance_kpis']['total_deficiencies']} deficiencies")
            
        except Exception as e:
            print(f"ERROR: Error loading data: {str(e)}")
            raise
            
    def calculateRiskScore(self, vessel_name: str) -> Dict:
        """
        Calculate comprehensive risk score for a vessel.
        Formula: riskScore = A*0.4 + H*0.4 + M*0.2
        """
        try:
            # Find vessel in master data
            vessel_info = None
            for vessel in self.vessel_data['vessels']:
                if vessel['vessel_name'] == vessel_name:
                    vessel_info = vessel
                    break
                    
            if not vessel_info:
                raise ValueError(f"Vessel {vessel_name} not found in master data")
                
            # Find vessel in inspection data
            inspection_info = None
            for vessel_perf in self.inspection_data['vessel_performance']:
                if vessel_perf['vessel_name'] == vessel_name:
                    inspection_info = vessel_perf
                    break
                    
            # Calculate A Component (Age Factor)
            age_score = self._calculate_age_factor(vessel_info['age_years'])
            
            # Calculate H Component (Historical Defect Factor)
            if inspection_info:
                history_score = self._calculate_history_factor(inspection_info)
            else:
                history_score = 50.0
                
            # Calculate M Component (MOU Risk Factor)
            mou_score = self._calculate_mou_factor(vessel_info, inspection_info)
            
            # Final risk score calculation
            risk_score = (age_score * 0.4) + (history_score * 0.4) + (mou_score * 0.2)
            
            # Clamp to 0-100 range
            risk_score = max(0, min(100, risk_score))
            
            # Determine risk category
            risk_category = self._get_risk_category(risk_score)
            
            result = {
                'vessel_name': vessel_name,
                'risk_score': round(risk_score, 1),
                'risk_category': risk_category,
                'factor_breakdown': {
                    'age_factor': round(age_score, 1),
                    'history_factor': round(history_score, 1),
                    'mou_factor': round(mou_score, 1),
                    'age_weight': 0.4,
                    'history_weight': 0.4,
                    'mou_weight': 0.2
                },
                'vessel_info': {
                    'age_years': vessel_info['age_years'],
                    'vessel_type': vessel_info['vessel_type'],
                    'flag_state': vessel_info['flag_state'],
                    'built_year': vessel_info['built_year'],
                    'dwt': vessel_info.get('dwt', 0)
                }
            }
            
            # Store in cache
            self.risk_scores[vessel_name] = result
            return result
            
        except Exception as e:
            print(f"ERROR: Error calculating risk score for {vessel_name}: {str(e)}")
            return {'error': str(e)}
            
    def _calculate_age_factor(self, age_years: float) -> float:
        """Calculate age-based risk factor (0-100 scale)."""
        for category, (min_age, max_age, risk_factor) in self.age_weights.items():
            if min_age <= age_years < max_age:
                # Linear interpolation within age band
                if max_age == 100:  # Handle very_old category
                    return risk_factor * 100
                age_range = max_age - min_age
                position = (age_years - min_age) / age_range
                return risk_factor * 100 * (0.5 + 0.5 * position)
        
        # Default for very old vessels
        return 100.0
        
    def _calculate_history_factor(self, inspection_info: Dict) -> float:
        """Calculate historical defect-based risk factor."""
        if not inspection_info or inspection_info['inspections'] == 0:
            return 50.0  # Moderate risk for no history
            
        # Base risk from deficiency rate
        avg_deficiencies = inspection_info['avg_deficiencies']
        detention_rate = inspection_info['detention_rate'] / 100.0
        clean_rate = inspection_info['clean_rate'] / 100.0
        
        # Deficiency risk (0-70 points)
        defect_risk = min(70, avg_deficiencies * 8)  # 8 points per average deficiency
        
        # Detention risk (0-25 points)  
        detention_risk = detention_rate * 25
        
        # Clean inspection bonus (subtract up to 15 points)
        clean_bonus = clean_rate * 15
        
        # Performance trend modifier
        trend_modifier = self._get_trend_modifier(inspection_info.get('performance_trend', 'Stable'))
        
        history_score = (defect_risk + detention_risk - clean_bonus) * trend_modifier
        
        return max(0, min(100, history_score))
        
    def _calculate_mou_factor(self, vessel_info: Dict, inspection_info: Dict = None) -> float:
        """Calculate MOU-based risk factor."""
        base_mou_risk = 50.0  # Default moderate risk
        
        # Flag state risk modifier
        flag_risk_modifiers = {
            'Panama': 1.1,      # Higher risk due to flag of convenience
            'Marshall Islands': 1.1,
            'Korea': 0.9,       # Lower risk, good maritime administration
            'Japan': 0.8,
            'Norway': 0.8
        }
        
        flag_modifier = flag_risk_modifiers.get(vessel_info['flag_state'], 1.0)
        
        # Vessel type risk modifier
        type_risk_modifiers = {
            'PC(T)C': 1.0,      # Standard risk
            'Bulk': 0.9,        # Slightly lower risk based on fleet data
            'Container': 0.85,
            'Tanker': 1.2
        }
        
        type_modifier = type_risk_modifiers.get(vessel_info['vessel_type'], 1.0)
        
        # Classification society modifier
        class_risk_modifiers = {
            'DNV': 0.9,         # Lower risk, good class society
            'RINA': 1.0,
            'KR': 0.9,          # Korean Register, good reputation
            'ABS': 0.9,
            'LR': 0.9
        }
        
        class_modifier = class_risk_modifiers.get(vessel_info.get('classification_society', 'Unknown'), 1.0)
        
        mou_score = base_mou_risk * flag_modifier * type_modifier * class_modifier
        
        return max(0, min(100, mou_score))
        
    def _get_trend_modifier(self, trend: str) -> float:
        """Get performance trend modifier."""
        trend_modifiers = {
            'Excellent': 0.7,
            'Improving': 0.8,
            'Stable': 1.0,
            'Deteriorating': 1.3,
            'Critical': 1.5
        }
        return trend_modifiers.get(trend, 1.0)
        
    def _get_risk_category(self, risk_score: float) -> str:
        """Classify risk score into categories."""
        if risk_score <= 25:
            return 'LOW'
        elif risk_score <= 50:
            return 'MEDIUM'
        elif risk_score <= 75:
            return 'HIGH'
        else:
            return 'CRITICAL'
            
    def generateRiskMatrix(self, vessels: List[str] = None) -> Dict:
        """Generate 5x5 risk matrix data."""
        if vessels is None:
            vessels = [v['vessel_name'] for v in self.inspection_data['vessel_performance']]
            
        # Calculate risk scores for all vessels
        vessel_risks = []
        for vessel_name in vessels:
            risk_data = self.calculateRiskScore(vessel_name)
            if 'error' not in risk_data:
                vessel_risks.append(risk_data)
                
        # Create 5x5 risk matrix
        probability_levels = ['Very Low', 'Low', 'Medium', 'High', 'Very High']
        severity_levels = ['Insignificant', 'Minor', 'Moderate', 'Major', 'Catastrophic']
        
        # Initialize matrix
        risk_matrix = np.zeros((5, 5))
        vessel_distribution = {}
        
        for i in range(5):
            for j in range(5):
                vessel_distribution[f"{i}_{j}"] = []
                
        # Distribute vessels into matrix cells
        for risk_data in vessel_risks:
            risk_score = risk_data['risk_score']
            vessel_name = risk_data['vessel_name']
            
            # Map risk score to probability (based on historical performance)
            prob_index = min(4, int(risk_score / 20))
            
            # Map risk score to severity (based on potential impact)
            vessel_info = risk_data['vessel_info']
            severity_index = self._calculate_severity_index(vessel_info, risk_score)
            
            risk_matrix[4-severity_index, prob_index] += 1
            vessel_distribution[f"{4-severity_index}_{prob_index}"].append(vessel_name)
            
        # Calculate risk levels (1-25)
        risk_levels = np.zeros((5, 5))
        for i in range(5):
            for j in range(5):
                risk_levels[i, j] = (5 - i) * (j + 1)
                
        self.risk_matrix = {
            'matrix': risk_matrix.tolist(),
            'risk_levels': risk_levels.tolist(),
            'probability_levels': probability_levels,
            'severity_levels': severity_levels,
            'vessel_distribution': vessel_distribution,
            'total_vessels': len(vessel_risks),
            'generated_at': datetime.now().isoformat()
        }
        
        return self.risk_matrix
        
    def _calculate_severity_index(self, vessel_info: Dict, risk_score: float) -> int:
        """Calculate severity index based on vessel characteristics and risk."""
        base_severity = min(4, int(risk_score / 20))
        
        # Adjust based on vessel size (DWT)
        dwt = vessel_info.get('dwt', 0)
        if dwt > 100000:  # Large vessels
            base_severity = min(4, base_severity + 1)
        elif dwt < 20000:  # Small vessels
            base_severity = max(0, base_severity - 1)
            
        return base_severity
        
    def simulateScenario(self, scenario_name: str, parameters: Dict) -> Dict:
        """Run risk mitigation scenario simulations."""
        scenario_results = {
            'scenario_name': scenario_name,
            'parameters': parameters,
            'simulation_date': datetime.now().isoformat(),
            'vessels_analyzed': [],
            'summary': {}
        }
        
        try:
            vessels = parameters.get('vessels', [v['vessel_name'] for v in self.inspection_data['vessel_performance']])
            
            # Baseline risk scores
            baseline_scores = {}
            for vessel in vessels:
                baseline_scores[vessel] = self.calculateRiskScore(vessel)
                
            # Apply scenario modifications
            modified_scores = {}
            
            if scenario_name == 'training_impact':
                # Reduce historical defect factor by specified percentage
                reduction_pct = parameters.get('defect_reduction', 20) / 100.0
                
                for vessel in vessels:
                    baseline = baseline_scores[vessel]
                    if 'error' not in baseline:
                        # Calculate modified history factor
                        original_h = baseline['factor_breakdown']['history_factor']
                        modified_h = original_h * (1 - reduction_pct)
                        
                        # Recalculate risk score
                        a_factor = baseline['factor_breakdown']['age_factor']
                        m_factor = baseline['factor_breakdown']['mou_factor']
                        
                        new_risk_score = (a_factor * 0.4) + (modified_h * 0.4) + (m_factor * 0.2)
                        new_risk_score = max(0, min(100, new_risk_score))
                        
                        modified_scores[vessel] = {
                            'risk_score': new_risk_score,
                            'risk_category': self._get_risk_category(new_risk_score)
                        }
                        
            elif scenario_name == 'maintenance_improvement':
                # Improve age-related risk through better maintenance
                age_improvement = parameters.get('age_risk_reduction', 15) / 100.0
                
                for vessel in vessels:
                    baseline = baseline_scores[vessel]
                    if 'error' not in baseline:
                        # Calculate modified age factor
                        original_a = baseline['factor_breakdown']['age_factor']
                        modified_a = original_a * (1 - age_improvement)
                        
                        # Recalculate risk score
                        h_factor = baseline['factor_breakdown']['history_factor']
                        m_factor = baseline['factor_breakdown']['mou_factor']
                        
                        new_risk_score = (modified_a * 0.4) + (h_factor * 0.4) + (m_factor * 0.2)
                        new_risk_score = max(0, min(100, new_risk_score))
                        
                        modified_scores[vessel] = {
                            'risk_score': new_risk_score,
                            'risk_category': self._get_risk_category(new_risk_score)
                        }
                        
            # Calculate impact analysis
            total_reduction = 0
            vessels_improved = 0
            
            for vessel in vessels:
                if vessel in baseline_scores and vessel in modified_scores:
                    baseline_score = baseline_scores[vessel]['risk_score']
                    modified_score = modified_scores[vessel]['risk_score']
                    
                    reduction = baseline_score - modified_score
                    total_reduction += reduction
                    
                    if reduction > 0:
                        vessels_improved += 1
                        
                    # Store vessel analysis
                    scenario_results['vessels_analyzed'].append({
                        'vessel_name': vessel,
                        'baseline_score': baseline_score,
                        'modified_score': modified_score,
                        'risk_reduction': reduction,
                        'baseline_category': baseline_scores[vessel]['risk_category'],
                        'modified_category': modified_scores[vessel]['risk_category']
                    })
                    
            # Calculate summary statistics
            avg_reduction = total_reduction / len(vessels) if vessels else 0
            improvement_rate = (vessels_improved / len(vessels) * 100) if vessels else 0
            
            # ROI calculation
            cost_estimates = {
                'training_impact': 50000,
                'maintenance_improvement': 200000,
                'flag_change': 25000
            }
            
            annual_savings = avg_reduction * 5000  # $5K per risk point
            cost = cost_estimates.get(scenario_name, 100000)
            payback_period = cost / annual_savings if annual_savings > 0 else float('inf')
            roi_5_year = ((annual_savings * 5) - cost) / cost * 100 if cost > 0 else 0
            
            scenario_results['summary'] = {
                'total_vessels': len(vessels),
                'vessels_improved': vessels_improved,
                'improvement_rate_pct': round(improvement_rate, 1),
                'average_risk_reduction': round(avg_reduction, 2),
                'total_risk_reduction': round(total_reduction, 2),
                'roi_estimate': {
                    'estimated_cost': cost,
                    'annual_savings': round(annual_savings),
                    'payback_period_years': round(payback_period, 1),
                    'roi_5_year_pct': round(roi_5_year, 1)
                }
            }
            
        except Exception as e:
            scenario_results['error'] = str(e)
            
        return scenario_results
        
    def generateFleetReport(self, save_path: str = None) -> Dict:
        """Generate comprehensive fleet risk assessment report."""
        print("INFO: Generating comprehensive fleet risk assessment...")
        
        # Calculate risk scores for all vessels
        fleet_risks = []
        for vessel in self.inspection_data['vessel_performance']:
            risk_data = self.calculateRiskScore(vessel['vessel_name'])
            if 'error' not in risk_data:
                fleet_risks.append(risk_data)
                
        # Fleet statistics
        total_vessels = len(fleet_risks)
        avg_fleet_risk = np.mean([v['risk_score'] for v in fleet_risks])
        
        risk_distribution = {'LOW': 0, 'MEDIUM': 0, 'HIGH': 0, 'CRITICAL': 0}
        for vessel in fleet_risks:
            risk_distribution[vessel['risk_category']] += 1
            
        # Top risk vessels
        top_risk_vessels = sorted(fleet_risks, key=lambda x: x['risk_score'], reverse=True)[:5]
        
        # Generate risk matrix
        risk_matrix = self.generateRiskMatrix()
        
        report = {
            'report_title': 'Maritime Fleet Risk Assessment Report',
            'generated_at': datetime.now().isoformat(),
            'fleet_overview': {
                'total_vessels': total_vessels,
                'average_risk_score': round(avg_fleet_risk, 1),
                'risk_distribution': risk_distribution,
                'high_risk_vessels': len([v for v in fleet_risks if v['risk_score'] > 50]),
                'critical_risk_vessels': len([v for v in fleet_risks if v['risk_score'] > 75])
            },
            'top_risk_vessels': [
                {
                    'vessel_name': v['vessel_name'],
                    'risk_score': v['risk_score'],
                    'risk_category': v['risk_category'],
                    'age_years': v['vessel_info']['age_years'],
                    'vessel_type': v['vessel_info']['vessel_type']
                } for v in top_risk_vessels
            ],
            'risk_matrix_summary': {
                'total_vessels_in_matrix': risk_matrix['total_vessels'],
                'high_risk_cells': sum(1 for i in range(5) for j in range(5) if risk_matrix['risk_levels'][i][j] > 15),
                'vessels_in_high_risk': sum(risk_matrix['matrix'][i][j] for i in range(5) for j in range(5) if risk_matrix['risk_levels'][i][j] > 15)
            },
            'vessel_details': fleet_risks,
            'risk_matrix': risk_matrix
        }
        
        if save_path:
            with open(save_path, 'w') as f:
                json.dump(report, f, indent=2)
            print(f"SUCCESS: Fleet report saved to {save_path}")
            
        return report
        
    def display_risk_matrix_text(self):
        """Display risk matrix in text format."""
        if not hasattr(self, 'risk_matrix') or not self.risk_matrix:
            self.generateRiskMatrix()
            
        print("\n5x5 Maritime Risk Assessment Matrix")
        print("=" * 60)
        
        matrix = self.risk_matrix['matrix']
        risk_levels = self.risk_matrix['risk_levels']
        severity_levels = self.risk_matrix['severity_levels']
        probability_levels = self.risk_matrix['probability_levels']
        
        # Header
        print(f"{'Severity':>15} | {'Very Low':>8} {'Low':>8} {'Medium':>8} {'High':>8} {'Very High':>8}")
        print("-" * 80)
        
        # Matrix rows
        for i in range(5):
            row_data = []
            for j in range(5):
                vessel_count = int(matrix[i][j])
                risk_level = int(risk_levels[i][j])
                if vessel_count > 0:
                    row_data.append(f"{vessel_count}v({risk_level})")
                else:
                    row_data.append(f"0v({risk_level})")
            
            print(f"{severity_levels[i]:>15} | {row_data[0]:>8} {row_data[1]:>8} {row_data[2]:>8} {row_data[3]:>8} {row_data[4]:>8}")
        
        print("\nLegend: Xv(Y) = X vessels, Risk Level Y")
        print("Risk Levels: 1-5 (Low) | 6-10 (Medium) | 11-15 (High) | 16-25 (Critical)")

def main():
    """Main execution function for maritime risk calculator."""
    try:
        print("Maritime Risk Calculator - Core Assessment System")
        print("=" * 60)
        
        # Initialize calculator
        calculator = RiskCalculator_Maritime()
        
        print("\nCalculating Risk Scores for All Vessels:")
        print("-" * 50)
        
        # Calculate risks for all vessels with inspection data
        all_risks = []
        for vessel in calculator.inspection_data['vessel_performance']:
            risk_data = calculator.calculateRiskScore(vessel['vessel_name'])
            if 'error' not in risk_data:
                all_risks.append(risk_data)
                print(f"{risk_data['vessel_name']:15} | Risk: {risk_data['risk_score']:5.1f} ({risk_data['risk_category']:8}) | "
                      f"A:{risk_data['factor_breakdown']['age_factor']:4.1f} "
                      f"H:{risk_data['factor_breakdown']['history_factor']:4.1f} "
                      f"M:{risk_data['factor_breakdown']['mou_factor']:4.1f}")
        
        # Display risk matrix
        calculator.display_risk_matrix_text()
        
        # High-risk vessel analysis
        print("\nHigh-Risk Vessels (>75 Risk Score):")
        print("-" * 40)
        high_risk_vessels = [v for v in all_risks if v['risk_score'] > 75]
        for vessel in sorted(high_risk_vessels, key=lambda x: x['risk_score'], reverse=True):
            print(f"* {vessel['vessel_name']} - {vessel['risk_score']:.1f} ({vessel['risk_category']})")
            print(f"  Age: {vessel['vessel_info']['age_years']:.1f} years | Type: {vessel['vessel_info']['vessel_type']}")
        
        if not high_risk_vessels:
            print("SUCCESS: No critical risk vessels found!")
            
        # Run training impact scenario
        print("\nRunning Training Impact Scenario (25% Defect Reduction):")
        print("-" * 55)
        high_defect_vessels = [v['vessel_name'] for v in all_risks if v['factor_breakdown']['history_factor'] > 60]
        
        if high_defect_vessels:
            scenario_results = calculator.simulateScenario(
                'training_impact', 
                {'defect_reduction': 25, 'vessels': high_defect_vessels[:5]}
            )
            
            if 'error' not in scenario_results:
                print(f"Vessels Analyzed: {scenario_results['summary']['total_vessels']}")
                print(f"Vessels Improved: {scenario_results['summary']['vessels_improved']}")
                print(f"Average Risk Reduction: {scenario_results['summary']['average_risk_reduction']:.1f} points")
                print(f"Implementation Cost: ${scenario_results['summary']['roi_estimate']['estimated_cost']:,}")
                print(f"Annual Savings: ${scenario_results['summary']['roi_estimate']['annual_savings']:,}")
                print(f"ROI (5-year): {scenario_results['summary']['roi_estimate']['roi_5_year_pct']:.1f}%")
        else:
            print("No vessels with high defect history found for training scenario.")
            
        # Generate and save fleet report
        print("\nGenerating Fleet Risk Report...")
        fleet_report = calculator.generateFleetReport("fleet_risk_assessment.json")
        
        print(f"\nFleet Risk Summary:")
        overview = fleet_report['fleet_overview']
        print(f"Total Vessels Analyzed: {overview['total_vessels']}")
        print(f"Average Fleet Risk: {overview['average_risk_score']:.1f}")
        print(f"Risk Distribution: LOW({overview['risk_distribution']['LOW']}) | "
              f"MED({overview['risk_distribution']['MEDIUM']}) | "
              f"HIGH({overview['risk_distribution']['HIGH']}) | "
              f"CRIT({overview['risk_distribution']['CRITICAL']})")
        
        print("\nSUCCESS: Maritime Risk Assessment Complete!")
        print("Report saved as: fleet_risk_assessment.json")
        
        return calculator, fleet_report
        
    except Exception as e:
        print(f"ERROR: Error in maritime risk calculation: {str(e)}")
        raise

if __name__ == "__main__":
    calculator, report = main()