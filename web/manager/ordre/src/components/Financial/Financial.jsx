import React from 'react';
import { mockEarnings } from '../../utils/mockData';

const Financial = () => {
  return (
    <div>
      <h2>Financial Management</h2>
      <p>Driver earnings, payouts, and revenue tracking</p>
      
      <div className="grid grid-3" style={{ marginTop: '2rem' }}>
        <div className="card">
          <h4>Total Earnings</h4>
          <h2 style={{ color: 'var(--primary-purple)', margin: '1rem 0' }}>{mockEarnings.totalEarnings} MAD</h2>
        </div>
        <div className="card">
          <h4>Pending Payouts</h4>
          <h2 style={{ color: 'var(--warning-yellow)', margin: '1rem 0' }}>{mockEarnings.pendingPayouts} MAD</h2>
        </div>
        <div className="card">
          <h4>Paid Out</h4>
          <h2 style={{ color: 'var(--success-green)', margin: '1rem 0' }}>{mockEarnings.paidOut} MAD</h2>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Driver Earnings</h3>
        <table>
          <thead>
            <tr>
              <th>Driver</th>
              <th>Total Earnings</th>
              <th>Pending</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {mockEarnings.driverEarnings.map((earning) => (
              <tr key={earning.driverId}>
                <td>{earning.name}</td>
                <td>{earning.earnings} MAD</td>
                <td>{earning.pending} MAD</td>
                <td>
                  <span className={`badge badge-${earning.status === 'paid' ? 'success' : 'warning'}`}>
                    {earning.status}
                  </span>
                </td>
                <td>
                  {earning.status === 'pending' && (
                    <button className="btn btn-sm btn-success">Approve Payout</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Financial;
