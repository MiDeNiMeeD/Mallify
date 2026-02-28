import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter } from 'lucide-react';
import '../Dashboard/Dashboard.css';

function Reports() {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('last-month');

  const reports = [
    { name: 'Monthly Sales Report', type: 'sales', date: '2026-02-01', size: '2.3 MB' },
    { name: 'Product Inventory Report', type: 'inventory', date: '2026-02-10', size: '1.8 MB' },
    { name: 'Customer Analytics Report', type: 'customers', date: '2026-02-05', size: '3.1 MB' },
    { name: 'Order Summary Report', type: 'orders', date: '2026-02-12', size: '2.7 MB' },
  ];

  const handleDownload = (reportName) => {
    alert(`Downloading ${reportName}...`);
  };

  const handleGenerate = () => {
    alert(`Generating ${reportType} report for ${dateRange}...`);
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Generate and download detailed business reports</p>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">Generate New Report</h2>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Report Type</label>
              <select 
                className="form-select"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="sales">Sales Report</option>
                <option value="inventory">Inventory Report</option>
                <option value="orders">Order Report</option>
                <option value="customers">Customer Report</option>
                <option value="financial">Financial Report</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date Range</label>
              <select 
                className="form-select"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="today">Today</option>
                <option value="last-week">Last Week</option>
                <option value="last-month">Last Month</option>
                <option value="last-quarter">Last Quarter</option>
                <option value="last-year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Format</label>
              <select className="form-select">
                <option value="pdf">PDF</option>
                <option value="excel">Excel (XLSX)</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>
          <button className="btn-primary" onClick={handleGenerate}>
            <FileText size={18} />
            Generate Report
          </button>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} />
            <h2 className="card-title">Recent Reports</h2>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select className="form-input" style={{ width: 'auto' }}>
              <option value="all">All Types</option>
              <option value="sales">Sales</option>
              <option value="inventory">Inventory</option>
              <option value="orders">Orders</option>
              <option value="customers">Customers</option>
            </select>
          </div>
        </div>
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Report Name</th>
                <th>Type</th>
                <th>Generated Date</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, idx) => (
                <tr key={idx}>
                  <td><strong>{report.name}</strong></td>
                  <td>
                    <span className="status-badge" style={{ textTransform: 'capitalize' }}>
                      {report.type}
                    </span>
                  </td>
                  <td>{new Date(report.date).toLocaleDateString()}</td>
                  <td>{report.size}</td>
                  <td>
                    <button 
                      className="btn-icon"
                      onClick={() => handleDownload(report.name)}
                      title="Download"
                    >
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-2">
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Report Schedule</h2>
          </div>
          <div className="card-body">
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Set up automatic report generation and delivery
            </p>
            <div className="form-group">
              <label className="form-label">Frequency</label>
              <select className="form-select">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Email To</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="your@email.com"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: 'var(--primary-color)'
                }}
              />
              <label style={{ margin: 0 }}>Enable automatic reports</label>
            </div>
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Quick Stats</h2>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--light-bg)', borderRadius: '6px' }}>
                <span>Total Reports Generated</span>
                <strong>124</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--light-bg)', borderRadius: '6px' }}>
                <span>This Month</span>
                <strong>18</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--light-bg)', borderRadius: '6px' }}>
                <span>Last Generated</span>
                <strong>2 hours ago</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
