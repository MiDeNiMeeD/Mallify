import React, { useState, useEffect } from 'react';
import { ShoppingBag, Star, Heart, Eye, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import '../Dashboard/Dashboard.css';

function MyBoutique() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [boutique, setBoutique] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchBoutiqueData = async () => {
      if (!user?.boutiqueList?.[0]) {
        setError('No boutique found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const boutiqueId = user.boutiqueList[0];
        
        const [boutiqueRes, productsRes] = await Promise.all([
          apiClient.getBoutiqueById(boutiqueId),
          apiClient.getProductsByBoutique(boutiqueId)
        ]);
        
        if (boutiqueRes.success) setBoutique(boutiqueRes.data);
        if (productsRes.success) setProducts(productsRes.data || []);
      } catch (err) {
        console.error('Error fetching boutique data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBoutiqueData();
  }, [user]);
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const activeProducts = products.filter(p => p.status === 'active');

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading boutique...</p>
        </div>
      </div>
    );
  }

  if (!boutique) {
    return (
      <div className="dashboard-page">
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>Boutique not found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Boutique - Customer View</h1>
          <p className="page-subtitle">This is how customers see your store</p>
        </div>
        <button className="btn-secondary">
          <Eye size={18} />
          Preview Mode
        </button>
      </div>

      {/* Banner Section */}
      <div style={{
        background: 'linear-gradient(135deg, #FE4CC2 0%, #E61FA7 100%)',
        borderRadius: '16px',
        padding: '4rem 2rem',
        marginBottom: '2rem',
        textAlign: 'center',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{
            width: '120px',
            height: '120px',
            background: 'white',
            borderRadius: '50%',
            margin: '0 auto 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            fontWeight: 'bold',
            color: '#FE4CC2',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            M
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {boutique.name}
          </h1>
          <p style={{ fontSize: '1.125rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 1.5rem' }}>
            {boutique.description || 'Welcome to our boutique'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star size={20} fill="white" />
              <span>{boutique.rating || '4.8'} Rating</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={20} />
              <span>{activeProducts.length} Products</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Eye size={20} />
              <span>Verified Store</span>
            </div>
          </div>
        </div>
      </div>

      {/* Store Info */}
      <div className="content-card" style={{ marginBottom: '2rem' }}>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                Contact
              </h3>
              <p style={{ margin: '0.25rem 0', color: 'var(--text-primary)' }}>{boutique.phone || 'N/A'}</p>
              <p style={{ margin: '0.25rem 0', color: 'var(--text-primary)' }}>{boutique.ownerId?.email || user.email || 'N/A'}</p>
            </div>
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                Location
              </h3>
              <p style={{ margin: 0, color: 'var(--text-primary)' }}>{boutique.address?.full || boutique.address || 'N/A'}</p>
            </div>
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                Follow Us
              </h3>
              <p style={{ margin: '0.25rem 0', color: 'var(--text-primary)' }}>{boutique.socialMedia?.instagram || 'N/A'}</p>
              <p style={{ margin: '0.25rem 0', color: 'var(--text-primary)' }}>{boutique.socialMedia?.facebook || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
          Featured Products
        </h2>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {activeProducts.map((product) => (
          <div 
            key={product.id}
            style={{
              background: 'white',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
              transition: 'all 0.3s',
              cursor: 'pointer',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Product Image */}
            <div style={{
              height: '280px',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <ShoppingBag size={64} style={{ color: '#9ca3af', opacity: 0.4 }} />
              {product.stock > 0 && product.stock <= 10 && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  background: '#F59E0B',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  Only {product.stock} left
                </div>
              )}
              <button
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'white',
                  border: 'none',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FE4CC2';
                  e.currentTarget.querySelector('svg').style.stroke = 'white';
                  e.currentTarget.querySelector('svg').style.fill = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.querySelector('svg').style.stroke = '#6B7280';
                  e.currentTarget.querySelector('svg').style.fill = 'none';
                }}
              >
                <Heart size={20} style={{ color: '#6B7280' }} />
              </button>
            </div>

            {/* Product Info */}
            <div style={{ padding: '1.25rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#FE4CC2',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {product.category}
                </span>
              </div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '0.5rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {product.name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      fill={star <= 4 ? '#F59E0B' : 'none'}
                      stroke={star <= 4 ? '#F59E0B' : '#D1D5DB'}
                    />
                  ))}
                </div>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  ({product.sales} sold)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#FE4CC2' }}>
                  {formatCurrency(product.price)}
                </div>
                <button style={{
                  background: '#FE4CC2',
                  color: 'white',
                  border: 'none',
                  padding: '0.625rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#E61FA7'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#FE4CC2'}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div style={{
        marginTop: '3rem',
        padding: '3rem 2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Ready to Shop?
        </h2>
        <p style={{ fontSize: '1.125rem', opacity: 0.9, marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Discover our complete collection of premium fashion items and accessories
        </p>
        <button style={{
          background: 'white',
          color: '#667eea',
          border: 'none',
          padding: '1rem 2.5rem',
          borderRadius: '50px',
          fontWeight: '700',
          fontSize: '1rem',
          cursor: 'pointer',
          boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Browse All Products
        </button>
      </div>
    </div>
  );
}

export default MyBoutique;
