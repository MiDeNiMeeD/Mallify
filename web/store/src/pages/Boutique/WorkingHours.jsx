import React, { useEffect, useState } from 'react';
import { Clock, Save, AlertCircle } from 'lucide-react';
import Toast from '../../components/Toast';
import LoadingState from '../../components/LoadingState';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import '../../styles/base.css';
import '../../styles/list-layout.css';
import './Boutique.css';

const HOURS_TEMPLATE = [
  { key: 'monday', day: 'Monday', isOpen: true, open: '09:00', close: '18:00' },
  { key: 'tuesday', day: 'Tuesday', isOpen: true, open: '09:00', close: '18:00' },
  { key: 'wednesday', day: 'Wednesday', isOpen: true, open: '09:00', close: '18:00' },
  { key: 'thursday', day: 'Thursday', isOpen: true, open: '09:00', close: '20:00' },
  { key: 'friday', day: 'Friday', isOpen: true, open: '09:00', close: '20:00' },
  { key: 'saturday', day: 'Saturday', isOpen: true, open: '10:00', close: '17:00' },
  { key: 'sunday', day: 'Sunday', isOpen: false, open: '', close: '' }
];

const normalizeHours = (sourceHours) => {
  if (!sourceHours) {
    return HOURS_TEMPLATE;
  }

  const resolved = Array.isArray(sourceHours)
    ? sourceHours.reduce((map, entry, index) => {
        const key = entry?.key || entry?.day?.toLowerCase() || HOURS_TEMPLATE[index]?.key;
        if (key) {
          map[key] = entry;
        }
        return map;
      }, {})
    : sourceHours;

  return HOURS_TEMPLATE.map((template) => {
    const dayData = resolved?.[template.key] || resolved?.[template.day] || {};
    const rawOpen = dayData.open ?? template.open;
    const rawClose = dayData.close ?? template.close;
    const closedFlag = typeof dayData.closed === 'boolean'
      ? dayData.closed
      : typeof dayData.isOpen === 'boolean'
        ? !dayData.isOpen
        : !(rawOpen && rawClose);
    const isOpen = !closedFlag;

    return {
      ...template,
      isOpen,
      open: isOpen ? rawOpen : '',
      close: isOpen ? rawClose : ''
    };
  });
};

const buildHoursPayload = (hours) => {
  return hours.reduce((acc, entry) => {
    acc[entry.key] = {
      day: entry.day,
      open: entry.isOpen ? entry.open : '',
      close: entry.isOpen ? entry.close : '',
      closed: !entry.isOpen
    };
    return acc;
  }, {});
};

const buildHoursArray = (hours) =>
  hours.map((entry) => ({
    day: entry.day,
    isOpen: entry.isOpen,
    open: entry.isOpen ? entry.open : '',
    close: entry.isOpen ? entry.close : '',
    key: entry.key
  }));

const calculateDurationLabel = (open, close) => {
  if (!open || !close) {
    return null;
  }

  const start = new Date(`1970-01-01T${open}:00`);
  const end = new Date(`1970-01-01T${close}:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  let diffMinutes = (end - start) / (1000 * 60);
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60;
  }

  const hours = Math.floor(diffMinutes / 60);
  const minutes = Math.round(diffMinutes % 60);

  if (!hours && !minutes) {
    return null;
  }

  if (hours && minutes) {
    return `${hours}h ${minutes}m`;
  }

  return hours ? `${hours}h` : `${minutes}m`;
};

function WorkingHours() {
  const { user } = useAuth();
  const [hours, setHours] = useState(HOURS_TEMPLATE);
  const [holidayNotice, setHolidayNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  useEffect(() => {
    const fetchWorkingHours = async () => {
      if (!user?.boutiqueList?.[0]) {
        setError('No boutique found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.getBoutiqueById(user.boutiqueList[0]);
        if (response.success && response.data) {
          const boutique = response.data?.boutique || response.data;
          setHours(normalizeHours(boutique.hours || boutique.workingHours));
          setHolidayNotice(boutique.specialHoursNote || boutique.holidayNotice || '');
        }
      } catch (err) {
        console.error('Error fetching working hours:', err);
        const message = err.message || 'Unable to load working hours';
        setError(message);
        showToast(message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkingHours();
  }, [user]);

  const handleToggle = (dayKey) => {
    setHours((prev) => prev.map((entry) => (
      entry.key === dayKey
        ? { ...entry, isOpen: !entry.isOpen }
        : entry
    )));
  };

  const handleHourChange = (dayKey, field, value) => {
    setHours((prev) => prev.map((entry) => (
      entry.key === dayKey
        ? { ...entry, [field]: value }
        : entry
    )));
  };

  const handleSave = async () => {
    if (!user?.boutiqueList?.[0]) {
      const message = 'No boutique found for this account';
      setError(message);
      showToast(message, 'error');
      return;
    }

    try {
      closeToast();
      setError(null);
      setSaving(true);

      const payload = {
        hours: buildHoursPayload(hours),
        workingHours: buildHoursArray(hours),
        specialHoursNote: holidayNotice,
        holidayNotice: holidayNotice
      };

      const response = await apiClient.updateBoutique(user.boutiqueList[0], payload);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update working hours');
      }

      const updatedBoutique = response.data?.boutique || response.data;
      if (updatedBoutique?.hours || updatedBoutique?.workingHours) {
        setHours(normalizeHours(updatedBoutique.hours || updatedBoutique.workingHours));
      }
      setHolidayNotice(
        updatedBoutique?.specialHoursNote ||
        updatedBoutique?.holidayNotice ||
        holidayNotice
      );
      showToast('Working hours updated successfully!', 'success');
    } catch (err) {
      console.error('Error saving working hours:', err);
      const message = err.message || 'Failed to update working hours';
      setError(message);
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <LoadingState
        title="Loading working hours"
        message="Fetching your boutique schedule from the server."
        detail="Syncing current open and close times…"
        icon={Clock}
      />
    );
  }

  return (
    <div className="dashboard-page">
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={closeToast} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Working Hours</h1>
          <p className="page-subtitle">Set your boutique's operating hours for each day of the week</p>
        </div>
        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{ opacity: saving ? 0.8 : 1 }}
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Hours'}
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
                key={daySchedule.key}
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
                    onChange={() => handleToggle(daySchedule.key)}
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
                    onChange={(e) => handleHourChange(daySchedule.key, 'open', e.target.value)}
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
                    onChange={(e) => handleHourChange(daySchedule.key, 'close', e.target.value)}
                    disabled={!daySchedule.isOpen}
                    style={{ padding: '0.5rem' }}
                  />
                </div>
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {daySchedule.isOpen && calculateDurationLabel(daySchedule.open, daySchedule.close)}
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
              value={holidayNotice}
              onChange={(e) => setHolidayNotice(e.target.value)}
            />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.5rem 0 0' }}>
            Customers will see this note on your storefront whenever they view the schedule.
          </p>
        </div>
      </div>
    </div>
  );
}

export default WorkingHours;
