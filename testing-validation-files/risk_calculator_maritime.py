"""
RiskCalculator_Maritime - Elite Maritime Risk Assessment Specialist

Comprehensive maritime risk assessment system with:
- Precise risk scoring algorithms (0-100 scale)
- 5x5 risk matrix generation with probability-severity analysis
- Scenario simulations for risk mitigation strategies
- Visual risk heatmaps and actionable recommendations
"""

import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import warnings
warnings.filterwarnings('ignore')

class RiskCalculator_Maritime:
    """
    Elite maritime risk assessment specialist with sophisticated risk modeling.
    
    Implements the core risk scoring formula:
    riskScore = A*0.4 + H*0.4 + M*0.2
    
    Where:
    - A (Age Factor): Vessel age normalized to 0-100 scale
    - H (Defect History): Historical defect rate and severity score  
    - M (MOU Criteria): Port State Control MOU performance indicators
    """
    
    def __init__(self, data_path: str = "processed_data"):
        """Initialize the Risk Calculator with processed maritime data."""
        self.data_path = data_path
        self.vessel_data = None
        self.inspection_data = None
        self.mou_data = None
        self.risk_scores = {}
        self.risk_matrix = None
        
        # Risk scoring parameters
        self.age_weights = {
            'very_new': (0, 5, 0.1),      # 0-5 years: 10% risk
            'new': (5, 15, 0.25),         # 5-15 years: 25% risk  
            'mature': (15, 25, 0.5),      # 15-25 years: 50% risk
            'old': (25, 35, 0.75),        # 25-35 years: 75% risk
            'very_old': (35, 100, 1.0)    # 35+ years: 100% risk
        }
        
        self.defect_severity_weights = {
            'Critical': 1.0,    # Life Saving, Navigation, Structure
            'High': 0.75,       # Machinery, Security
            'Medium': 0.5,      # Other safety systems
            'Low': 0.25         # Minor operational issues
        }
        
        self.mou_risk_factors = {
            'Tokyo MoU': 0.8,     # High inspection frequency
            'Paris MoU': 0.6,     # Moderate inspection frequency  
            'USCG': 0.4,          # Lower inspection frequency
            'Mediterranean MoU': 0.7,
            'Riyadh MoU': 0.5,
            'Other': 0.6
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
                
            print(f"✅ Loaded data for {len(self.vessel_data['vessels'])} vessels")
            print(f"✅ Loaded {self.inspection_data['fleet_kpis']['total_inspections']} inspections")
            print(f"✅ Loaded {self.inspection_data['compliance_kpis']['total_deficiencies']} deficiencies")
            
        except Exception as e:
            print(f"❌ Error loading data: {str(e)}")
            raise
            
    def calculateRiskScore(self, vessel_name: str) -> Dict:
        """
        Calculate comprehensive risk score for a vessel.
        
        Formula: riskScore = A*0.4 + H*0.4 + M*0.2
        
        Returns:
            Dict with risk score breakdown and confidence intervals
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
                # No inspection history - assign moderate risk
                history_score = 50.0
                
            # Calculate M Component (MOU Risk Factor)
            mou_score = self._calculate_mou_factor(vessel_info, inspection_info)
            
            # Final risk score calculation
            risk_score = (age_score * 0.4) + (history_score * 0.4) + (mou_score * 0.2)
            
            # Clamp to 0-100 range
            risk_score = max(0, min(100, risk_score))
            
            # Determine risk category
            risk_category = self._get_risk_category(risk_score)
            
            # Calculate confidence interval (±5 points based on data completeness)
            confidence_lower = max(0, risk_score - 5)
            confidence_upper = min(100, risk_score + 5)
            
            result = {
                'vessel_name': vessel_name,
                'risk_score': round(risk_score, 1),
                'risk_category': risk_category,
                'confidence_interval': (confidence_lower, confidence_upper),
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
                    'built_year': vessel_info['built_year']
                }
            }
            
            # Store in cache
            self.risk_scores[vessel_name] = result
            
            return result
            
        except Exception as e:
            print(f"❌ Error calculating risk score for {vessel_name}: {str(e)}")
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
        """
        Generate comprehensive 5x5 risk matrix with heatmap visualization.
        
        Returns:
            Dict containing matrix data and visualization components
        """
        if vessels is None:
            # Use all vessels with inspection data
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
                vessel_distribution[(i, j)] = []
                
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
            vessel_distribution[(4-severity_index, prob_index)].append(vessel_name)
            
        # Calculate risk levels (1-25)
        risk_levels = np.zeros((5, 5))
        for i in range(5):
            for j in range(5):
                # Risk level = (Severity + 1) * (Probability + 1)  
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
        
    def visualizeRiskMatrix(self, save_path: str = None) -> go.Figure:
        """
        Create interactive risk matrix heatmap visualization.
        
        Returns:
            Plotly figure object
        """
        if not self.risk_matrix:
            self.generateRiskMatrix()
            
        # Create heatmap data
        z_data = self.risk_matrix['risk_levels']
        hover_text = []
        
        for i in range(5):
            hover_row = []
            for j in range(5):
                vessel_count = int(self.risk_matrix['matrix'][i][j])
                risk_level = int(z_data[i][j])
                vessels = self.risk_matrix['vessel_distribution'].get((i, j), [])
                
                hover_info = f"""
                Risk Level: {risk_level}
                Vessel Count: {vessel_count}
                Severity: {self.risk_matrix['severity_levels'][i]}
                Probability: {self.risk_matrix['probability_levels'][j]}
                """
                
                if vessels:
                    hover_info += f"\nVessels: {', '.join(vessels[:3])}"
                    if len(vessels) > 3:
                        hover_info += f" (+{len(vessels)-3} more)"
                        
                hover_row.append(hover_info)
            hover_text.append(hover_row)
            
        # Create color scale
        colors = [
            [0.0, '#2E8B57'],    # Green (Low Risk)
            [0.3, '#FFD700'],    # Yellow (Medium Risk)
            [0.6, '#FF8C00'],    # Orange (High Risk)  
            [1.0, '#DC143C']     # Red (Critical Risk)
        ]
        
        # Create figure
        fig = go.Figure(data=go.Heatmap(
            z=z_data,
            x=self.risk_matrix['probability_levels'],
            y=self.risk_matrix['severity_levels'][::-1],  # Reverse for proper display
            text=[[f"Level {int(z_data[i][j])}<br>{int(self.risk_matrix['matrix'][i][j])} vessels" 
                   for j in range(5)] for i in range(5)],
            texttemplate="%{text}",
            textfont={"size": 10, "color": "white"},
            hovertext=hover_text,
            hovertemplate="%{hovertext}<extra></extra>",
            colorscale=colors,
            colorbar=dict(
                title="Risk Level",
                titleside="right"
            )
        ))
        
        fig.update_layout(
            title={
                'text': "5×5 Maritime Risk Assessment Matrix",
                'x': 0.5,
                'xanchor': 'center',
                'font': {'size': 16, 'color': '#2F4F4F'}
            },
            xaxis_title="Probability",
            yaxis_title="Severity",
            width=800,
            height=600,
            font=dict(size=12),
            plot_bgcolor='white'
        )
        
        if save_path:
            fig.write_html(save_path)
            
        return fig
        
    def simulateScenario(self, scenario_name: str, parameters: Dict) -> Dict:
        """
        Run risk mitigation scenario simulations.
        
        Available scenarios:
        - training_impact: Model 20% reduction in H factor
        - maintenance_improvement: Improve age factor through maintenance
        - flag_change: Change flag state risk profile
        
        Returns:
            Dict with before/after risk analysis and recommendations
        """
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
                            'risk_category': self._get_risk_category(new_risk_score),
                            'factors': {
                                'age_factor': a_factor,
                                'history_factor': modified_h,
                                'mou_factor': m_factor
                            }
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
                            'risk_category': self._get_risk_category(new_risk_score),
                            'factors': {
                                'age_factor': modified_a,
                                'history_factor': h_factor,
                                'mou_factor': m_factor
                            }
                        }
                        
            # Calculate impact analysis
            total_reduction = 0
            vessels_improved = 0
            category_changes = {'improved': 0, 'unchanged': 0, 'worsened': 0}
            
            for vessel in vessels:
                if vessel in baseline_scores and vessel in modified_scores:
                    baseline_score = baseline_scores[vessel]['risk_score']
                    modified_score = modified_scores[vessel]['risk_score']
                    
                    reduction = baseline_score - modified_score
                    total_reduction += reduction
                    
                    if reduction > 0:
                        vessels_improved += 1
                        
                    baseline_cat = baseline_scores[vessel]['risk_category']
                    modified_cat = modified_scores[vessel]['risk_category']
                    
                    if modified_cat < baseline_cat:  # Improved category
                        category_changes['improved'] += 1
                    elif modified_cat == baseline_cat:
                        category_changes['unchanged'] += 1
                    else:
                        category_changes['worsened'] += 1
                        
                    # Store vessel analysis
                    scenario_results['vessels_analyzed'].append({
                        'vessel_name': vessel,
                        'baseline_score': baseline_score,
                        'modified_score': modified_score,
                        'risk_reduction': reduction,
                        'baseline_category': baseline_cat,
                        'modified_category': modified_cat
                    })
                    
            # Calculate summary statistics
            avg_reduction = total_reduction / len(vessels) if vessels else 0
            improvement_rate = (vessels_improved / len(vessels) * 100) if vessels else 0
            
            scenario_results['summary'] = {
                'total_vessels': len(vessels),
                'vessels_improved': vessels_improved,
                'improvement_rate_pct': round(improvement_rate, 1),
                'average_risk_reduction': round(avg_reduction, 2),
                'total_risk_reduction': round(total_reduction, 2),
                'category_changes': category_changes,
                'roi_estimate': self._calculate_scenario_roi(scenario_name, parameters, avg_reduction)
            }
            
        except Exception as e:
            scenario_results['error'] = str(e)
            
        return scenario_results
        
    def _calculate_scenario_roi(self, scenario: str, params: Dict, risk_reduction: float) -> Dict:
        """Calculate return on investment for risk mitigation scenarios."""
        cost_estimates = {
            'training_impact': 50000,      # $50K for crew training program
            'maintenance_improvement': 200000,  # $200K for enhanced maintenance
            'flag_change': 25000          # $25K for flag change process
        }
        
        # Estimate cost savings from risk reduction
        # Assume each risk point reduction saves $5K annually in insurance/incidents
        annual_savings = risk_reduction * 5000
        cost = cost_estimates.get(scenario, 100000)
        
        payback_period = cost / annual_savings if annual_savings > 0 else float('inf')
        roi_5_year = ((annual_savings * 5) - cost) / cost * 100 if cost > 0 else 0
        
        return {
            'estimated_cost': cost,
            'annual_savings': round(annual_savings),
            'payback_period_years': round(payback_period, 1),
            'roi_5_year_pct': round(roi_5_year, 1)
        }
        
    def assessVesselRisk(self, vessel_name: str) -> Dict:
        """
        Comprehensive vessel risk assessment with recommendations.
        
        Returns:
            Complete risk profile with actionable insights
        """
        risk_score_data = self.calculateRiskScore(vessel_name)
        
        if 'error' in risk_score_data:
            return risk_score_data
            
        # Generate specific recommendations based on risk factors
        recommendations = self._generate_recommendations(risk_score_data)
        
        # Calculate peer comparison
        peer_comparison = self._calculate_peer_comparison(vessel_name, risk_score_data)
        
        # Predict risk trend
        risk_trend = self._predict_risk_trend(vessel_name)
        
        assessment = {
            **risk_score_data,
            'recommendations': recommendations,
            'peer_comparison': peer_comparison,
            'risk_trend': risk_trend,
            'assessment_date': datetime.now().isoformat()
        }
        
        return assessment
        
    def _generate_recommendations(self, risk_data: Dict) -> List[Dict]:
        """Generate actionable recommendations based on risk factors."""
        recommendations = []
        factors = risk_data['factor_breakdown']
        
        # Age factor recommendations
        if factors['age_factor'] > 70:
            recommendations.append({
                'category': 'Age Management',
                'priority': 'HIGH',
                'action': 'Implement enhanced maintenance program',
                'description': 'Vessel age is a significant risk factor. Enhanced maintenance and condition monitoring recommended.',
                'estimated_impact': '10-15 point risk reduction',
                'timeframe': '3-6 months'
            })
            
        # History factor recommendations  
        if factors['history_factor'] > 60:
            recommendations.append({
                'category': 'Operational Excellence',
                'priority': 'CRITICAL',
                'action': 'Crew training and procedures review',
                'description': 'Historical defect patterns indicate need for improved operational procedures.',
                'estimated_impact': '15-25 point risk reduction',
                'timeframe': '1-3 months'
            })
            
        # MOU factor recommendations
        if factors['mou_factor'] > 60:
            recommendations.append({
                'category': 'Regulatory Compliance',
                'priority': 'MEDIUM', 
                'action': 'Flag state and classification review',
                'description': 'Consider flag state optimization and classification society engagement.',
                'estimated_impact': '5-10 point risk reduction',
                'timeframe': '6-12 months'
            })
            
        # Overall risk recommendations
        risk_score = risk_data['risk_score']
        if risk_score > 75:
            recommendations.append({
                'category': 'Emergency Action',
                'priority': 'CRITICAL',
                'action': 'Immediate risk mitigation required',
                'description': 'Vessel presents critical risk. Immediate action required before next voyage.',
                'estimated_impact': 'Essential for continued operation',
                'timeframe': 'Immediate'
            })
            
        return recommendations
        
    def _calculate_peer_comparison(self, vessel_name: str, risk_data: Dict) -> Dict:
        """Compare vessel risk against fleet peers."""
        vessel_info = risk_data['vessel_info']
        vessel_type = vessel_info['vessel_type']
        vessel_age = vessel_info['age_years']
        
        # Find comparable vessels
        peer_risks = []
        for vessel in self.inspection_data['vessel_performance']:
            if vessel['vessel_name'] != vessel_name:
                peer_vessel_info = None
                for v in self.vessel_data['vessels']:
                    if v['vessel_name'] == vessel['vessel_name']:
                        peer_vessel_info = v
                        break
                        
                if peer_vessel_info and peer_vessel_info['vessel_type'] == vessel_type:
                    peer_risk = self.calculateRiskScore(vessel['vessel_name'])
                    if 'error' not in peer_risk:
                        peer_risks.append(peer_risk['risk_score'])
                        
        if peer_risks:
            avg_peer_risk = np.mean(peer_risks)
            percentile = (sum(1 for r in peer_risks if r > risk_data['risk_score']) / len(peer_risks)) * 100
            
            return {
                'peer_count': len(peer_risks),
                'average_peer_risk': round(avg_peer_risk, 1),
                'vessel_percentile': round(percentile, 1),
                'performance_vs_peers': 'Better than Average' if risk_data['risk_score'] < avg_peer_risk else 'Worse than Average'
            }
        else:
            return {'peer_count': 0, 'note': 'No comparable vessels found'}
            
    def _predict_risk_trend(self, vessel_name: str) -> Dict:
        """Predict future risk trend for vessel."""
        # Find vessel performance data
        vessel_perf = None
        for v in self.inspection_data['vessel_performance']:
            if v['vessel_name'] == vessel_name:
                vessel_perf = v
                break
                
        if not vessel_perf:
            return {'trend': 'Unknown', 'confidence': 'Low'}
            
        trend = vessel_perf.get('performance_trend', 'Stable')
        
        # Map performance trend to risk trend prediction
        trend_mapping = {
            'Excellent': {'trend': 'Decreasing', 'confidence': 'High'},
            'Improving': {'trend': 'Decreasing', 'confidence': 'Medium'},
            'Stable': {'trend': 'Stable', 'confidence': 'Medium'},
            'Deteriorating': {'trend': 'Increasing', 'confidence': 'High'},
            'Critical': {'trend': 'Rapidly Increasing', 'confidence': 'High'}
        }
        
        prediction = trend_mapping.get(trend, {'trend': 'Unknown', 'confidence': 'Low'})
        
        # Add time-based aging factor
        vessel_info = None
        for v in self.vessel_data['vessels']:
            if v['vessel_name'] == vessel_name:
                vessel_info = v
                break
                
        if vessel_info and vessel_info['age_years'] > 25:
            if prediction['trend'] in ['Stable', 'Decreasing']:
                prediction['trend'] = 'Slightly Increasing'
                prediction['note'] = 'Age-related risk increase expected over time'
                
        return prediction
        
    def generateFleetReport(self, save_path: str = None) -> Dict:
        """Generate comprehensive fleet risk assessment report."""
        print("🔄 Generating comprehensive fleet risk assessment...")
        
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
        
        # Fleet recommendations
        fleet_recommendations = self._generate_fleet_recommendations(fleet_risks)
        
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
                    'primary_risk_factor': max(v['factor_breakdown'], key=v['factor_breakdown'].get)
                } for v in top_risk_vessels
            ],
            'risk_matrix_summary': {
                'total_vessels_in_matrix': risk_matrix['total_vessels'],
                'high_risk_cells': sum(1 for i in range(5) for j in range(5) if risk_matrix['risk_levels'][i][j] > 15),
                'vessels_in_high_risk': sum(risk_matrix['matrix'][i][j] for i in range(5) for j in range(5) if risk_matrix['risk_levels'][i][j] > 15)
            },
            'fleet_recommendations': fleet_recommendations,
            'vessel_details': fleet_risks
        }
        
        if save_path:
            with open(save_path, 'w') as f:
                json.dump(report, f, indent=2)
            print(f"✅ Fleet report saved to {save_path}")
            
        return report
        
    def _generate_fleet_recommendations(self, fleet_risks: List[Dict]) -> List[Dict]:
        """Generate fleet-level risk management recommendations."""
        recommendations = []
        
        # Analyze overall risk patterns
        high_risk_count = len([v for v in fleet_risks if v['risk_score'] > 50])
        critical_risk_count = len([v for v in fleet_risks if v['risk_score'] > 75])
        
        if critical_risk_count > 0:
            recommendations.append({
                'priority': 'CRITICAL',
                'category': 'Emergency Fleet Management',
                'action': f'Immediate attention required for {critical_risk_count} critical risk vessels',
                'impact': 'Essential for continued safe operations',
                'timeframe': 'Immediate'
            })
            
        # Age-related fleet recommendations
        old_vessels = len([v for v in fleet_risks if v['vessel_info']['age_years'] > 25])
        if old_vessels > len(fleet_risks) * 0.5:
            recommendations.append({
                'priority': 'HIGH',
                'category': 'Fleet Modernization',
                'action': 'Consider fleet renewal strategy for aging vessels',
                'impact': '15-25% fleet risk reduction',
                'timeframe': '2-5 years'
            })
            
        # Training recommendations
        high_defect_vessels = len([v for v in fleet_risks if v['factor_breakdown']['history_factor'] > 60])
        if high_defect_vessels > 0:
            recommendations.append({
                'priority': 'HIGH',
                'category': 'Operational Excellence',
                'action': 'Fleet-wide crew training and procedure standardization',
                'impact': '20-30% deficiency reduction',
                'timeframe': '3-6 months'
            })
            
        return recommendations

def main():
    """Main execution function for maritime risk calculator."""
    try:
        print("🚢 Maritime Risk Calculator - Elite Risk Assessment System")
        print("=" * 60)
        
        # Initialize calculator
        calculator = RiskCalculator_Maritime()
        
        # Example: Calculate risk for a specific vessel
        print("\n📊 Sample Risk Assessment:")
        sample_vessel = "YOUNG SHIN"  # Known high-risk vessel
        risk_assessment = calculator.assessVesselRisk(sample_vessel)
        
        print(f"\nVessel: {risk_assessment['vessel_name']}")
        print(f"Risk Score: {risk_assessment['risk_score']}")
        print(f"Risk Category: {risk_assessment['risk_category']}")
        print(f"Age Factor: {risk_assessment['factor_breakdown']['age_factor']}")
        print(f"History Factor: {risk_assessment['factor_breakdown']['history_factor']}")
        print(f"MOU Factor: {risk_assessment['factor_breakdown']['mou_factor']}")
        
        # Generate risk matrix
        print("\n🔥 Generating Risk Matrix...")
        risk_matrix = calculator.generateRiskMatrix()
        matrix_fig = calculator.visualizeRiskMatrix("risk_matrix.html")
        print("✅ Risk matrix visualization saved as 'risk_matrix.html'")
        
        # Run scenario simulation
        print("\n🎯 Running Training Impact Scenario...")
        scenario_results = calculator.simulateScenario(
            'training_impact', 
            {'defect_reduction': 25, 'vessels': ['YOUNG SHIN', 'HAE SHIN', 'GMT ASTRO']}
        )
        
        print(f"Scenario Impact:")
        print(f"- Vessels Improved: {scenario_results['summary']['vessels_improved']}")
        print(f"- Average Risk Reduction: {scenario_results['summary']['average_risk_reduction']}")
        print(f"- ROI (5-year): {scenario_results['summary']['roi_estimate']['roi_5_year_pct']}%")
        
        # Generate fleet report
        print("\n📋 Generating Fleet Report...")
        fleet_report = calculator.generateFleetReport("fleet_risk_report.json")
        
        print(f"\n🏆 Fleet Risk Summary:")
        print(f"Total Vessels: {fleet_report['fleet_overview']['total_vessels']}")
        print(f"Average Risk Score: {fleet_report['fleet_overview']['average_risk_score']}")
        print(f"High Risk Vessels: {fleet_report['fleet_overview']['high_risk_vessels']}")
        print(f"Critical Risk Vessels: {fleet_report['fleet_overview']['critical_risk_vessels']}")
        
        print("\n✅ Maritime Risk Assessment Complete!")
        print("Files generated: risk_matrix.html, fleet_risk_report.json")
        
        return calculator, fleet_report
        
    except Exception as e:
        print(f"❌ Error in maritime risk calculation: {str(e)}")
        raise

if __name__ == "__main__":
    calculator, report = main()