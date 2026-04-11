import React, { useState, useEffect } from 'react';
import { Save, Upload, Store, AlertCircle, Trash2 } from 'lucide-react';
import Toast from '../../components/Toast';
import LoadingState from '../../components/LoadingState';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import '../../styles/base.css';
import '../../styles/list-layout.css';
import './Boutique.css';

const MAX_BOUTIQUE_IMAGE_SIZE_MB = 5;
const MAX_BOUTIQUE_IMAGE_SIZE_BYTES = MAX_BOUTIQUE_IMAGE_SIZE_MB * 1024 * 1024;

function BoutiqueProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const [formData, setFormData] = useState({
    name: '',
    owner: '',
    email: '',
    phone: '',
    address: '',
    addressDetails: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    description: '',
    website: '',
    instagram: '',
    facebook: '',
    logo: '',
    banner: ''
  });

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  useEffect(() => {
    const fetchBoutique = async () => {
      if (!user?.boutiqueList?.[0]) {
        setError('No boutique found');
        showToast('No boutique found in your account.', 'error');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.getBoutiqueById(user.boutiqueList[0]);
        if (response.success && response.data) {
          const boutique = response.data?.boutique || response.data;
          const resolvedAddress = {
            street: boutique.address?.street || boutique.address?.full || '',
            city: boutique.address?.city || '',
            state: boutique.address?.state || '',
            postalCode: boutique.address?.postalCode || '',
            country: boutique.address?.country || ''
          };

          setFormData((prev) => ({
            ...prev,
            name: boutique.name || '',
            owner: boutique.ownerId?.name || user?.name || '',
            email: user?.email || boutique.contactEmail || '',
            phone: boutique.phone || '',
            address: resolvedAddress.street || boutique.address?.full || boutique.address || '',
            addressDetails: resolvedAddress,
            description: boutique.description || '',
            website: boutique.website || boutique.onlineStoreUrl || '',
            instagram: boutique.social?.instagram || '',
            facebook: boutique.social?.facebook || '',
            logo: boutique.branding?.logo || boutique.logo || '',
            banner: boutique.branding?.banner || boutique.banner || ''
          }));
        }
      } catch (err) {
        console.error('Error fetching boutique:', err);
        setError(err.message || 'Unable to fetch boutique');
        showToast(err.message || 'Unable to fetch boutique', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchBoutique();
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'address') {
      setFormData((prev) => ({
        ...prev,
        address: value,
        addressDetails: {
          ...prev.addressDetails,
          street: value
        }
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressDetailsChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      address: name === 'street' ? value : prev.address,
      addressDetails: {
        ...prev.addressDetails,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user?.boutiqueList?.[0]) {
      setError('No boutique found');
      showToast('No boutique found for this owner.', 'error');
      return;
    }

    try {
      closeToast();
      setError(null);
      const payload = {
        name: formData.name,
        phone: formData.phone,
        description: formData.description,
        website: formData.website,
        social: {
          instagram: formData.instagram,
          facebook: formData.facebook
        },
        logo: formData.logo,
        banner: formData.banner,
        email: formData.email,
        ownerId: user?.boutiqueOwnerId || user?._id,
        status: 'active'
      };

      const normalizedAddress = {
        street: formData.address || formData.addressDetails.street || '',
        city: formData.addressDetails.city || '',
        state: formData.addressDetails.state || '',
        postalCode: formData.addressDetails.postalCode || '',
        country: formData.addressDetails.country || '',
        full: formData.address || ''
      };

      const hasAddressData = Object.values(normalizedAddress).some((value) =>
        typeof value === 'string' ? value.trim() !== '' : Boolean(value)
      );

      if (hasAddressData) {
        payload.address = normalizedAddress;
      }

      const response = await apiClient.updateBoutique(user.boutiqueList[0], payload);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update boutique');
      }

      showToast('Boutique profile updated successfully!', 'success');
      const updatedBoutique = response.data?.boutique || response.data;
      if (updatedBoutique) {
        setFormData((prev) => ({
          ...prev,
          name: updatedBoutique.name ?? prev.name,
          phone: updatedBoutique.phone ?? prev.phone,
          description: updatedBoutique.description ?? prev.description,
          website: updatedBoutique.website ?? prev.website,
          instagram: updatedBoutique.social?.instagram ?? prev.instagram,
          facebook: updatedBoutique.social?.facebook ?? prev.facebook,
          logo: updatedBoutique.branding?.logo || updatedBoutique.logo || prev.logo,
          banner: updatedBoutique.branding?.banner || updatedBoutique.banner || prev.banner,
          addressDetails: updatedBoutique.address ? {
            street: updatedBoutique.address.street || '',
            city: updatedBoutique.address.city || '',
            state: updatedBoutique.address.state || '',
            postalCode: updatedBoutique.address.postalCode || '',
            country: updatedBoutique.address.country || ''
          } : prev.addressDetails,
          address: updatedBoutique.address?.street || updatedBoutique.address?.full || prev.address
        }));
      }
    } catch (err) {
      console.error('Error updating boutique:', err);
      const lowerMessage = err.message?.toLowerCase() || '';
      const friendlyMessage = lowerMessage.includes('entity too large') || lowerMessage.includes('payload too large') || err.name === 'PayloadTooLargeError'
        ? 'Image is too large. Please upload a smaller picture.'
        : err.message || 'Failed to update boutique';
      setError(friendlyMessage);
      showToast(friendlyMessage, 'error');
    }
  };

  const handleImageUpload = async (field, file) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast('Only image files are supported.', 'error');
      return;
    }

    if (file.size > MAX_BOUTIQUE_IMAGE_SIZE_BYTES) {
      showToast(`Image is too large. Please upload a file smaller than ${MAX_BOUTIQUE_IMAGE_SIZE_MB}MB.`, 'error');
      return;
    }

    try {
      const uploadResponse = await apiClient.uploadBoutiqueImages([file]);
      const uploadedImage = uploadResponse?.data?.images?.[0];

      if (!uploadedImage?.url) {
        throw new Error('No uploaded image URL returned from server.');
      }

      setFormData((prev) => ({
        ...prev,
        [field]: uploadedImage.url
      }));
      showToast('Image uploaded successfully.', 'success');
    } catch (err) {
      console.error('Error uploading boutique image:', err);
      showToast(err.message || 'Failed to upload image.', 'error');
    }
  };

  const handleImageRemove = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: ''
    }));
  };

  if (loading) {
    return (
      <LoadingState
        title="Loading boutique profile"
        message="Bringing your store data online. This only takes a moment."
        detail="Fetching the latest boutique details…"
        icon={Store}
      />
    );
  }

  return (
    <div className="dashboard-page">
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={closeToast} />
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
        <div>
          <h1 className="page-title">Boutique Profile</h1>
          <p className="page-subtitle">Manage your boutique information and branding</p>
        </div>
        <button form="boutique-profile-form" type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
          <Save size={18} />
          Save Changes
        </button>
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
            <form id="boutique-profile-form" onSubmit={handleSubmit}>
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
                <label className="form-label">Street Address *</label>
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
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  name="city"
                  value={formData.addressDetails.city}
                  onChange={handleAddressDetailsChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">State / Province</label>
                <input
                  type="text"
                  className="form-input"
                  name="state"
                  value={formData.addressDetails.state}
                  onChange={handleAddressDetailsChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Postal Code</label>
                <input
                  type="text"
                  className="form-input"
                  name="postalCode"
                  value={formData.addressDetails.postalCode}
                  onChange={handleAddressDetailsChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  className="form-input"
                  name="country"
                  value={formData.addressDetails.country}
                  onChange={handleAddressDetailsChange}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {formData.logo ? (
                    <div style={{ position: 'relative', width: '96px', height: '96px' }}>
                      <img
                        src={formData.logo}
                        alt="Logo preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--border-color)' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleImageRemove('logo')}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          border: 'none',
                          background: 'var(--danger-color)',
                          color: '#fff',
                          borderRadius: '999px',
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                        }}
                        aria-label="Remove logo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        border: '2px dashed var(--border-color)',
                        borderRadius: '8px',
                        padding: '2rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        width: '160px'
                      }}
                    >
                      <Upload size={32} style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }} />
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Upload logo</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>PNG/JPG up to 2MB</p>
                    </div>
                  )}
                  <div>
                    <label className="btn-secondary" style={{ cursor: 'pointer' }}>
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(event) => handleImageUpload('logo', event.target.files?.[0])}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Banner Image</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {formData.banner ? (
                    <div style={{ position: 'relative' }}>
                      <img
                        src={formData.banner}
                        alt="Banner preview"
                        style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--border-color)' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleImageRemove('banner')}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          border: 'none',
                          background: 'rgba(0,0,0,0.65)',
                          color: '#fff',
                          borderRadius: '999px',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        aria-label="Remove banner"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        border: '2px dashed var(--border-color)',
                        borderRadius: '8px',
                        padding: '2rem',
                        textAlign: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Upload size={40} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Upload banner</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>PNG/JPG up to 5MB</p>
                    </div>
                  )}
                  <label className="btn-secondary" style={{ width: 'fit-content', cursor: 'pointer' }}>
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(event) => handleImageUpload('banner', event.target.files?.[0])}
                    />
                  </label>
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
