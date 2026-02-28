import React, { useState, useEffect } from 'react';
import { Clock, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import '../Dashboard/Dashboard.css';

function BoutiqueHours() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hours, setHours] = useState([]);

  useEffect(() => {
    const fetchBoutique = async () => {
      if (!user?.boutiqueList?.[0]) {
        setError('No boutique found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.getBoutiqueById(user.boutiqueList[0]);
        if (response.success && response.data) {
          const workingHours = response.data.workingHours || [];
          // Create default hours if none exist
          if (workingHours.length === 0) {
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            setHours(days.map(day => ({ day, isOpen: true, open: '09:00', close: '17:00' })));
          } else {
            setHours(workingHours);
          }
        }
      } catch (err) {
        console.error('Error fetching boutique:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBoutique();
  }, [user]);

  const handleToggle = (day) => {
    setHours(hours.map(h => 
      h.day === day ? { ...h, isOpen: !h.isOpen } : h
    ));
  };

  const handleHourChange = (day, field, value) => {
    setHours(hours.map(h => 
      h.day === day ? { ...h, [field]: value } : h
    ));
  };

  const handleSave = async () => {
    try {
      const response = await apiClient.updateBoutique(user.boutiqueList[0], {
        workingHours: hours
      });
      
      if (response.success) {
        alert('Working hours updated successfully!');
      }
    } catch (err) {
      alert('Failed to update hours');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading working hours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Working Hours</h1>
          <p className="page-subtitle">Set your boutique's operating hours for each day of the week</p>
        </div>
        <button className="btn-primary" onClick={handleSave}>
          <Save size={18} />
          Save Hours
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="content-card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} />
            <h2 className="card-title">Weekly Schedule</h2>
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {hours.map((daySchedule) => (
              <div 
                key={daySchedule.day}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '150px 1fr 200px 200px 100px',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: 'var(--light-bg)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div>
                  <strong>{daySchedule.day}</strong>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem'
                }}>
                  <input
                    type="checkbox"
                    checked={daySchedule.isOpen}
                    onChange={() => handleToggle(daySchedule.day)}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: 'var(--primary-color)'
                    }}
                  />
                  <label style={{ margin: 0 }}>
                    {daySchedule.isOpen ? 'Open' : 'Closed'}
                  </label>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Opening</label>
                  <input
                    type="time"
                    className="form-input"
                    value={daySchedule.open}
                    onChange={(e) => handleHourChange(daySchedule.day, 'open', e.target.value)}
                    disabled={!daySchedule.isOpen}
                    style={{ padding: '0.5rem' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Closing</label>
                  <input
                    type="time"
                    className="form-input"
                    value={daySchedule.close}
                    onChange={(e) => handleHourChange(daySchedule.day, 'close', e.target.value)}
                    disabled={!daySchedule.isOpen}
                    style={{ padding: '0.5rem' }}
                  />
                </div>
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {daySchedule.isOpen && daySchedule.open && daySchedule.close && (
                    <span>
                      {Math.abs(
                        new Date(`2000-01-01 ${daySchedule.close}`).getHours() - 
                        new Date(`2000-01-01 ${daySchedule.open}`).getHours()
                      )} hours
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">Special Hours & Holidays</h2>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Holiday Notice</label>
            <textarea
              className="form-textarea"
              placeholder="e.g., Closed on December 25th for Christmas"
              rows="3"
            />
          </div>
          <button className="btn-secondary">
            Add Holiday Schedule
          </button>
        </div>
      </div>
    </div>
  );
}

export default BoutiqueHours;
