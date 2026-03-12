import React, { useState, useEffect } from 'react';
import { ShoppingBag, Star, Heart, Eye, AlertCircle, MapPin, Phone, Mail, Clock, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import '../Dashboard/Dashboard.css';

// Image loader component with skeleton
const ImageWithLoader = ({ src, alt, style = {}, className }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!src) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f3f4f6',
        color: '#9ca3af',
        ...style
      }}>
        <ShoppingBag size={48} />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {!loaded && !error && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          zIndex: 1
        }} />
      )}
      {error ? (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f3f4f6',
          color: '#9ca3af',
          ...style
        }}>
          <ShoppingBag size={48} />
        </div>
      ) : (
        <img
          src={src}
          alt={alt || 'Product image'}
          className={className}
          crossOrigin="anonymous"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            ...style
          }}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
};

function MyBoutique() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [boutique, setBoutique] = useState(null);
  const [products, setProducts] = useState([]);
  const [displayCount, setDisplayCount] = useState(10);

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
        
        if (boutiqueRes.success) {
          const boutiqueData = boutiqueRes.data?.boutique || boutiqueRes.data;
          console.log('Boutique data loaded:', boutiqueData);
          console.log('Boutique logo:', boutiqueData?.logo);
          console.log('Boutique images:', boutiqueData?.images);
          setBoutique(boutiqueData);
        }
        if (productsRes.success) {
          const productsData = productsRes.data;
          console.log('Products response:', productsData);
          if (Array.isArray(productsData)) {
            console.log('Sample product images:', productsData[0]?.images);
            setProducts(productsData);
          } else if (productsData?.products && Array.isArray(productsData.products)) {
            console.log('Sample product images:', productsData.products[0]?.images);
            setProducts(productsData.products);
          } else {
            setProducts([]);
          }
        }
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
      currency: boutique?.currency || 'TND'
    }).format(amount);
  };

  const activeProducts = products.filter(p => p.status === 'active');
  const displayedProducts = activeProducts.slice(0, displayCount);
  const hasMore = displayCount < activeProducts.length;

  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + 10, activeProducts.length));
  };

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
    <>
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          
          .masonry-grid {
            column-count: 4;
            column-gap: 1.5rem;
          }
          
          @media (max-width: 1400px) {
            .masonry-grid { column-count: 3; }
          }
          
          @media (max-width: 1024px) {
            .masonry-grid { column-count: 2; }
          }
          
          @media (max-width: 640px) {
            .masonry-grid { column-count: 1; }
          }
          
          .masonry-item {
            break-inside: avoid;
            margin-bottom: 1.5rem;
          }
          
          .product-card {
            background: white;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            overflow: hidden;
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .product-card:hover {
            box-shadow: 0 20px 40px rgba(0,0,0,0.08);
            transform: translateY(-2px);
          }
          
          .product-image {
            width: 100%;
            height: auto;
            display: block;
            object-fit: cover;
          }
        `}
      </style>
      
      <div className="dashboard-page" style={{ background: '#f9fafb' }}>
        <div className="page-header" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 className="page-title">Boutique Preview</h1>
            <p className="page-subtitle">Customer-facing view of your store</p>
          </div>
          <button className="btn-secondary" style={{ 
            background: '#10b981', 
            color: 'white',
            border: 'none'
          }}>
            <Eye size={18} />
            Live Preview
          </button>
        </div>

        {/* Hero Section with Boutique Images */}
        <div style={{
          position: 'relative',
          height: '400px',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '2rem'
        }}>
          {boutique?.images?.[0] ? (
            <ImageWithLoader
              src={boutique.images[0]}
              alt={boutique.name}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }} />
          )}
          
          {/* Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '3rem'
          }}>
            {/* Logo Section */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2rem' }}>
              {boutique?.logo ? (
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '4px solid white',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  background: 'white',
                  flexShrink: 0
                }}>
                  <ImageWithLoader
                    src={boutique.logo}
                    alt={`${boutique.name} logo`}
                  />
                </div>
              ) : (
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '16px',
                  background: 'white',
                  border: '4px solid white',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  color: '#667eea'
                }}>
                  {boutique?.name?.[0] || 'B'}
                </div>
              )}
              
              <div style={{ flex: 1, color: 'white' }}>
                <h1 style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 'bold', 
                  marginBottom: '0.5rem',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  {boutique?.name}
                </h1>
                <p style={{ 
                  fontSize: '1.125rem', 
                  opacity: 0.95,
                  maxWidth: '800px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}>
                  {boutique?.description}
                </p>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '2rem', 
                  marginTop: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Star size={20} fill="#fbbf24" stroke="#fbbf24" />
                    <span style={{ fontWeight: '600' }}>
                      {boutique?.rating?.toFixed(1) || '5.0'} ({boutique?.reviewCount || 0} reviews)
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShoppingBag size={20} />
                    <span style={{ fontWeight: '600' }}>{activeProducts.length} Products</span>
                  </div>
                  {boutique?.verified && (
                    <div style={{ 
                      background: '#10b981',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <Eye size={16} />
                      Verified Store
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Info Bar */}
        <div className="content-card" style={{ marginBottom: '2rem' }}>
          <div className="card-body">
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '2rem' 
            }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#3b82f6'
                }}>
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: '#6b7280',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Location
                  </h3>
                  <p style={{ margin: 0, color: '#111827', fontWeight: '500', lineHeight: '1.6' }}>
                    {boutique?.address ? (
                      <>
                        {boutique.address.street && <>{boutique.address.street}<br/></>}
                        {boutique.address.city && <>{boutique.address.city}{boutique.address.state && `, ${boutique.address.state}`}<br/></>}
                        {boutique.address.country && <>{boutique.address.country} {boutique.address.postalCode}</>}
                      </>
                    ) : 'Address not available'}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#f0fdf4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981'
                }}>
                  <Phone size={24} />
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: '#6b7280',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Contact
                  </h3>
                  <div style={{ 
                    color: '#111827', 
                    fontWeight: '500',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                  }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Phone</span>
                      <span>{boutique?.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Email</span>
                      <span>{boutique?.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f59e0b'
                }}>
                  <Clock size={24} />
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: '#6b7280',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Hours
                  </h3>
                  <p style={{ margin: 0, color: '#111827', fontWeight: '500' }}>
                    {boutique?.hours?.monday ? 
                      `${boutique.hours.monday.open} - ${boutique.hours.monday.close}` : 
                      '9:00 AM - 6:00 PM'
                    }<br/>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Mon - Fri</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ 
            fontSize: '1.875rem', 
            fontWeight: '700', 
            color: '#111827', 
            marginBottom: '0.5rem' 
          }}>
            Our Products
          </h2>
          <p style={{ color: '#6b7280', fontSize: '1rem' }}>
            Browse our collection of {activeProducts.length} items
          </p>
        </div>

        {/* Masonry Grid */}
        <div className="masonry-grid">
          {displayedProducts.map((product) => (
            <div key={product._id} className="masonry-item">
              <div className="product-card">
                {/* Product Image */}
                <div style={{ position: 'relative' }}>
                  {product.images?.[0] ? (
                    <ImageWithLoader
                      src={product.images[0]}
                      alt={product.name}
                      className="product-image"
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '280px',
                      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ShoppingBag size={64} style={{ color: '#9ca3af', opacity: 0.4 }} />
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    right: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start'
                  }}>
                    {product.quantity > 0 && product.quantity <= 10 && (
                      <div style={{
                        background: '#f59e0b',
                        color: 'white',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}>
                        Only {product.quantity} left
                      </div>
                    )}
                    <div style={{ flex: 1 }} />
                    <button
                      style={{
                        background: 'white',
                        border: 'none',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ef4444';
                        e.currentTarget.querySelector('svg').style.stroke = 'white';
                        e.currentTarget.querySelector('svg').style.fill = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.querySelector('svg').style.stroke = '#6b7280';
                        e.currentTarget.querySelector('svg').style.fill = 'none';
                      }}
                    >
                      <Heart size={18} style={{ color: '#6b7280' }} />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div style={{ padding: '1.25rem' }}>
                  {product.category && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        color: '#3b82f6',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {product.category}
                      </span>
                    </div>
                  )}
                  
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '0.5rem',
                    lineHeight: '1.4'
                  }}>
                    {product.name}
                  </h3>
                  
                  {product.description && (
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      marginBottom: '0.75rem',
                      lineHeight: '1.5',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {product.description}
                    </p>
                  )}
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    marginBottom: '1rem' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          fill={star <= (product.rating || 4) ? '#fbbf24' : 'none'}
                          stroke={star <= (product.rating || 4) ? '#fbbf24' : '#d1d5db'}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      ({product.reviewCount || 0})
                    </span>
                  </div>
                  
                  <div style={{ 
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #f3f4f6'
                  }}>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: '700', 
                        color: '#111827' 
                      }}>
                        {formatCurrency(product.price)}
                      </div>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#9ca3af',
                          textDecoration: 'line-through'
                        }}>
                          {formatCurrency(product.compareAtPrice)}
                        </div>
                      )}
                    </div>
                    <button style={{
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                      width: '100%'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#2563eb';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#3b82f6';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
                    }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginTop: '3rem' 
          }}>
            <button
              onClick={loadMore}
              style={{
                background: 'white',
                color: '#111827',
                border: '2px solid #e5e7eb',
                padding: '1rem 2.5rem',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f9fafb';
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.color = '#3b82f6';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.color = '#111827';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
              }}
            >
              Load More Products
              <ChevronDown size={20} />
            </button>
          </div>
        )}

        {/* Footer CTA */}
        <div style={{
          marginTop: '4rem',
          padding: '3rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
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
            opacity: 0.2
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem' 
            }}>
              Questions About Our Products?
            </h2>
            <p style={{ 
              fontSize: '1.125rem', 
              opacity: 0.95, 
              marginBottom: '2rem', 
              maxWidth: '600px', 
              margin: '0 auto 2rem' 
            }}>
              Our team is here to help you find exactly what you're looking for
            </p>
            <button style={{
              background: 'white',
              color: '#667eea',
              border: 'none',
              padding: '1rem 2.5rem',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
            }}
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default MyBoutique;
