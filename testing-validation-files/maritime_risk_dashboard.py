"""
Maritime Risk Assessment Dashboard

Interactive Streamlit dashboard for comprehensive maritime risk analysis:
- Risk matrix heatmaps with drill-down capabilities
- Vessel-specific risk assessments and recommendations
- Scenario simulation and cost-benefit analysis
- Fleet performance comparison and trend analysis
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
from risk_calculator_maritime import RiskCalculator_Maritime
import json
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Page configuration
st.set_page_config(
    page_title="Maritime Risk Assessment Dashboard",
    page_icon="🚢",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for professional styling
st.markdown("""
<style>
.main-header {
    background: linear-gradient(90deg, #1e3c72 0%, #2a5298 100%);
    color: white;
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 2rem;
    text-align: center;
}

.metric-card {
    background: white;
    padding: 1rem;
    border-radius: 0.5rem;
    border-left: 4px solid #2a5298;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-bottom: 1rem;
}

.risk-low { color: #28a745; font-weight: bold; }
.risk-medium { color: #ffc107; font-weight: bold; }
.risk-high { color: #fd7e14; font-weight: bold; }
.risk-critical { color: #dc3545; font-weight: bold; }

.recommendation-card {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 0.5rem;
    border-left: 4px solid #28a745;
    margin: 0.5rem 0;
}

.critical-alert {
    background: #f8d7da;
    color: #721c24;
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid #f5c6cb;
    margin: 1rem 0;
}
</style>
""", unsafe_allow_html=True)

@st.cache_data
def load_risk_calculator():
    """Load and cache the risk calculator."""
    try:
        calculator = RiskCalculator_Maritime()
        return calculator
    except Exception as e:
        st.error(f"Error loading risk calculator: {str(e)}")
        return None

def format_risk_category(category, score):
    """Format risk category with appropriate color coding."""
    color_map = {
        'LOW': 'risk-low',
        'MEDIUM': 'risk-medium', 
        'HIGH': 'risk-high',
        'CRITICAL': 'risk-critical'
    }
    color_class = color_map.get(category, '')
    return f'<span class="{color_class}">{category} ({score})</span>'

def create_risk_gauge(score, title="Risk Score"):
    """Create a risk gauge visualization."""
    fig = go.Figure(go.Indicator(
        mode="gauge+number+delta",
        value=score,
        domain={'x': [0, 1], 'y': [0, 1]},
        title={'text': title},
        delta={'reference': 50},
        gauge={
            'axis': {'range': [None, 100]},
            'bar': {'color': "darkblue"},
            'steps': [
                {'range': [0, 25], 'color': "#28a745"},    # Green
                {'range': [25, 50], 'color': "#ffc107"},   # Yellow
                {'range': [50, 75], 'color': "#fd7e14"},   # Orange
                {'range': [75, 100], 'color': "#dc3545"}   # Red
            ],
            'threshold': {
                'line': {'color': "red", 'width': 4},
                'thickness': 0.75,
                'value': 75
            }
        }
    ))
    
    fig.update_layout(height=300, margin=dict(t=50, b=0, l=0, r=0))
    return fig

def create_factor_breakdown_chart(factors):
    """Create factor breakdown visualization."""
    factor_names = ['Age Factor', 'History Factor', 'MOU Factor']
    factor_values = [factors['age_factor'], factors['history_factor'], factors['mou_factor']]
    weights = [0.4, 0.4, 0.2]
    
    fig = go.Figure()
    
    # Add bars for each factor
    fig.add_trace(go.Bar(
        name='Risk Factors',
        x=factor_names,
        y=factor_values,
        marker_color=['#ff6b6b', '#4ecdc4', '#45b7d1'],
        text=[f'{v:.1f}<br>(Weight: {w})' for v, w in zip(factor_values, weights)],
        textposition='auto'
    ))
    
    fig.update_layout(
        title='Risk Factor Breakdown',
        xaxis_title='Risk Factors',
        yaxis_title='Factor Score (0-100)',
        yaxis=dict(range=[0, 100]),
        height=400
    )
    
    return fig

def main():
    """Main dashboard application."""
    
    # Header
    st.markdown("""
    <div class="main-header">
        <h1>🚢 Maritime Risk Assessment Dashboard</h1>
        <p>Comprehensive Port State Control Risk Analysis & Management System</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Load risk calculator
    calculator = load_risk_calculator()
    if not calculator:
        st.error("Failed to load risk assessment system. Please check data files.")
        return
    
    # Sidebar for navigation
    st.sidebar.title("Navigation")
    page = st.sidebar.selectbox(
        "Select Analysis Type",
        ["Fleet Overview", "Vessel Assessment", "Risk Matrix", "Scenario Simulation", "Fleet Reports"]
    )
    
    # Fleet Overview Page
    if page == "Fleet Overview":
        st.header("🏭 Fleet Risk Overview")
        
        # Generate fleet metrics
        try:
            fleet_report = calculator.generateFleetReport()
            fleet_overview = fleet_report['fleet_overview']
            
            # Key metrics in columns
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.metric(
                    label="Total Vessels",
                    value=fleet_overview['total_vessels'],
                    delta=None
                )
                
            with col2:
                st.metric(
                    label="Average Risk Score", 
                    value=f"{fleet_overview['average_risk_score']:.1f}",
                    delta=f"{fleet_overview['average_risk_score'] - 50:.1f} vs Target"
                )
                
            with col3:
                st.metric(
                    label="High Risk Vessels",
                    value=fleet_overview['high_risk_vessels'],
                    delta=f"{(fleet_overview['high_risk_vessels']/fleet_overview['total_vessels']*100):.1f}%"
                )
                
            with col4:
                st.metric(
                    label="Critical Risk Vessels",
                    value=fleet_overview['critical_risk_vessels'],
                    delta=f"{(fleet_overview['critical_risk_vessels']/fleet_overview['total_vessels']*100):.1f}%"
                )
            
            # Risk distribution chart
            risk_dist = fleet_overview['risk_distribution']
            
            col1, col2 = st.columns(2)
            
            with col1:
                # Risk distribution pie chart
                fig_pie = px.pie(
                    values=list(risk_dist.values()),
                    names=list(risk_dist.keys()),
                    title="Fleet Risk Distribution",
                    color_discrete_map={
                        'LOW': '#28a745',
                        'MEDIUM': '#ffc107', 
                        'HIGH': '#fd7e14',
                        'CRITICAL': '#dc3545'
                    }
                )
                st.plotly_chart(fig_pie, use_container_width=True)
            
            with col2:
                # Top risk vessels
                st.subheader("🚨 Top Risk Vessels")
                for vessel in fleet_report['top_risk_vessels'][:5]:
                    risk_color = {
                        'LOW': 'risk-low',
                        'MEDIUM': 'risk-medium',
                        'HIGH': 'risk-high', 
                        'CRITICAL': 'risk-critical'
                    }.get(vessel['risk_category'], '')
                    
                    st.markdown(f"""
                    <div class="metric-card">
                        <strong>{vessel['vessel_name']}</strong><br>
                        Risk Score: <span class="{risk_color}">{vessel['risk_score']:.1f}</span><br>
                        Primary Factor: {vessel['primary_risk_factor']}
                    </div>
                    """, unsafe_allow_html=True)
            
            # Fleet recommendations
            if fleet_report['fleet_recommendations']:
                st.subheader("📋 Fleet-Level Recommendations")
                for rec in fleet_report['fleet_recommendations']:
                    priority_color = {
                        'CRITICAL': 'critical-alert',
                        'HIGH': 'recommendation-card',
                        'MEDIUM': 'recommendation-card'
                    }.get(rec['priority'], 'recommendation-card')
                    
                    st.markdown(f"""
                    <div class="{priority_color}">
                        <strong>🎯 {rec['action']}</strong><br>
                        Category: {rec['category']} | Priority: {rec['priority']}<br>
                        Impact: {rec['impact']} | Timeframe: {rec['timeframe']}
                    </div>
                    """, unsafe_allow_html=True)
                    
        except Exception as e:
            st.error(f"Error generating fleet overview: {str(e)}")
    
    # Vessel Assessment Page
    elif page == "Vessel Assessment":
        st.header("🔍 Individual Vessel Risk Assessment")
        
        # Get list of vessels with inspection data
        vessels_with_data = [v['vessel_name'] for v in calculator.inspection_data['vessel_performance']]
        
        selected_vessel = st.selectbox(
            "Select Vessel for Assessment:",
            vessels_with_data,
            index=0
        )
        
        if selected_vessel:
            try:
                # Get comprehensive vessel assessment
                assessment = calculator.assessVesselRisk(selected_vessel)
                
                if 'error' not in assessment:
                    # Main risk score display
                    col1, col2 = st.columns(2)
                    
                    with col1:
                        # Risk gauge
                        gauge_fig = create_risk_gauge(assessment['risk_score'], f"{selected_vessel} Risk Score")
                        st.plotly_chart(gauge_fig, use_container_width=True)
                        
                        # Vessel information
                        st.subheader("Vessel Information")
                        vessel_info = assessment['vessel_info']
                        st.markdown(f"""
                        - **Age:** {vessel_info['age_years']:.1f} years (Built: {vessel_info['built_year']})
                        - **Type:** {vessel_info['vessel_type']}
                        - **Flag State:** {vessel_info['flag_state']}
                        - **Risk Category:** {format_risk_category(assessment['risk_category'], assessment['risk_score'])}
                        """, unsafe_allow_html=True)
                    
                    with col2:
                        # Factor breakdown chart
                        factor_fig = create_factor_breakdown_chart(assessment['factor_breakdown'])
                        st.plotly_chart(factor_fig, use_container_width=True)
                    
                    # Detailed analysis
                    col1, col2 = st.columns(2)
                    
                    with col1:
                        # Risk trend prediction
                        st.subheader("📈 Risk Trend Prediction")
                        trend = assessment['risk_trend']
                        trend_icon = {
                            'Decreasing': '📉',
                            'Stable': '➡️',
                            'Increasing': '📈',
                            'Rapidly Increasing': '🚨'
                        }.get(trend['trend'], '❓')
                        
                        st.markdown(f"""
                        {trend_icon} **{trend['trend']}**  
                        Confidence: {trend['confidence']}  
                        {trend.get('note', '')}
                        """)
                        
                        # Peer comparison
                        if 'peer_comparison' in assessment:
                            st.subheader("👥 Peer Comparison")
                            peer = assessment['peer_comparison']
                            if peer.get('peer_count', 0) > 0:
                                st.markdown(f"""
                                - **Peer Vessels:** {peer['peer_count']}
                                - **Average Peer Risk:** {peer['average_peer_risk']}
                                - **Percentile Rank:** {peer['vessel_percentile']:.0f}%
                                - **Performance:** {peer['performance_vs_peers']}
                                """)
                    
                    with col2:
                        # Recommendations
                        st.subheader("💡 Risk Mitigation Recommendations")
                        for rec in assessment['recommendations']:
                            priority_icon = {
                                'CRITICAL': '🚨',
                                'HIGH': '⚠️',
                                'MEDIUM': '📋'
                            }.get(rec['priority'], '📝')
                            
                            st.markdown(f"""
                            **{priority_icon} {rec['action']}**  
                            *{rec['category']} - {rec['priority']} Priority*  
                            
                            {rec['description']}  
                            
                            💰 **Impact:** {rec['estimated_impact']}  
                            ⏱️ **Timeframe:** {rec['timeframe']}
                            
                            ---
                            """)
                
                else:
                    st.error(f"Error assessing vessel: {assessment['error']}")
                    
            except Exception as e:
                st.error(f"Error in vessel assessment: {str(e)}")
    
    # Risk Matrix Page
    elif page == "Risk Matrix":
        st.header("🔥 5×5 Risk Assessment Matrix")
        
        try:
            # Generate risk matrix
            risk_matrix = calculator.generateRiskMatrix()
            matrix_fig = calculator.visualizeRiskMatrix()
            
            # Display interactive risk matrix
            st.plotly_chart(matrix_fig, use_container_width=True)
            
            # Matrix summary
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.metric(
                    "Total Vessels in Matrix",
                    risk_matrix['total_vessels']
                )
            
            with col2:
                high_risk_cells = sum(1 for i in range(5) for j in range(5) if risk_matrix['risk_levels'][i][j] > 15)
                st.metric(
                    "High Risk Cells (>15)",
                    high_risk_cells
                )
            
            with col3:
                vessels_high_risk = sum(risk_matrix['matrix'][i][j] for i in range(5) for j in range(5) if risk_matrix['risk_levels'][i][j] > 15)
                st.metric(
                    "Vessels in High Risk Cells",
                    int(vessels_high_risk)
                )
            
            # Detailed cell analysis
            st.subheader("📊 Risk Cell Analysis")
            
            # Create detailed matrix table
            matrix_data = []
            for i in range(5):
                for j in range(5):
                    severity = risk_matrix['severity_levels'][i]
                    probability = risk_matrix['probability_levels'][j]
                    risk_level = risk_matrix['risk_levels'][i][j]
                    vessel_count = int(risk_matrix['matrix'][i][j])
                    vessels = risk_matrix['vessel_distribution'].get((i, j), [])
                    
                    if vessel_count > 0:
                        matrix_data.append({
                            'Severity': severity,
                            'Probability': probability,
                            'Risk Level': risk_level,
                            'Vessel Count': vessel_count,
                            'Vessels': ', '.join(vessels) if len(vessels) <= 3 else f"{', '.join(vessels[:3])} (+{len(vessels)-3} more)"
                        })
            
            if matrix_data:
                df_matrix = pd.DataFrame(matrix_data)
                df_matrix = df_matrix.sort_values('Risk Level', ascending=False)
                st.dataframe(df_matrix, use_container_width=True)
                
        except Exception as e:
            st.error(f"Error generating risk matrix: {str(e)}")
    
    # Scenario Simulation Page
    elif page == "Scenario Simulation":
        st.header("🎯 Risk Mitigation Scenario Simulation")
        
        # Scenario selection
        scenario_type = st.selectbox(
            "Select Scenario Type:",
            ["training_impact", "maintenance_improvement", "flag_change"]
        )
        
        # Get vessels for simulation
        vessels_available = [v['vessel_name'] for v in calculator.inspection_data['vessel_performance']]
        
        # Scenario parameters
        st.subheader("Scenario Parameters")
        
        if scenario_type == "training_impact":
            st.markdown("**Training Impact Scenario:** Model the effect of crew training on deficiency reduction")
            
            defect_reduction = st.slider(
                "Expected Deficiency Reduction (%)",
                min_value=5,
                max_value=50,
                value=25,
                step=5
            )
            
            selected_vessels = st.multiselect(
                "Select Vessels for Analysis:",
                vessels_available,
                default=vessels_available[:3]
            )
            
            parameters = {
                'defect_reduction': defect_reduction,
                'vessels': selected_vessels
            }
            
        elif scenario_type == "maintenance_improvement":
            st.markdown("**Maintenance Improvement Scenario:** Model enhanced maintenance programs")
            
            age_risk_reduction = st.slider(
                "Age-Related Risk Reduction (%)",
                min_value=5,
                max_value=30,
                value=15,
                step=5
            )
            
            selected_vessels = st.multiselect(
                "Select Vessels for Analysis:",
                vessels_available,
                default=[v for v in vessels_available if any(vessel['vessel_name'] == v and vessel.get('age_years', 0) > 25 for vessel in calculator.vessel_data['vessels'])][:3]
            )
            
            parameters = {
                'age_risk_reduction': age_risk_reduction,
                'vessels': selected_vessels
            }
        
        # Run simulation
        if st.button("🚀 Run Scenario Simulation"):
            if selected_vessels:
                try:
                    with st.spinner("Running scenario simulation..."):
                        results = calculator.simulateScenario(scenario_type, parameters)
                    
                    if 'error' not in results:
                        # Display results
                        st.success("✅ Scenario simulation completed!")
                        
                        # Summary metrics
                        summary = results['summary']
                        
                        col1, col2, col3, col4 = st.columns(4)
                        
                        with col1:
                            st.metric(
                                "Vessels Improved",
                                summary['vessels_improved'],
                                delta=f"{summary['improvement_rate_pct']:.1f}%"
                            )
                        
                        with col2:
                            st.metric(
                                "Average Risk Reduction",
                                f"{summary['average_risk_reduction']:.1f}",
                                delta="Lower is better"
                            )
                        
                        with col3:
                            st.metric(
                                "Annual Savings",
                                f"${summary['roi_estimate']['annual_savings']:,}",
                                delta=None
                            )
                        
                        with col4:
                            st.metric(
                                "ROI (5-year)",
                                f"{summary['roi_estimate']['roi_5_year_pct']:.1f}%",
                                delta=None
                            )
                        
                        # Detailed vessel analysis
                        st.subheader("📊 Detailed Vessel Impact Analysis")
                        
                        vessel_results = []
                        for vessel_analysis in results['vessels_analyzed']:
                            vessel_results.append({
                                'Vessel': vessel_analysis['vessel_name'],
                                'Current Risk': vessel_analysis['baseline_score'],
                                'Projected Risk': vessel_analysis['modified_score'],
                                'Risk Reduction': vessel_analysis['risk_reduction'],
                                'Current Category': vessel_analysis['baseline_category'],
                                'Projected Category': vessel_analysis['modified_category']
                            })
                        
                        df_results = pd.DataFrame(vessel_results)
                        df_results = df_results.sort_values('Risk Reduction', ascending=False)
                        st.dataframe(df_results, use_container_width=True)
                        
                        # ROI Analysis
                        st.subheader("💰 Return on Investment Analysis")
                        roi_data = summary['roi_estimate']
                        
                        st.markdown(f"""
                        - **Estimated Implementation Cost:** ${roi_data['estimated_cost']:,}
                        - **Annual Risk Savings:** ${roi_data['annual_savings']:,}
                        - **Payback Period:** {roi_data['payback_period_years']:.1f} years
                        - **5-Year ROI:** {roi_data['roi_5_year_pct']:.1f}%
                        """)
                        
                        # Visualization
                        vessel_names = [v['vessel_name'] for v in results['vessels_analyzed']]
                        baseline_scores = [v['baseline_score'] for v in results['vessels_analyzed']]
                        modified_scores = [v['modified_score'] for v in results['vessels_analyzed']]
                        
                        fig = go.Figure()
                        
                        fig.add_trace(go.Bar(
                            name='Current Risk',
                            x=vessel_names,
                            y=baseline_scores,
                            marker_color='#ff6b6b'
                        ))
                        
                        fig.add_trace(go.Bar(
                            name='Projected Risk',
                            x=vessel_names,
                            y=modified_scores,
                            marker_color='#4ecdc4'
                        ))
                        
                        fig.update_layout(
                            title=f'Risk Reduction Impact - {scenario_type.replace("_", " ").title()}',
                            xaxis_title='Vessels',
                            yaxis_title='Risk Score',
                            barmode='group',
                            height=500
                        )
                        
                        st.plotly_chart(fig, use_container_width=True)
                        
                    else:
                        st.error(f"Scenario simulation failed: {results['error']}")
                        
                except Exception as e:
                    st.error(f"Error running scenario simulation: {str(e)}")
            else:
                st.warning("Please select at least one vessel for analysis.")
    
    # Fleet Reports Page
    elif page == "Fleet Reports":
        st.header("📋 Comprehensive Fleet Reports")
        
        if st.button("📊 Generate Complete Fleet Risk Report"):
            try:
                with st.spinner("Generating comprehensive fleet risk report..."):
                    report = calculator.generateFleetReport()
                
                st.success("✅ Fleet report generated successfully!")
                
                # Download options
                col1, col2 = st.columns(2)
                
                with col1:
                    # JSON download
                    json_data = json.dumps(report, indent=2)
                    st.download_button(
                        label="📥 Download JSON Report",
                        data=json_data,
                        file_name=f"fleet_risk_report_{datetime.now().strftime('%Y%m%d_%H%M')}.json",
                        mime="application/json"
                    )
                
                with col2:
                    # CSV download for vessel details
                    vessel_df = pd.DataFrame(report['vessel_details'])
                    csv_data = vessel_df.to_csv(index=False)
                    st.download_button(
                        label="📥 Download CSV Data",
                        data=csv_data,
                        file_name=f"vessel_risk_data_{datetime.now().strftime('%Y%m%d_%H%M')}.csv",
                        mime="text/csv"
                    )
                
                # Report preview
                st.subheader("📖 Report Preview")
                
                # Executive summary
                st.markdown("### Executive Summary")
                overview = report['fleet_overview']
                st.markdown(f"""
                **Fleet Composition:** {overview['total_vessels']} vessels analyzed  
                **Fleet Risk Profile:** {overview['average_risk_score']:.1f} average risk score  
                **High-Risk Vessels:** {overview['high_risk_vessels']} vessels require attention  
                **Critical Alerts:** {overview['critical_risk_vessels']} vessels need immediate action
                """)
                
                # Key findings
                st.markdown("### Key Risk Indicators")
                for vessel in report['top_risk_vessels'][:3]:
                    st.markdown(f"- **{vessel['vessel_name']}:** {vessel['risk_score']} risk score ({vessel['risk_category']})")
                
                # Recommendations summary
                if report['fleet_recommendations']:
                    st.markdown("### Priority Recommendations")
                    for i, rec in enumerate(report['fleet_recommendations'][:3], 1):
                        st.markdown(f"{i}. **{rec['action']}** ({rec['priority']} priority)")
                
            except Exception as e:
                st.error(f"Error generating fleet report: {str(e)}")
    
    # Sidebar information
    st.sidebar.markdown("---")
    st.sidebar.markdown("### About This System")
    st.sidebar.markdown("""
    **Maritime Risk Calculator**  
    Elite risk assessment system for Port State Control compliance.
    
    **Risk Formula:**  
    `Risk = Age×0.4 + History×0.4 + MOU×0.2`
    
    **Data Source:**  
    Processed inspection and vessel data from ETL pipeline.
    
    **Risk Categories:**  
    🟢 LOW (0-25)  
    🟡 MEDIUM (26-50)  
    🟠 HIGH (51-75)  
    🔴 CRITICAL (76-100)
    """)

if __name__ == "__main__":
    main()