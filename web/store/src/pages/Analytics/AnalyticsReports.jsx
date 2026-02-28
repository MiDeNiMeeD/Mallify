import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter } from 'lucide-react';
import '../Dashboard/Dashboard.css';

function AnalyticsReports() {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('last-month');

  const reports = [
    { id: 1, name: 'January Sales Report', type: 'Sales', date: '2026-02-01', format: 'PDF', size: '2.4 MB' },
    { id: 2, name: 'Q4 2025 Revenue Analysis', type: 'Revenue', date: '2026-01-15', format: 'Excel', size: '1.8 MB' },
    { id: 3, name: 'Customer Analytics December', type: 'Customers', date: '2025-12-31', format: 'PDF', size: '3.1 MB' },
    { id: 4, name: 'Product Performance Q4', type: 'Products', date: '2025-12-28', format: 'Excel', size: '2.7 MB' },
  ];

  const handleGenerate = (e) => {
    e.preventDefault();
    alert(`Generating ${reportType} report for ${dateRange}...`);
  };

  const handleDownload = (reportName) => {
    alert(`Downloading ${reportName}...`);
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Generate and download detailed analytics reports</p>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} />
            <h2 className="card-title">Generate New Report</h2>
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={handleGenerate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Report Type</label>
                <select 
                  className="form-select"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="sales">Sales Report</option>
                  <option value="revenue">Revenue Analysis</option>
                  <option value="customers">Customer Analytics</option>
                  <option value="products">Product Performance</option>
                  <option value="inventory">Inventory Status</option>
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
                  <option value="yesterday">Yesterday</option>
                  <option value="last-week">Last 7 Days</option>
                  <option value="last-month">Last 30 Days</option>
                  <option value="this-month">This Month</option>
                  <option value="last-quarter">Last Quarter</option>
                  <option value="this-year">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Format</label>
                <select className="form-select">
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel (XLSX)</option>
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary">
              <FileText size={18} />
              Generate Report
            </button>
          </form>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} />
            <h2 className="card-title">Recent Reports</h2>
          </div>
          <button className="btn-secondary">
            <Filter size={18} />
            Filter
          </button>
        </div>
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Report Name</th>
                <th>Type</th>
                <th>Generated Date</th>
                <th>Format</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td><strong>{report.name}</strong></td>
                  <td>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      backgroundColor: 'var(--light-bg)', 
                      borderRadius: '4px',
                      fontSize: '0.875rem'
                    }}>
                      {report.type}
                    </span>
                  </td>
                  <td>{new Date(report.date).toLocaleDateString()}</td>
                  <td>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: report.format === 'PDF' ? 'var(--danger-light)' : 'var(--success-light)',
                      color: report.format === 'PDF' ? 'var(--danger-color)' : 'var(--success-color)',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      {report.format}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{report.size}</td>
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
            <div className="form-group">
              <label className="form-label">Automated Reports</label>
              <select className="form-select">
                <option>No automated reports</option>
                <option>Daily Sales Summary</option>
                <option>Weekly Performance Report</option>
                <option>Monthly Analytics</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="checkbox"
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: 'var(--primary-color)'
                }}
              />
              <label style={{ margin: 0 }}>Email reports automatically</label>
            </div>
            <button className="btn-secondary">Configure Schedule</button>
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Quick Stats</h2>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--light-bg)', borderRadius: '6px' }}>
                <span>Total Reports Generated</span>
                <strong>127</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--light-bg)', borderRadius: '6px' }}>
                <span>This Month</span>
                <strong>8</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--light-bg)', borderRadius: '6px' }}>
                <span>Scheduled Reports</span>
                <strong>3</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsReports;
