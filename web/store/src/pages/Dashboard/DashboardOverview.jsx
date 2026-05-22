import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  Users, 
  DollarSign, 
  AlertCircle,
  ArrowUpRight,
  Eye,
  CheckCircle
} from 'lucide-react';
import { 
  FiCalendar, 
  FiDownload, 
  FiRefreshCw, 
  FiArrowUp, 
  FiArrowDown, 
  FiStar, 
  FiClock, 
  FiSearch, 
  FiCreditCard 
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import LoadingState from '../../components/LoadingState';
import '../../styles/base.css';
import '../../styles/list-layout.css';
import './Dashboard.css';

const Sparkline = ({ data = [], color = '#FE4CC2', gradientId }) => {
  if (!data.length) {
    return null;
  }

  const width = 160;
  const height = 70;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = data.length > 1 ? width / (data.length - 1) : width;

  const linePoints = data
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `${linePoints} ${width},${height} 0,${height}`;

  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradientId})`} />
      <polyline points={linePoints} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};

function DashboardOverview() {
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('30');
  const [mainChartMetric, setMainChartMetric] = useState('revenue');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    activeProducts: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState({
    revenue: [],
    orders: [],
    fulfillment: []
  });

  const dateRanges = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' },
    { value: '365', label: 'Last Year' }
  ];

  const metricColors = {
    revenue: { main: '#FE4CC2', light: '#FE4CC2', dark: '#E61FA7' },
    orders: { main: '#3B82F6', light: '#3B82F6', dark: '#2563EB' },
    fulfillment: { main: '#10B981', light: '#10B981', dark: '#059669' },
    products: { main: '#F59E0B', light: '#F59E0B', dark: '#D97706' }
  };

  // Demo data generators
  const generateTrendData = (days, base, variance) => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      data.push({
        date: dateStr,
        value: Math.floor(Math.random() * variance + base)
      });
    }
    return data;
  };

  const fallbackTrends = useMemo(
    () => ({
      revenue: [1200, 1450, 1620, 1780, 2100, 2350],
      orders: [25, 32, 28, 36, 44, 52],
      fulfillment: [68, 72, 75, 78, 82, 88],
    }),
    []
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (authLoading) return;

      let activeUser = user;
      if (!activeUser?.boutiqueList?.length) {
        const refreshed = await refreshUserProfile();
        activeUser = refreshed || activeUser;
      }

      if (!activeUser?.boutiqueList?.length) {
        setError('No boutique found for this user');
        setLoading(false);
        return;
      }

      setError(null);
      try {
        setLoading(true);
        const boutiqueId = activeUser.boutiqueList[0];
        const response = await apiClient.getDashboardStats(boutiqueId);
        
        const days = parseInt(dateRange);
        const revenueData = generateTrendData(days, 1500, 2000);
        const ordersData = generateTrendData(days, 20, 40);
        const fulfillmentData = generateTrendData(days, 60, 30);

        if (response.success) {
          const { data } = response;
          setDashboardStats({
            totalRevenue: data.totalRevenue || 0,
            totalOrders: data.totalOrders || 0,
            pendingOrders: data.pendingOrders || 0,
            completedOrders: data.completedOrders || 0,
            activeProducts: data.activeProducts || 0,
            lowStockProducts: data.lowStockProducts || 0,
          });
          setRecentOrders(data.recentOrders || []);
        }
        setChartData({
          revenue: revenueData,
          orders: ordersData,
          fulfillment: fulfillmentData
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, authLoading, refreshUserProfile, dateRange]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      const days = parseInt(dateRange);
      setChartData({
        revenue: generateTrendData(days, 1500, 2000),
        orders: generateTrendData(days, 20, 40),
        fulfillment: generateTrendData(days, 60, 30)
      });
      setRefreshing(false);
    }, 800);
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      const exportData = {
        dateRange: `${dateRange} days`,
        generatedAt: new Date().toISOString(),
        stats: dashboardStats,
        charts: chartData,
        orders: recentOrders
      };
      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `store-dashboard-${dateRange}days-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setExporting(false);
    }, 1000);
  };

  const formatCurrency = (amount) => {
    return `${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(amount) || 0)} DT`;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      processing: 'info',
      completed: 'success'
    };
    return colors[status] || 'secondary';
  };

  const deriveTrendSeries = (value, fallback) => {
    if (!value || value <= 0) return fallback;
    const slice = fallback.length;
    return Array.from({ length: slice }, (_, index) => {
      const factor = 0.6 + index * 0.08;
      return Math.round((value / slice) * factor) || fallback[index];
    });
  };

  const revenueTrend = deriveTrendSeries(dashboardStats.totalRevenue, fallbackTrends.revenue);
  const orderTrend = deriveTrendSeries(dashboardStats.totalOrders, fallbackTrends.orders);
  const fulfillmentTrend = deriveTrendSeries(dashboardStats.completedOrders, fallbackTrends.fulfillment);

  const getTrendChange = (series) => {
    if (!series || series.length < 2) return 0;
    const first = series[0] || 0;
    const last = series[series.length - 1] || 0;
    if (first === 0) return last > 0 ? 100 : 0;
    return ((last - first) / first) * 100;
  };

  const formatChange = (value) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

  const trendCards = [
    {
      title: 'Revenue Pulse',
      subtitle: 'Gross sales trajectory',
      value: formatCurrency(revenueTrend[revenueTrend.length - 1] || 0),
      change: formatChange(getTrendChange(revenueTrend)),
      changeType: getTrendChange(revenueTrend) >= 0 ? 'positive' : 'negative',
      color: '#FE4CC2',
      gradientId: 'revenueGradient',
      data: revenueTrend,
    },
    {
      title: 'Order Momentum',
      subtitle: 'Volume over time',
      value: `${orderTrend[orderTrend.length - 1] || 0} orders`,
      change: formatChange(getTrendChange(orderTrend)),
      changeType: getTrendChange(orderTrend) >= 0 ? 'positive' : 'negative',
      color: '#3B82F6',
      gradientId: 'ordersGradient',
      data: orderTrend,
    },
    {
      title: 'Fulfillment Rate',
      subtitle: 'Completed vs total',
      value: `${Math.min(100, Math.round(((dashboardStats.completedOrders || 0) / Math.max(dashboardStats.totalOrders || 1, 1)) * 100))}%`,
      change: formatChange(getTrendChange(fulfillmentTrend)),
      changeType: getTrendChange(fulfillmentTrend) >= 0 ? 'positive' : 'negative',
      color: '#10B981',
      gradientId: 'fulfillmentGradient',
      data: fulfillmentTrend,
    },
  ];

  // 8 Stats Cards
  const statsCards = [
    { id: 'revenue', label: 'Total Revenue', value: formatCurrency(dashboardStats.totalRevenue), icon: DollarSign, color: '#FE4CC2', change: '+14.2%', sub: 'vs last period' },
    { id: 'orders', label: 'Total Orders', value: dashboardStats.totalOrders.toLocaleString(), icon: ShoppingBag, color: '#3B82F6', change: '+6.8%', sub: 'throughput increase' },
    { id: 'products', label: 'Active Products', value: dashboardStats.activeProducts.toLocaleString(), icon: Package, color: '#10B981', change: '+3.2%', sub: 'this month' },
    { id: 'pending', label: 'Pending Orders', value: dashboardStats.pendingOrders.toLocaleString(), icon: FiClock, color: '#F59E0B', change: `${dashboardStats.pendingOrders > 0 ? '-' : '+'}${dashboardStats.pendingOrders}`, sub: 'needs attention' },
    { id: 'completed', label: 'Completed Orders', value: dashboardStats.completedOrders.toLocaleString(), icon: CheckCircle, color: '#8B5CF6', change: '+12.5%', sub: 'total completed' },
    { id: 'lowStock', label: 'Low Stock Items', value: dashboardStats.lowStockProducts.toLocaleString(), icon: AlertCircle, color: '#EF4444', change: `${dashboardStats.lowStockProducts > 0 ? '-' : '+'} items`, sub: 'needs restock' },
    { id: 'satisfaction', label: 'Satisfaction', value: '4.7/5.0', icon: FiStar, color: '#F97316', change: '+0.2', sub: 'based on reviews' },
    { id: 'avgOrder', label: 'Avg Order Value', value: dashboardStats.totalOrders > 0 ? formatCurrency(dashboardStats.totalRevenue / dashboardStats.totalOrders) : '0.00 DT', icon: FiCreditCard, color: '#06B6D4', change: '+5.3%', sub: 'per transaction' },
  ];

  const currentColor = metricColors[mainChartMetric] || metricColors.revenue;
  const gradientId = `storeMainBarGradient`;

  // Filter & Pagination for recent orders
  const filteredOrders = recentOrders.filter(o => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (o.orderNumber || '').toLowerCase().includes(term) || 
           (o.userId?.name || o.customer || '').toLowerCase().includes(term);
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  if (loading) {
    return (
      <LoadingState
        title="Loading dashboard"
        message="Pulling live KPIs and latest store signals."
        detail="Aggregating revenue, orders, and fulfillment data…"
        icon={TrendingUp}
      />
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="error-container">
          <AlertCircle size={48} />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Welcome back! Here's what's happening with your store today.</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          
          <button className="btn btn-secondary" onClick={handleRefresh} disabled={refreshing}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', background: 'white', border: '2px solid #E5E7EB', borderRadius: '10px', color: '#374151', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
            <FiRefreshCw size={16} className={refreshing ? 'spinning' : ''} /><span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button className="btn btn-primary" onClick={handleExport} disabled={exporting}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', background: 'linear-gradient(135deg, #FE4CC2, #E61FA7)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
            <FiDownload size={16} /><span>{exporting ? 'Exporting...' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* 8 Stats Cards */}
      <div className="stats-grid">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.id} className="stat-card" style={{ borderTop: `3px solid ${card.color}` }}>
              <div className="stat-card-header">
                <span className="stat-label">{card.label}</span>
                <div className="stat-icon" style={{ background: `${card.color}15`, color: card.color }}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="stat-value" style={{ fontSize: '1.75rem' }}>{card.value}</div>
              <div className={`stat-trend ${card.change.startsWith('+') ? 'positive' : 'negative'}`}>
                {card.change.startsWith('+') ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                {card.change}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Main SVG Chart */}
      <div className="chart-card" style={{ marginBottom: '2rem' }}>
        <div className="chart-card-header" style={{ marginBottom: '1rem' }}>
          <div>
            <p className="chart-eyebrow">Trend Analysis</p>
            <h3>
              {mainChartMetric === 'revenue' && 'Revenue Trend'}
              {mainChartMetric === 'orders' && 'Orders Trend'}
              {mainChartMetric === 'fulfillment' && 'Fulfillment Rate'}
              {mainChartMetric === 'products' && 'Products Trend'}
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div className="metric-selector" style={{ background: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '0.25rem 0.5rem' }}>
              <select value={mainChartMetric} onChange={(e) => setMainChartMetric(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontSize: '0.75rem', fontWeight: 600, outline: 'none', cursor: 'pointer' }}>
                <option value="revenue">Revenue</option>
                <option value="orders">Orders</option>
                <option value="fulfillment">Fulfillment</option>
                <option value="products">Products</option>
              </select>
            </div>
          </div>
        </div>
        <svg viewBox="0 0 1000 200" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '200px' }}>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: currentColor.light, stopOpacity: 0.4 }} />
              <stop offset="100%" style={{ stopColor: currentColor.dark, stopOpacity: 0.02 }} />
            </linearGradient>
            <linearGradient id={`${gradientId}-bar`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: currentColor.light }} />
              <stop offset="100%" style={{ stopColor: currentColor.dark }} />
            </linearGradient>
          </defs>
          {(() => {
            const data = chartData[mainChartMetric] || [];
            if (!data.length) return null;
            const maxValue = Math.max(...data.map(d => d.value), 1);
            const chartHeight = 160;
            const chartWidth = 940;
            const barWidth = Math.min(40, chartWidth / data.length - 8);
            const barSpacing = chartWidth / data.length;

            const formatValue = (val) => {
              if (mainChartMetric === 'revenue') return `$${Math.round(val / 1000)}K`;
              if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
              return Math.round(val);
            };

            const formatBarValue = (val) => {
              if (mainChartMetric === 'revenue') return `${(val / 1000).toFixed(1)}K DT`;
              if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
              return Math.round(val);
            };

            return (
              <>
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                  <g key={i}>
                    <line x1="40" y1={20 + chartHeight * (1 - ratio)} x2={40 + chartWidth} y2={20 + chartHeight * (1 - ratio)} stroke="#F3F4F6" strokeWidth="1" />
                    <text x="35" y={24 + chartHeight * (1 - ratio)} textAnchor="end" fontSize="10" fill="#9CA3AF">{formatValue(maxValue * ratio)}</text>
                  </g>
                ))}
                {data.map((item, i) => {
                  const barHeight = (item.value / maxValue) * chartHeight;
                  const x = 40 + i * barSpacing + (barSpacing - barWidth) / 2;
                  const y = 20 + chartHeight - barHeight;
                  return (
                    <g key={i} className="bar-group">
                      <rect x={x} y={y} width={barWidth} height={barHeight} rx="4" fill={`url(#${gradientId}-bar)`} />
                      <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fontSize="9" fill={currentColor.main} fontWeight="600" className="bar-value-text">{formatBarValue(item.value)}</text>
                      <text x={x + barWidth / 2} y={195} textAnchor="middle" fontSize="10" fill="#6B7280" fontWeight="500">{item.date}</text>
                    </g>
                  );
                })}
              </>
            );
          })()}
        </svg>
      </div>

      {/* Trend Cards */}
      <div className="chart-grid">
        {trendCards.map((card) => (
          <div className="chart-card" key={card.title}>
            <div className="chart-card-header">
              <div>
                <p className="chart-eyebrow">{card.subtitle}</p>
                <h3>{card.title}</h3>
              </div>
              <div className={`chart-change ${card.changeType}`}>{card.change}</div>
            </div>
            <Sparkline data={card.data} color={card.color} gradientId={card.gradientId} />
            <div className="chart-meta">
              <span className="chart-value">{card.value}</span>
              <span className="chart-caption">Last 6 checkpoints</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div className="card-body">
          <div className="quick-actions-grid">
            <button className="quick-action-btn" onClick={() => navigate('/products/add')}>
              <Package size={24} />
              <span>Add Product</span>
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/orders/pending')}>
              <ShoppingBag size={24} />
              <span>Pending Orders ({dashboardStats.pendingOrders})</span>
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/products/inventory')}>
              <AlertCircle size={24} />
              <span>Low Stock ({dashboardStats.lowStockProducts})</span>
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/communication/customers')}>
              <Users size={24} />
              <span>Messages</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="content-card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Recent Orders</h2>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F9FAFB', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
              <FiSearch size={14} color="#9CA3AF" />
              <input type="text" placeholder="Search orders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.8rem', color: '#374151', width: '140px' }} />
            </div>
            <button className="btn-secondary" onClick={() => navigate('/orders')}>
              View All
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
        <div className="card-body">
          {paginatedOrders.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={48} />
              <p>{searchTerm ? 'No orders match your search' : 'No orders yet'}</p>
            </div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                    <tr key={order._id || order.id}>
                      <td><strong>{order.orderNumber || order._id}</strong></td>
                      <td>{order.userId?.name || order.customer || 'N/A'}</td>
                      <td>{order.items?.length || order.items || 0}</td>
                      <td><strong>{formatCurrency(order.totalAmount || order.total || 0)}</strong></td>
                      <td>
                        <span className={`status-badge status-${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt || order.date).toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn-icon" title="View" onClick={() => navigate(`/orders/${order._id || order.id}`)}>
                            <Eye size={16} />
                          </button>
                          {order.status === 'pending' && (
                            <button className="btn-icon" title="Process" onClick={() => navigate(`/orders/${order._id || order.id}`)}>
                              <CheckCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination */}
              {filteredOrders.length > 0 && (
                <div style={{ padding: '1rem 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F3F4F6', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Rows:</span>
                    <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid #E5E7EB', background: '#F9FAFB', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}>
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
                      style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #E5E7EB', background: currentPage === 1 ? '#F9FAFB' : 'white', color: currentPage === 1 ? '#D1D5DB' : '#374151', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>{'<<'}</button>
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                      style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #E5E7EB', background: currentPage === 1 ? '#F9FAFB' : 'white', color: currentPage === 1 ? '#D1D5DB' : '#374151', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>{'<'}</button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                      const page = start + i;
                      if (page > totalPages) return null;
                      return (
                        <button key={page} onClick={() => setCurrentPage(page)}
                          style={{ padding: '0.35rem 0.7rem', borderRadius: '6px', border: page === currentPage ? '1px solid #FE4CC2' : '1px solid #E5E7EB', background: page === currentPage ? '#FE4CC2' : 'white', color: page === currentPage ? 'white' : '#374151', cursor: 'pointer', fontSize: '0.8rem', fontWeight: page === currentPage ? 700 : 500 }}>
                          {page}
                        </button>
                      );
                    })}
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                      style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #E5E7EB', background: currentPage === totalPages ? '#F9FAFB' : 'white', color: currentPage === totalPages ? '#D1D5DB' : '#374151', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>{'>'}</button>
                    <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}
                      style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #E5E7EB', background: currentPage === totalPages ? '#F9FAFB' : 'white', color: currentPage === totalPages ? '#D1D5DB' : '#374151', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>{'>>'}</button>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Page {currentPage} of {totalPages}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;