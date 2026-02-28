import React from 'react';
import { FiCalendar } from 'react-icons/fi';
import '../../styles/Dashboard.css';

const ScheduleManagement = () => {
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Schedule Management</h1>
          <p className="page-subtitle">Manage delivery schedules and driver shifts</p>
        </div>
      </div>

      <div className="content-card">
        <div className="empty-state">
          <div className="empty-state-icon">
            <FiCalendar />
          </div>
          <div className="empty-state-title">Schedule Management Coming Soon</div>
          <p style={{ maxWidth: '500px', textAlign: 'center', margin: '0 auto' }}>
            The Schedule Management feature requires a scheduling system to be implemented in the Driver Service.
            This feature will allow you to create and manage driver schedules, shifts, and availability.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScheduleManagement;
