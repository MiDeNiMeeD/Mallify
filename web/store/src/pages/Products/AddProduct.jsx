import React, { useState } from 'react';
import { Plus, Upload, X } from 'lucide-react';
import '../Dashboard/Dashboard.css';

function AddProduct() {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    comparePrice: '',
    stock: '',
    sku: '',
    description: '',
    status: 'active'
  });

  const [images, setImages] = useState([]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setImages([...images, ...imageUrls]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Product created successfully!');
    // Reset form
    setFormData({
      name: '',
      category: '',
      price: '',
      comparePrice: '',
      stock: '',
      sku: '',
      description: '',
      status: 'active'
    });
    setImages([]);
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Add New Product</h1>
          <p className="page-subtitle">Create a new product listing for your boutique</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <div>
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">Basic Information</h2>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Summer Floral Dress"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select 
                    className="form-select"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Dresses">Dresses</option>
                    <option value="Tops">Tops</option>
                    <option value="Bottoms">Bottoms</option>
                    <option value="Outerwear">Outerwear</option>
                    <option value="Shoes">Shoes</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Bags">Bags</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="6"
                    placeholder="Describe your product in detail..."
                  />
                </div>
              </div>
            </div>

            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">Product Images</h2>
              </div>
              <div className="card-body">
                <div style={{ 
                  border: '2px dashed var(--border-color)', 
                  borderRadius: '8px', 
                  padding: '2rem', 
                  textAlign: 'center',
                  cursor: 'pointer',
                  marginBottom: '1rem'
                }}>
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="image-upload" style={{ cursor: 'pointer' }}>
                    <Upload size={40} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Click to upload product images</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>PNG, JPG up to 5MB each</p>
                  </label>
                </div>
                {images.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {images.map((image, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <img 
                          src={image} 
                          alt={`Product ${index + 1}`}
                          style={{ 
                            width: '100%', 
                            height: '150px', 
                            objectFit: 'cover', 
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)'
                          }} 
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            backgroundColor: 'var(--danger-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">Pricing</h2>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Price *</label>
                  <input
                    type="number"
                    className="form-input"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Compare at Price</label>
                  <input
                    type="number"
                    className="form-input"
                    name="comparePrice"
                    value={formData.comparePrice}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    Show a strike-through price for discounts
                  </p>
                </div>
              </div>
            </div>

            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">Inventory</h2>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">SKU</label>
                  <input
                    type="text"
                    className="form-input"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="e.g., DRS-001-BLK-M"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity *</label>
                  <input
                    type="number"
                    className="form-input"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">Status</h2>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Product Status</label>
                  <select 
                    className="form-select"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    defaultChecked
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: 'var(--primary-color)'
                    }}
                  />
                  <label style={{ margin: 0 }}>Publish to storefront immediately</label>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                <Plus size={18} />
                Create Product
              </button>
              <button type="button" className="btn-secondary" style={{ flex: 1 }}>
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddProduct;
