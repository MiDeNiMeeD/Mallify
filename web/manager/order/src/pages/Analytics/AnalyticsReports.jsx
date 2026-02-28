import React from 'react';
import { FiFileText, FiDownload, FiCalendar } from 'react-icons/fi';
import '../../styles/Dashboard.css';

const AnalyticsReports = () => {
  const reports = [
    { name: 'Weekly Performance Report', date: '2024-02-12', type: 'Weekly', size: '2.4 MB' },
    { name: 'Monthly Revenue Summary', date: '2024-02-01', type: 'Monthly', size: '3.8 MB' },
    { name: 'Driver Performance Analysis', date: '2024-02-10', type: 'Custom', size: '1.9 MB' },
    { name: 'Zone Coverage Report', date: '2024-02-08', type: 'Custom', size: '1.2 MB' }
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Performance Reports</h1>
          <p className="page-subtitle">Generate and view detailed performance reports</p>
        </div>
        <button className="btn btn-primary">
          <FiFileText size={18} />
          Generate Report
        </button>
      </div>

      {/* Report Types */}
      <div className="quick-actions-grid" style={{ marginBottom: '2rem' }}>
        <div className="quick-action-btn">
          <FiCalendar size={32} />
          <span>Daily Report</span>
        </div>
        <div className="quick-action-btn">
          <FiCalendar size={32} />
          <span>Weekly Report</span>
        </div>
        <div className="quick-action-btn">
          <FiCalendar size={32} />
          <span>Monthly Report</span>
        </div>
        <div className="quick-action-btn">
          <FiFileText size={32} />
          <span>Custom Report</span>
        </div>
      </div>

      {/* Saved Reports */}
      <div className="content-card">
        <div className="card-header">
          <h3 className="card-title">Saved Reports</h3>
        </div>
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Report Name</th>
                <th>Type</th>
                <th>Generated Date</th>
                <th>File Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                <tr key={index}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FiFileText size={16} color="var(--primary-orange)" />
                      <span style={{ fontWeight: 600 }}>{report.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="status-badge pending">{report.type}</span>
                  </td>
                  <td>{report.date}</td>
                  <td>{report.size}</td>
                  <td>
                    <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
                      <FiDownload size={14} />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsReports;
