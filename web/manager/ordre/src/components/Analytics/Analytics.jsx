import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { mockAnalytics } from '../../utils/mockData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Analytics = () => {
  const deliveriesData = {
    labels: mockAnalytics.deliveriesPerDay.map(d => d.date.slice(5)),
    datasets: [{
      label: 'Deliveries',
      data: mockAnalytics.deliveriesPerDay.map(d => d.count),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      tension: 0.4
    }]
  };

  const revenueData = {
    labels: mockAnalytics.revenuePerDay.map(d => d.date.slice(5)),
    datasets: [{
      label: 'Revenue (MAD)',
      data: mockAnalytics.revenuePerDay.map(d => d.revenue),
      backgroundColor: '#8b5cf6'
    }]
  };

  return (
    <div>
      <h2>Analytics & Reports</h2>
      <p>Performance metrics and business intelligence</p>
      
      <div className="grid grid-2" style={{ marginTop: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Deliveries Trend</h3>
          <Line data={deliveriesData} options={{ responsive: true, maintainAspectRatio: true }} />
        </div>
        
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Revenue Trend</h3>
          <Bar data={revenueData} options={{ responsive: true, maintainAspectRatio: true }} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
