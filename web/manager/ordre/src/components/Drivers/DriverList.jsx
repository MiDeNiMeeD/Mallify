import React from 'react';
import { mockDrivers } from '../../utils/mockData';
import { FiSearch, FiFilter, FiUserPlus } from 'react-icons/fi';
import './DriverList.css';

const DriverList = () => {
  return (
    <div className="driver-list-page">
      <div className="page-header">
        <div>
          <h2>Driver Management</h2>
          <p className="page-subtitle">Manage all drivers, onboarding, and performance</p>
        </div>
        <button className="btn btn-primary">
          <FiUserPlus />
          Add New Driver
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-box-large">
          <FiSearch />
          <input type="text" placeholder="Search drivers by name, ID, phone..." />
        </div>
        <button className="btn btn-secondary">
          <FiFilter />
          Filters
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Driver</th>
                <th>Status</th>
                <th>Rating</th>
                <th>Deliveries</th>
                <th>Completion Rate</th>
                <th>Earnings</th>
                <th>Zone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockDrivers.map((driver) => (
                <tr key={driver.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={driver.avatar} alt={driver.name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{driver.name}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>{driver.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${driver.status === 'active' ? 'success' : driver.status === 'inactive' ? 'warning' : 'danger'}`}>
                      {driver.status}
                    </span>
                  </td>
                  <td>⭐ {driver.rating}</td>
                  <td>{driver.totalDeliveries}</td>
                  <td>{driver.completionRate}%</td>
                  <td>{driver.earnings} MAD</td>
                  <td>{driver.zone}</td>
                  <td>
                    <button className="btn btn-sm btn-secondary">View</button>
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

export default DriverList;
