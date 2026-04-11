import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, Star, Heart, Eye, AlertCircle, MapPin, Phone, Clock, ChevronDown, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import LoadingState from '../../components/LoadingState';
import '../../styles/base.css';
import '../../styles/list-layout.css';
import './Boutique.css';
import '../Products/ProductsList.css';

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
  const { user, loading: authLoading, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [boutique, setBoutique] = useState(null);
  const [products, setProducts] = useState([]);
  const [displayCount, setDisplayCount] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState('featured');
  const [imageIndices, setImageIndices] = useState({});

  useEffect(() => {
    const fetchBoutiqueData = async () => {
      if (authLoading) {
        return;
      }

      let activeUser = user;

      if (!activeUser?.boutiqueList?.length) {
        const refreshed = await refreshUserProfile();
        activeUser = refreshed || activeUser;
      }

      if (!activeUser?.boutiqueList?.[0]) {
        setError('No boutique found');
        setLoading(false);
        return;
      }

      setError(null);

      try {
        setLoading(true);
        const boutiqueId = activeUser.boutiqueList[0];
        
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
  }, [user, authLoading, refreshUserProfile]);
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: boutique?.currency || 'TND'
    }).format(amount);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value || 0);
  };

  const activeProducts = useMemo(
    () => products.filter((product) => product.status === 'active'),
    [products]
  );

  const categoryFilters = useMemo(() => {
    if (!activeProducts.length) {
      return [{ label: 'All', value: 'all', count: 0 }];
    }

    const counts = activeProducts.reduce((acc, product) => {
      const key = product.category?.trim() || 'Uncategorized';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return [
      { label: 'All', value: 'all', count: activeProducts.length },
      ...Object.entries(counts)
        .sort(([, countA], [, countB]) => countB - countA)
        .map(([label, count]) => ({
          label,
          value: label,
          count
        }))
    ];
  }, [activeProducts]);

  const heroHighlights = useMemo(
    () => categoryFilters.filter((filter) => filter.value !== 'all').slice(0, 3),
    [categoryFilters]
  );

  const productInsights = useMemo(() => {
    if (!activeProducts.length) {
      return {
        averagePrice: 0,
        totalInventory: 0,
        lowStock: 0
      };
    }

    const totals = activeProducts.reduce(
      (acc, product) => {
        const price = Number(product.price) || 0;
        const quantity = Number(product.quantity) || 0;
        return {
          priceSum: acc.priceSum + price,
          inventory: acc.inventory + quantity,
          lowStock: acc.lowStock + (quantity > 0 && quantity <= 5 ? 1 : 0)
        };
      },
      { priceSum: 0, inventory: 0, lowStock: 0 }
    );

    return {
      averagePrice: totals.priceSum / activeProducts.length,
      totalInventory: totals.inventory,
      lowStock: totals.lowStock
    };
  }, [activeProducts]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const subset = activeProducts.filter((product) => {
      const resolvedCategory = product.category?.trim() || 'Uncategorized';
      const matchesCategory = selectedCategory === 'all' || resolvedCategory === selectedCategory;
      const matchesSearch =
        !normalizedSearch ||
        product.name?.toLowerCase().includes(normalizedSearch) ||
        product.description?.toLowerCase().includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });

    const sorted = [...subset];

    switch (sortOption) {
      case 'priceAsc':
        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'priceDesc':
        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'newest':
        sorted.sort((a, b) => {
          const aDate = new Date(a.createdAt || 0).getTime();
          const bDate = new Date(b.createdAt || 0).getTime();
          return bDate - aDate;
        });
        break;
      case 'stockDesc':
        sorted.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
        break;
      default:
        sorted.sort((a, b) => {
          const aScore = (a.quantity || 0) <= 5 ? 1 : 0;
          const bScore = (b.quantity || 0) <= 5 ? 1 : 0;
          return bScore - aScore;
        });
    }

    return sorted;
  }, [activeProducts, selectedCategory, searchTerm, sortOption]);

  const displayedProducts = filteredProducts.slice(0, displayCount);
  const hasMore = displayCount < filteredProducts.length;

  useEffect(() => {
    setDisplayCount(12);
  }, [selectedCategory, sortOption, searchTerm]);

  const loadMore = () => {
    setDisplayCount((prev) => Math.min(prev + 12, filteredProducts.length));
  };

  const getActiveImageIndex = (productId, totalImages) => {
    if (!totalImages) {
      return 0;
    }
    const stored = imageIndices[productId] ?? 0;
    return Math.min(Math.max(stored, 0), totalImages - 1);
  };

  const showPrevImage = (productId, totalImages) => {
    if (totalImages <= 1) {
      return;
    }
    setImageIndices((prev) => {
      const current = prev[productId] ?? 0;
      const next = (current - 1 + totalImages) % totalImages;
      return { ...prev, [productId]: next };
    });
  };

  const showNextImage = (productId, totalImages) => {
    if (totalImages <= 1) {
      return;
    }
    setImageIndices((prev) => {
      const current = prev[productId] ?? 0;
      const next = (current + 1) % totalImages;
      return { ...prev, [productId]: next };
    });
  };

  const selectImage = (productId, index) => {
    setImageIndices((prev) => ({
      ...prev,
      [productId]: index
    }));
  };

  const heroImage =
    boutique?.branding?.banner || boutique?.banner || boutique?.images?.[0] || null;

  if (loading) {
    return (
      <LoadingState
        title="Loading boutique"
        message="Fetching storefront profile and featured products."
        detail="Syncing hero media and merchandising data…"
        icon={ShoppingBag}
      />
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
          
          .products-section {
            margin-top: 3rem;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .products-hero {
            position: relative;
            display: grid;
            grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
            gap: 2.5rem;
            padding: 2.75rem;
            border-radius: 24px;
            background: linear-gradient(120deg, #0f172a 0%, #1d4ed8 60%, #2563eb 100%);
            color: white;
            overflow: hidden;
          }

          .products-hero::after {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at top right, rgba(255,255,255,0.15), transparent 55%);
            pointer-events: none;
          }

          .products-hero > * {
            position: relative;
            z-index: 1;
          }

          .products-hero__eyebrow {
            text-transform: uppercase;
            letter-spacing: 0.25rem;
            font-size: 0.75rem;
            color: rgba(255,255,255,0.7);
            margin-bottom: 0.75rem;
          }

          .products-hero__title {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 0.75rem;
            margin-bottom: 0.75rem;
          }

          .products-hero__title h2 {
            font-size: 2.5rem;
            margin: 0;
          }

          .products-hero__count {
            padding: 0.35rem 0.9rem;
            border-radius: 999px;
            background: rgba(255,255,255,0.15);
            font-size: 0.875rem;
            font-weight: 600;
          }

          .products-hero__pills {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            margin-top: 1.25rem;
          }

          .products-hero__pills span {
            padding: 0.45rem 1rem;
            border-radius: 999px;
            border: 1px solid rgba(255,255,255,0.4);
            font-size: 0.875rem;
            color: rgba(255,255,255,0.9);
          }

          .products-hero__stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 1rem;
          }

          .products-hero__stat-card {
            background: rgba(15,23,42,0.25);
            border-radius: 18px;
            padding: 1.5rem;
            border: 1px solid rgba(255,255,255,0.12);
            backdrop-filter: blur(8px);
          }

          .products-hero__stat-card p {
            margin: 0 0 0.4rem 0;
            font-size: 0.85rem;
            color: rgba(255,255,255,0.75);
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }

          .products-hero__stat-card strong {
            display: block;
            font-size: 2rem;
            margin-bottom: 0.35rem;
          }

          .products-hero__stat-card span {
            font-size: 0.85rem;
            color: rgba(255,255,255,0.65);
          }

          .products-toolbar {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            align-items: stretch;
          }

          .products-search {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 0.65rem;
            padding: 0.75rem 1rem;
            border-radius: 999px;
            background: white;
            border: 1px solid #e2e8f0;
            box-shadow: 0 12px 30px rgba(15,23,42,0.06);
          }

          .products-search input {
            flex: 1;
            border: none;
            background: transparent;
            font-size: 0.95rem;
            color: #0f172a;
          }

          .products-search input:focus {
            outline: none;
          }

          .products-sort {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            border-radius: 16px;
            background: white;
            border: 1px solid #e2e8f0;
            box-shadow: 0 12px 30px rgba(15,23,42,0.06);
            position: relative;
            min-width: 220px;
          }

          .products-sort select {
            border: none;
            background: transparent;
            font-weight: 600;
            color: #0f172a;
            font-size: 0.95rem;
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            padding-right: 1.5rem;
            cursor: pointer;
          }

          .products-sort select:focus {
            outline: none;
          }

          .products-sort::after {
            content: '';
            position: absolute;
            right: 1rem;
            top: 50%;
            width: 0.4rem;
            height: 0.4rem;
            border-right: 2px solid #94a3b8;
            border-bottom: 2px solid #94a3b8;
            transform: translateY(-50%) rotate(45deg);
            pointer-events: none;
          }

          .products-filters {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            overflow-x: auto;
            padding-bottom: 0.25rem;
          }

          .filter-chip {
            border: 1px solid #e2e8f0;
            border-radius: 999px;
            background: white;
            padding: 0.45rem 0.95rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: #475569;
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            transition: all 0.2s ease;
            cursor: pointer;
          }

          .filter-chip span {
            color: #94a3b8;
            font-size: 0.75rem;
            font-weight: 500;
          }

          .filter-chip.active {
            background: #0ea5e9;
            border-color: #0ea5e9;
            color: white;
          }

          .filter-chip.active span {
            color: rgba(255,255,255,0.8);
          }

          .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 1.5rem;
          }

          .products-empty {
            border: 2px dashed #cbd5f5;
            border-radius: 18px;
            padding: 3rem 2rem;
            text-align: center;
            background: white;
            color: #475569;
          }

          .product-card {
            background: white;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            overflow: hidden;
            transition: all 0.3s ease;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            box-shadow: 0 10px 25px rgba(15,23,42,0.04);
          }

          .product-card:hover {
            box-shadow: 0 25px 45px rgba(15,23,42,0.12);
            transform: translateY(-4px);
          }

          .product-media {
            position: relative;
            overflow: hidden;
          }

          .product-image {
            width: 100%;
            height: 320px;
            display: block;
            object-fit: cover;
          }

          .product-gallery-nav {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 0.5rem;
            pointer-events: none;
          }

          .product-gallery-nav button {
            pointer-events: auto;
            border: none;
            background: rgba(15,23,42,0.35);
            color: white;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.2s ease;
            backdrop-filter: blur(6px);
          }

          .product-gallery-nav button:hover {
            background: rgba(15,23,42,0.65);
          }

          .product-gallery-dots {
            position: absolute;
            bottom: 1rem;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 0.35rem;
          }

          .product-gallery-dots span {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: rgba(255,255,255,0.35);
          }

          .product-gallery-dots span.active {
            background: white;
          }

          .product-thumb-strip {
            display: flex;
            gap: 0.6rem;
            padding: 0.75rem 1rem;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            overflow-x: auto;
          }

          .product-thumb {
            border: 2px solid transparent;
            border-radius: 12px;
            padding: 0;
            background: none;
            cursor: pointer;
            transition: border 0.2s ease, transform 0.2s ease;
          }

          .product-thumb img {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 10px;
            display: block;
          }

          .product-thumb.active {
            border-color: #0ea5e9;
            transform: translateY(-2px);
          }

          @media (max-width: 1024px) {
            .products-hero {
              grid-template-columns: 1fr;
              padding: 2rem;
            }
          }

          @media (max-width: 640px) {
            .products-search,
            .products-sort {
              width: 100%;
            }

            .product-image {
              height: 260px;
            }
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
          {heroImage ? (
            <ImageWithLoader
              src={heroImage}
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
        <section className="products-section">
          

          <div className="products-toolbar">
            <label className="products-search" htmlFor="products-search-input">
              <Search size={18} color="#64748b" />
              <input
                id="products-search-input"
                type="text"
                placeholder="Search by name or description"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </label>
            <div className="products-sort">
              <Filter size={18} color="#64748b" />
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} aria-label="Sort products">
                <option value="featured">Featured first</option>
                <option value="priceAsc">Price · Low to High</option>
                <option value="priceDesc">Price · High to Low</option>
                <option value="newest">Newest arrivals</option>
                <option value="stockDesc">Stock levels</option>
              </select>
            </div>
          </div>

          <div className="products-filters">
            {categoryFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`filter-chip ${selectedCategory === filter.value ? 'active' : ''}`}
                onClick={() => setSelectedCategory(filter.value)}
              >
                {filter.label}
                <span>{filter.count}</span>
              </button>
            ))}
          </div>

          {displayedProducts.length ? (
            <div className="products-grid">
              {displayedProducts.map((product) => {
                const productImages = Array.isArray(product.images)
                  ? product.images.filter(Boolean)
                  : [];
                const totalImages = productImages.length;
                const hasMultipleImages = totalImages > 1;
                const activeImageIndex = getActiveImageIndex(product._id, totalImages);
                const activeImage = totalImages ? productImages[activeImageIndex] : null;

                return (
                  <article key={product._id} className="product-card">
                    {/* Product Image */}
                    <div className="product-media product-card-media">
                      <div className="primary-media">
                        {activeImage ? (
                          <ImageWithLoader
                            src={activeImage}
                            alt={`${product.name} image ${activeImageIndex + 1}`}
                          />
                        ) : (
                          <div className="primary-media placeholder" style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5f5 100%)'
                          }}>
                            <ShoppingBag size={64} style={{ color: '#94a3b8', opacity: 0.5 }} />
                          </div>
                        )}

                        {hasMultipleImages && (
                          <>
                            <div className="product-gallery-nav">
                              <button
                                type="button"
                                aria-label={`View previous ${product.name} photo`}
                                onClick={() => showPrevImage(product._id, totalImages)}
                              >
                                <ChevronLeft size={18} />
                              </button>
                              <button
                                type="button"
                                aria-label={`View next ${product.name} photo`}
                                onClick={() => showNextImage(product._id, totalImages)}
                              >
                                <ChevronRight size={18} />
                              </button>
                            </div>
                            <div className="product-gallery-dots">
                              {productImages.map((_, index) => (
                                <span
                                  key={`${product._id}-dot-${index}`}
                                  className={index === activeImageIndex ? 'active' : ''}
                                />
                              ))}
                            </div>
                          </>
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
                              background: '#f97316',
                              color: 'white',
                              padding: '0.375rem 0.75rem',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              boxShadow: '0 6px 18px rgba(249, 115, 22, 0.35)'
                            }}>
                              Only {product.quantity} left
                            </div>
                          )}
                          <div style={{ flex: 1 }} />
                          <button
                            style={{
                              background: 'rgba(255,255,255,0.85)',
                              border: 'none',
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 10px 20px rgba(15,23,42,0.15)',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#ef4444';
                              e.currentTarget.querySelector('svg').style.stroke = 'white';
                              e.currentTarget.querySelector('svg').style.fill = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.85)';
                              e.currentTarget.querySelector('svg').style.stroke = '#6b7280';
                              e.currentTarget.querySelector('svg').style.fill = 'none';
                            }}
                          >
                            <Heart size={18} style={{ color: '#6b7280' }} />
                          </button>
                        </div>
                      </div>

                      {hasMultipleImages && (
                        <div className="product-media-strip">
                          {productImages.map((imageUrl, index) => (
                            <button
                              key={`${product._id}-thumb-${index}`}
                              type="button"
                              role="listitem"
                              className={`media-thumb ${index === activeImageIndex ? 'active' : ''}`}
                              onClick={() => selectImage(product._id, index)}
                              aria-label={`Show image ${index + 1} for ${product.name}`}
                            >
                              <img src={imageUrl} alt={`${product.name} thumbnail ${index + 1}`} />
                            </button>
                          ))}
                        </div>
                      )}

                        </div>

                        {/* Product Info */}
                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {product.category && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#0ea5e9',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {product.category}
                        </span>
                      </div>
                    )}
                    
                    <h3 style={{
                      fontSize: '1.05rem',
                      fontWeight: '600',
                      color: '#0f172a',
                      marginBottom: '0.5rem',
                      lineHeight: '1.45'
                    }}>
                      {product.name}
                    </h3>
                    
                    {product.description && (
                      <p style={{
                        fontSize: '0.9rem',
                        color: '#475569',
                        marginBottom: '0.85rem',
                        lineHeight: '1.6',
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
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                        ({product.reviewCount || 0})
                      </span>
                    </div>
                    
                    <div style={{ 
                      marginTop: 'auto',
                      paddingTop: '0.85rem',
                      borderTop: '1px solid #e2e8f0'
                    }}>
                      <div style={{ marginBottom: '0.8rem' }}>
                        <div style={{ 
                          fontSize: '1.5rem', 
                          fontWeight: '700', 
                          color: '#0f172a' 
                        }}>
                          {formatCurrency(product.price)}
                        </div>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <div style={{
                            fontSize: '0.875rem',
                            color: '#94a3b8',
                            textDecoration: 'line-through'
                          }}>
                            {formatCurrency(product.compareAtPrice)}
                          </div>
                        )}
                      </div>
                      <button style={{
                        background: 'linear-gradient(120deg, #0ea5e9, #2563eb)',
                        color: 'white',
                        border: 'none',
                        padding: '0.85rem',
                        borderRadius: '10px',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 12px 25px rgba(14,165,233,0.35)',
                        width: '100%'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 16px 30px rgba(14,165,233,0.45)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 12px 25px rgba(14,165,233,0.35)';
                      }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="products-empty">
              <ShoppingBag size={40} style={{ color: '#94a3b8', marginBottom: '0.5rem' }} />
              <h3 style={{ marginBottom: '0.5rem', color: '#0f172a' }}>No products match your filters</h3>
              <p style={{ margin: 0 }}>Reset your search or choose another category to explore the collection.</p>
            </div>
          )}
        </section>

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
