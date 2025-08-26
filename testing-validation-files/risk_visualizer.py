"""
Maritime Risk Visualization Module
Creates visual reports and charts for maritime risk assessment data
"""

import json
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import seaborn as sns
from datetime import datetime
import pandas as pd

class RiskVisualizer:
    """Creates visualizations for maritime risk assessment data."""
    
    def __init__(self, report_path: str = "fleet_risk_assessment.json"):
        """Initialize with risk assessment report data."""
        self.report_path = report_path
        self.report_data = None
        self._load_report()
        
    def _load_report(self):
        """Load risk assessment report data."""
        try:
            with open(self.report_path, 'r') as f:
                self.report_data = json.load(f)
            print(f"SUCCESS: Loaded risk assessment report from {self.report_path}")
        except Exception as e:
            print(f"ERROR: Failed to load report: {str(e)}")
            
    def create_risk_distribution_chart(self, save_path: str = "risk_distribution.png"):
        """Create risk distribution pie chart."""
        if not self.report_data:
            print("ERROR: No report data available")
            return
            
        risk_dist = self.report_data['fleet_overview']['risk_distribution']
        
        # Colors for risk categories
        colors = {
            'LOW': '#28a745',      # Green
            'MEDIUM': '#ffc107',   # Yellow
            'HIGH': '#fd7e14',     # Orange
            'CRITICAL': '#dc3545'  # Red
        }
        
        # Filter out zero values
        filtered_dist = {k: v for k, v in risk_dist.items() if v > 0}
        
        labels = list(filtered_dist.keys())
        sizes = list(filtered_dist.values())
        chart_colors = [colors[label] for label in labels]
        
        # Create pie chart
        plt.figure(figsize=(10, 8))
        wedges, texts, autotexts = plt.pie(sizes, labels=labels, colors=chart_colors, 
                                          autopct='%1.1f%%', startangle=90, textprops={'fontsize': 12})
        
        plt.title('Fleet Risk Distribution', fontsize=16, fontweight='bold', pad=20)
        
        # Add legend with vessel counts
        legend_labels = [f'{label}: {count} vessels' for label, count in filtered_dist.items()]
        plt.legend(wedges, legend_labels, title="Risk Categories", loc="center left", bbox_to_anchor=(1, 0, 0.5, 1))
        
        plt.tight_layout()
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"SUCCESS: Risk distribution chart saved as {save_path}")
        
    def create_risk_matrix_heatmap(self, save_path: str = "risk_matrix_heatmap.png"):
        """Create 5x5 risk matrix heatmap."""
        if not self.report_data or 'risk_matrix' not in self.report_data:
            print("ERROR: No risk matrix data available")
            return
            
        risk_matrix = self.report_data['risk_matrix']
        matrix_data = np.array(risk_matrix['matrix'])
        risk_levels = np.array(risk_matrix['risk_levels'])
        
        # Create figure
        fig, ax = plt.subplots(figsize=(12, 10))
        
        # Create heatmap
        im = ax.imshow(matrix_data, cmap='RdYlGn_r', aspect='equal')
        
        # Set ticks and labels
        ax.set_xticks(np.arange(5))
        ax.set_yticks(np.arange(5))
        ax.set_xticklabels(risk_matrix['probability_levels'], fontsize=12)
        ax.set_yticklabels(risk_matrix['severity_levels'], fontsize=12)
        
        # Rotate the tick labels for better display
        plt.setp(ax.get_xticklabels(), rotation=45, ha="right", rotation_mode="anchor")
        
        # Add text annotations
        for i in range(5):
            for j in range(5):
                vessel_count = int(matrix_data[i, j])
                risk_level = int(risk_levels[i, j])
                
                # Color text based on background
                text_color = 'white' if vessel_count > 0 else 'black'
                
                text = ax.text(j, i, f'{vessel_count} vessels\nRisk Level: {risk_level}', 
                              ha="center", va="center", color=text_color, fontsize=10, fontweight='bold')
        
        # Labels and title
        ax.set_xlabel('Probability →', fontsize=14, fontweight='bold')
        ax.set_ylabel('← Severity', fontsize=14, fontweight='bold')
        ax.set_title('5×5 Maritime Risk Assessment Matrix\nVessel Distribution by Risk Level', 
                    fontsize=16, fontweight='bold', pad=20)
        
        # Add colorbar
        cbar = plt.colorbar(im, ax=ax, shrink=0.8)
        cbar.set_label('Number of Vessels', fontsize=12, fontweight='bold')
        
        plt.tight_layout()
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"SUCCESS: Risk matrix heatmap saved as {save_path}")
        
    def create_vessel_risk_comparison(self, save_path: str = "vessel_risk_comparison.png"):
        """Create vessel risk score comparison chart."""
        if not self.report_data:
            print("ERROR: No report data available")
            return
            
        vessels = self.report_data['vessel_details']
        
        # Sort vessels by risk score
        sorted_vessels = sorted(vessels, key=lambda x: x['risk_score'], reverse=True)
        
        vessel_names = [v['vessel_name'] for v in sorted_vessels]
        risk_scores = [v['risk_score'] for v in sorted_vessels]
        risk_categories = [v['risk_category'] for v in sorted_vessels]
        
        # Color mapping
        color_map = {
            'LOW': '#28a745',
            'MEDIUM': '#ffc107', 
            'HIGH': '#fd7e14',
            'CRITICAL': '#dc3545'
        }
        
        colors = [color_map[cat] for cat in risk_categories]
        
        # Create horizontal bar chart
        plt.figure(figsize=(14, 10))
        bars = plt.barh(vessel_names, risk_scores, color=colors, alpha=0.8, edgecolor='black', linewidth=1)
        
        # Add risk score labels on bars
        for bar, score in zip(bars, risk_scores):
            plt.text(bar.get_width() + 1, bar.get_y() + bar.get_height()/2, 
                    f'{score:.1f}', ha='left', va='center', fontweight='bold', fontsize=10)
        
        # Add risk zone backgrounds
        plt.axvspan(0, 25, alpha=0.1, color='green', label='Low Risk (0-25)')
        plt.axvspan(25, 50, alpha=0.1, color='yellow', label='Medium Risk (26-50)')
        plt.axvspan(50, 75, alpha=0.1, color='orange', label='High Risk (51-75)')
        plt.axvspan(75, 100, alpha=0.1, color='red', label='Critical Risk (76-100)')
        
        plt.xlabel('Risk Score', fontsize=14, fontweight='bold')
        plt.ylabel('Vessel Name', fontsize=14, fontweight='bold')
        plt.title('Fleet Risk Score Comparison\nRisk Algorithm: Age×0.4 + History×0.4 + MOU×0.2', 
                 fontsize=16, fontweight='bold', pad=20)
        
        plt.xlim(0, 100)
        plt.grid(axis='x', alpha=0.3)
        plt.legend(loc='lower right')
        plt.tight_layout()
        
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"SUCCESS: Vessel risk comparison chart saved as {save_path}")
        
    def create_risk_factor_analysis(self, save_path: str = "risk_factor_analysis.png"):
        """Create risk factor breakdown analysis."""
        if not self.report_data:
            print("ERROR: No report data available")
            return
            
        vessels = self.report_data['vessel_details']
        
        # Extract factor data
        vessel_names = [v['vessel_name'] for v in vessels]
        age_factors = [v['factor_breakdown']['age_factor'] for v in vessels]
        history_factors = [v['factor_breakdown']['history_factor'] for v in vessels]
        mou_factors = [v['factor_breakdown']['mou_factor'] for v in vessels]
        
        # Create stacked bar chart
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(16, 12))
        
        # Top chart: Stacked factors
        x = np.arange(len(vessel_names))
        width = 0.6
        
        bars1 = ax1.bar(x, age_factors, width, label='Age Factor (40%)', color='#ff6b6b', alpha=0.8)
        bars2 = ax1.bar(x, history_factors, width, bottom=age_factors, label='History Factor (40%)', color='#4ecdc4', alpha=0.8)
        
        bottom_combined = np.array(age_factors) + np.array(history_factors)
        bars3 = ax1.bar(x, mou_factors, width, bottom=bottom_combined, label='MOU Factor (20%)', color='#45b7d1', alpha=0.8)
        
        ax1.set_xlabel('Vessels', fontsize=12, fontweight='bold')
        ax1.set_ylabel('Factor Scores', fontsize=12, fontweight='bold')
        ax1.set_title('Risk Factor Breakdown by Vessel', fontsize=14, fontweight='bold')
        ax1.set_xticks(x)
        ax1.set_xticklabels(vessel_names, rotation=45, ha='right')
        ax1.legend()
        ax1.grid(axis='y', alpha=0.3)
        ax1.set_ylim(0, 200)
        
        # Bottom chart: Individual factors comparison
        x_pos = np.arange(len(vessel_names))
        bar_width = 0.25
        
        bars1 = ax2.bar(x_pos - bar_width, age_factors, bar_width, label='Age Factor', color='#ff6b6b', alpha=0.8)
        bars2 = ax2.bar(x_pos, history_factors, bar_width, label='History Factor', color='#4ecdc4', alpha=0.8)
        bars3 = ax2.bar(x_pos + bar_width, mou_factors, bar_width, label='MOU Factor', color='#45b7d1', alpha=0.8)
        
        ax2.set_xlabel('Vessels', fontsize=12, fontweight='bold')
        ax2.set_ylabel('Factor Scores', fontsize=12, fontweight='bold')
        ax2.set_title('Individual Risk Factors Comparison', fontsize=14, fontweight='bold')
        ax2.set_xticks(x_pos)
        ax2.set_xticklabels(vessel_names, rotation=45, ha='right')
        ax2.legend()
        ax2.grid(axis='y', alpha=0.3)
        ax2.set_ylim(0, 100)
        
        plt.tight_layout()
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"SUCCESS: Risk factor analysis chart saved as {save_path}")
        
    def create_age_risk_correlation(self, save_path: str = "age_risk_correlation.png"):
        """Create age vs risk score correlation chart."""
        if not self.report_data:
            print("ERROR: No report data available")
            return
            
        vessels = self.report_data['vessel_details']
        
        ages = [v['vessel_info']['age_years'] for v in vessels]
        risk_scores = [v['risk_score'] for v in vessels]
        vessel_names = [v['vessel_name'] for v in vessels]
        vessel_types = [v['vessel_info']['vessel_type'] for v in vessels]
        
        # Create scatter plot
        plt.figure(figsize=(12, 8))
        
        # Color by vessel type
        type_colors = {'PC(T)C': '#ff6b6b', 'Bulk': '#4ecdc4'}
        colors = [type_colors.get(vt, '#45b7d1') for vt in vessel_types]
        
        scatter = plt.scatter(ages, risk_scores, c=colors, s=100, alpha=0.7, edgecolors='black', linewidth=1)
        
        # Add vessel names as labels
        for i, name in enumerate(vessel_names):
            plt.annotate(name, (ages[i], risk_scores[i]), xytext=(5, 5), textcoords='offset points', fontsize=9)
        
        # Add trend line
        z = np.polyfit(ages, risk_scores, 1)
        p = np.poly1d(z)
        plt.plot(ages, p(ages), "r--", alpha=0.8, linewidth=2, label=f'Trend Line (slope: {z[0]:.2f})')
        
        plt.xlabel('Vessel Age (years)', fontsize=14, fontweight='bold')
        plt.ylabel('Risk Score', fontsize=14, fontweight='bold')
        plt.title('Vessel Age vs Risk Score Correlation\nAge Factor Weight: 40% in Risk Formula', 
                 fontsize=16, fontweight='bold', pad=20)
        
        plt.grid(True, alpha=0.3)
        plt.legend(['Trend Line'] + [f'{vt} Vessels' for vt in type_colors.keys()], 
                  loc='upper left')
        
        # Add risk zones
        plt.axhspan(0, 25, alpha=0.1, color='green', label='Low Risk')
        plt.axhspan(25, 50, alpha=0.1, color='yellow', label='Medium Risk')
        plt.axhspan(50, 75, alpha=0.1, color='orange', label='High Risk')
        plt.axhspan(75, 100, alpha=0.1, color='red', label='Critical Risk')
        
        plt.ylim(0, 100)
        plt.tight_layout()
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"SUCCESS: Age-risk correlation chart saved as {save_path}")
        
    def create_comprehensive_dashboard(self, save_path: str = "maritime_risk_dashboard.png"):
        """Create comprehensive risk assessment dashboard."""
        if not self.report_data:
            print("ERROR: No report data available")
            return
            
        # Create subplot layout
        fig = plt.figure(figsize=(20, 16))
        gs = fig.add_gridspec(3, 3, hspace=0.3, wspace=0.3)
        
        # 1. Fleet Overview (top-left)
        ax1 = fig.add_subplot(gs[0, 0])
        overview = self.report_data['fleet_overview']
        
        metrics = ['Total Vessels', 'Avg Risk Score', 'High Risk', 'Critical Risk']
        values = [overview['total_vessels'], 
                 overview['average_risk_score'], 
                 overview['high_risk_vessels'], 
                 overview['critical_risk_vessels']]
        
        bars = ax1.bar(metrics, values, color=['#45b7d1', '#ffc107', '#fd7e14', '#dc3545'], alpha=0.8)
        ax1.set_title('Fleet Overview', fontweight='bold', fontsize=12)
        ax1.set_ylabel('Count/Score')
        
        # Add value labels on bars
        for bar, value in zip(bars, values):
            ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.1, 
                    f'{value:.1f}' if isinstance(value, float) else str(value), 
                    ha='center', va='bottom', fontweight='bold')
        
        # 2. Risk Distribution (top-center)
        ax2 = fig.add_subplot(gs[0, 1])
        risk_dist = overview['risk_distribution']
        filtered_dist = {k: v for k, v in risk_dist.items() if v > 0}
        
        colors = {'LOW': '#28a745', 'MEDIUM': '#ffc107', 'HIGH': '#fd7e14', 'CRITICAL': '#dc3545'}
        chart_colors = [colors[label] for label in filtered_dist.keys()]
        
        wedges, texts = ax2.pie(filtered_dist.values(), labels=filtered_dist.keys(), 
                               colors=chart_colors, autopct='%1.0f%%', startangle=90)
        ax2.set_title('Risk Distribution', fontweight='bold', fontsize=12)
        
        # 3. Top Risk Vessels (top-right)
        ax3 = fig.add_subplot(gs[0, 2])
        top_vessels = self.report_data['top_risk_vessels'][:5]
        
        names = [v['vessel_name'] for v in top_vessels]
        scores = [v['risk_score'] for v in top_vessels]
        categories = [v['risk_category'] for v in top_vessels]
        
        color_map = {'LOW': '#28a745', 'MEDIUM': '#ffc107', 'HIGH': '#fd7e14', 'CRITICAL': '#dc3545'}
        bar_colors = [color_map[cat] for cat in categories]
        
        bars = ax3.barh(names, scores, color=bar_colors, alpha=0.8)
        ax3.set_title('Top 5 Risk Vessels', fontweight='bold', fontsize=12)
        ax3.set_xlabel('Risk Score')
        ax3.set_xlim(0, 100)
        
        # 4. Risk Matrix (middle-left, span 2 cols)
        ax4 = fig.add_subplot(gs[1, :2])
        if 'risk_matrix' in self.report_data:
            risk_matrix = self.report_data['risk_matrix']
            matrix_data = np.array(risk_matrix['matrix'])
            
            im = ax4.imshow(matrix_data, cmap='RdYlGn_r', aspect='equal')
            ax4.set_xticks(np.arange(5))
            ax4.set_yticks(np.arange(5))
            ax4.set_xticklabels(risk_matrix['probability_levels'], fontsize=10)
            ax4.set_yticklabels(risk_matrix['severity_levels'], fontsize=10)
            ax4.set_title('Risk Matrix (5×5)', fontweight='bold', fontsize=12)
            ax4.set_xlabel('Probability →')
            ax4.set_ylabel('← Severity')
            
            # Add vessel count annotations
            for i in range(5):
                for j in range(5):
                    vessel_count = int(matrix_data[i, j])
                    if vessel_count > 0:
                        ax4.text(j, i, str(vessel_count), ha="center", va="center", 
                                color='white', fontweight='bold')
        
        # 5. Age Distribution (middle-right)
        ax5 = fig.add_subplot(gs[1, 2])
        vessels = self.report_data['vessel_details']
        ages = [v['vessel_info']['age_years'] for v in vessels]
        
        ax5.hist(ages, bins=8, color='#4ecdc4', alpha=0.7, edgecolor='black')
        ax5.set_title('Fleet Age Distribution', fontweight='bold', fontsize=12)
        ax5.set_xlabel('Age (years)')
        ax5.set_ylabel('Number of Vessels')
        
        # 6. Risk Factors Summary (bottom, span all cols)
        ax6 = fig.add_subplot(gs[2, :])
        
        vessel_names = [v['vessel_name'] for v in vessels]
        age_factors = [v['factor_breakdown']['age_factor'] for v in vessels]
        history_factors = [v['factor_breakdown']['history_factor'] for v in vessels]
        mou_factors = [v['factor_breakdown']['mou_factor'] for v in vessels]
        
        x = np.arange(len(vessel_names))
        width = 0.25
        
        bars1 = ax6.bar(x - width, age_factors, width, label='Age (40%)', color='#ff6b6b', alpha=0.8)
        bars2 = ax6.bar(x, history_factors, width, label='History (40%)', color='#4ecdc4', alpha=0.8)
        bars3 = ax6.bar(x + width, mou_factors, width, label='MOU (20%)', color='#45b7d1', alpha=0.8)
        
        ax6.set_xlabel('Vessels')
        ax6.set_ylabel('Factor Scores')
        ax6.set_title('Risk Factor Breakdown - Risk Score = Age×0.4 + History×0.4 + MOU×0.2', 
                     fontweight='bold', fontsize=12)
        ax6.set_xticks(x)
        ax6.set_xticklabels(vessel_names, rotation=45, ha='right')
        ax6.legend()
        ax6.grid(axis='y', alpha=0.3)
        ax6.set_ylim(0, 100)
        
        # Main title
        fig.suptitle('Maritime Fleet Risk Assessment Dashboard\nGenerated: ' + 
                    datetime.now().strftime('%Y-%m-%d %H:%M:%S'), 
                    fontsize=20, fontweight='bold', y=0.98)
        
        plt.savefig(save_path, dpi=300, bbox_inches='tight', facecolor='white')
        plt.close()
        
        print(f"SUCCESS: Comprehensive dashboard saved as {save_path}")
        
    def generate_all_visualizations(self):
        """Generate all risk assessment visualizations."""
        print("Generating Maritime Risk Assessment Visualizations...")
        print("=" * 60)
        
        try:
            self.create_risk_distribution_chart()
            self.create_risk_matrix_heatmap()
            self.create_vessel_risk_comparison()
            self.create_risk_factor_analysis()
            self.create_age_risk_correlation()
            self.create_comprehensive_dashboard()
            
            print("\nSUCCESS: All visualizations generated successfully!")
            print("Generated files:")
            print("- risk_distribution.png")
            print("- risk_matrix_heatmap.png") 
            print("- vessel_risk_comparison.png")
            print("- risk_factor_analysis.png")
            print("- age_risk_correlation.png")
            print("- maritime_risk_dashboard.png")
            
        except Exception as e:
            print(f"ERROR: Failed to generate visualizations: {str(e)}")

def main():
    """Main execution function."""
    try:
        print("Maritime Risk Assessment Visualizer")
        print("=" * 40)
        
        # Initialize visualizer
        visualizer = RiskVisualizer()
        
        # Generate all visualizations
        visualizer.generate_all_visualizations()
        
        return visualizer
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        
if __name__ == "__main__":
    visualizer = main()