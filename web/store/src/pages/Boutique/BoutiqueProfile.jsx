import React, { useState, useEffect } from 'react';
import { Save, Upload, Store, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import '../Dashboard/Dashboard.css';

function BoutiqueProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    owner: '',
    email: '',
    phone: '',
    address: '',
    description: ''
  });

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
          const boutique = response.data;
          setFormData({
            name: boutique.name || '',
            owner: boutique.ownerId?.name || user.name || '',
            email: user.email || '',
            phone: boutique.phone || '',
            address: boutique.address?.full || boutique.address || '',
            description: boutique.description || ''
          });
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.updateBoutique(user.boutiqueList[0], {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        description: formData.description
      });
      
      if (response.success) {
        alert('Boutique profile updated successfully!');
      }
    } catch (err) {
      alert('Failed to update boutique');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading boutique profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Boutique Profile</h1>
          <p className="page-subtitle">Manage your boutique information and branding</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid-2">
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Basic Information</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Boutique Name *</label>
                <input
                  type="text"
                  className="form-input"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Owner Name *</label>
                <input
                  type="text"
                  className="form-input"
                  name="owner"
                  value={formData.owner}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-input"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input
                  type="tel"
                  className="form-input"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Address *</label>
                <input
                  type="text"
                  className="form-input"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                />
              </div>
              <button type="submit" className="btn-primary">
                <Save size={18} />
                Save Changes
              </button>
            </form>
          </div>
        </div>

        <div>
          <div className="content-card">
            <div className="card-header">
              <h2 className="card-title">Brand Assets</h2>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Logo</label>
                <div style={{ 
                  border: '2px dashed var(--border-color)', 
                  borderRadius: '8px', 
                  padding: '2rem', 
                  textAlign: 'center',
                  cursor: 'pointer'
                }}>
                  <Upload size={40} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Click to upload logo</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>PNG, JPG up to 2MB</p>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Banner Image</label>
                <div style={{ 
                  border: '2px dashed var(--border-color)', 
                  borderRadius: '8px', 
                  padding: '2rem', 
                  textAlign: 'center',
                  cursor: 'pointer'
                }}>
                  <Upload size={40} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Click to upload banner</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>
          </div>

          <div className="content-card">
            <div className="card-header">
              <h2 className="card-title">Social Media</h2>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Website</label>
                <input
                  type="url"
                  className="form-input"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Instagram</label>
                <input
                  type="text"
                  className="form-input"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="@yourboutique"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Facebook</label>
                <input
                  type="text"
                  className="form-input"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  placeholder="YourBoutique"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BoutiqueProfile;
