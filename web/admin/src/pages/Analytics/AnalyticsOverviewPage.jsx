import React, { useState, useEffect } from 'react';
import { 
  FiTrendingUp, 
  FiUsers, 
  FiShoppingBag, 
  FiDollarSign, 
  FiPackage,
  FiCalendar,
  FiDownload,
  FiRefreshCw,
  FiArrowUp,
  FiArrowDown,
  FiActivity,
  FiBarChart2,
  FiPieChart,
  FiStar,
  FiHeart
} from 'react-icons/fi';
import './AnalyticsOverview.css';

const AnalyticsOverviewPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('20');
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [mainChartMetric, setMainChartMetric] = useState('revenue');
  const [chartData, setChartData] = useState({
    revenue: [],
    users: [],
    orders: [],
    boutiques: [],
    aov: [],
    conversionRate: [],
    activeUsersDaily: [],
    customerSatisfaction: []
  });

  const dateRanges = [
    { value: '7', label: 'Last 7 Days' },
    { value: '20', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' },
    { value: '365', label: 'Last Year' }
  ];

  // Color config for each metric
  const metricColors = {
    revenue: { main: '#7C3AED', light: '#7C3AED', dark: '#5B21B6' },
    orders: { main: '#059669', light: '#059669', dark: '#047857' },
    boutiques: { main: '#2563EB', light: '#2563EB', dark: '#1D4ED8' },
    users: { main: '#D97706', light: '#D97706', dark: '#B45309' },
    aov: { main: '#DC2626', light: '#DC2626', dark: '#B91C1C' },
    conversionRate: { main: '#0891B2', light: '#0891B2', dark: '#0E7490' },
    activeUsersDaily: { main: '#E11D48', light: '#E11D48', dark: '#BE123C' },
    customerSatisfaction: { main: '#8B5CF6', light: '#8B5CF6', dark: '#7C3AED' }
  };

  // Demo data generator
  const generateDemoData = (days) => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Generate realistic looking data with some randomness
      const dayOfWeek = date.getDay();
      const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1;
      
      data.push({
        date: dateStr,
        value: Math.floor((Math.random() * 5000 + 3000) * weekendMultiplier)
      });
    }
    return data;
  };

  const generateUserDemoData = (days) => {
    const data = [];
    let baseUsers = 100;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      baseUsers += Math.floor(Math.random() * 50 + 10);
      data.push({ date: dateStr, value: baseUsers });
    }
    return data;
  };

  const generateAOVData = (days) => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      data.push({ date: dateStr, value: Math.floor(Math.random() * 140 + 120) });
    }
    return data;
  };

  const generateConversionData = (days) => {
    const data = [];
    let base = 3.0;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      base += (Math.random() - 0.5) * 0.3;
      base = Math.max(2.0, Math.min(5.5, base));
      data.push({ date: dateStr, value: parseFloat(base.toFixed(1)) });
    }
    return data;
  };

  const generateActiveUsersData = (days) => {
    const data = [];
    let base = 3000;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      base += Math.floor(Math.random() * 80 - 40);
      base = Math.max(2500, base);
      data.push({ date: dateStr, value: base });
    }
    return data;
  };

  const generateSatisfactionData = (days) => {
    const data = [];
    let base = 4.5;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      base += (Math.random() - 0.5) * 0.2;
      base = Math.max(3.5, Math.min(5.0, base));
      data.push({ date: dateStr, value: parseFloat(base.toFixed(1)) });
    }
    return data;
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const days = parseInt(dateRange);
      
      // Demo data
      const demoAnalytics = {
        users: 24589,
        boutiques: 1247,
        orders: 15890,
        revenue: 2847965,
        avgOrderValue: 179.23,
        newUsersThisMonth: Math.floor(Math.random() * 500 + 1200),
        revenueGrowth: 18.2,
        userGrowth: 12.5,
        activeBoutiques: 1180,
        pendingOrders: 234,
        conversionRate: 3.8,
        customerSatisfaction: 4.7,
        avgSessionDuration: 420,
        bounceRate: 28.5,
        activeUsers: 18234,
        retentionRate: 76.3
      };

      // Generate chart data
      const revenueData = generateDemoData(days);
      const usersData = generateUserDemoData(days);
      
      const ordersData = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        ordersData.push({
          date: dateStr,
          value: Math.floor(Math.random() * 200 + 100)
        });
      }

      setAnalytics(demoAnalytics);
      setChartData({
        revenue: revenueData,
        users: usersData,
        orders: ordersData,
        boutiques: generateDemoData(days).map(d => ({ ...d, value: Math.floor(d.value / 10) })),
        aov: generateAOVData(days),
        conversionRate: generateConversionData(days),
        activeUsersDaily: generateActiveUsersData(days),
        customerSatisfaction: generateSatisfactionData(days)
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalytics(true);
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      const exportData = {
        dateRange: `${dateRange} days`,
        generatedAt: new Date().toISOString(),
        analytics: analytics,
        charts: chartData
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-overview-${dateRange}days-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setExporting(false);
    }, 1000);
  };

  if (loading || !analytics) {
    return (
      <div className="analytics-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  const getGrowthIndicator = (value) => {
    if (value > 0) return { icon: FiArrowUp, color: 'positive', text: `+${value.toFixed(1)}%` };
    if (value < 0) return { icon: FiArrowDown, color: 'negative', text: `${value.toFixed(1)}%` };
    return { icon: FiActivity, color: 'neutral', text: '0%' };
  };

  const revenueGrowth = getGrowthIndicator(analytics.revenueGrowth);
  const userGrowth = getGrowthIndicator(analytics.userGrowth);
  const currentColor = metricColors[mainChartMetric];
  const gradientId = `metricBarGradient-${mainChartMetric}`;

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1><FiTrendingUp /> Analytics Overview</h1>
          <p>Comprehensive platform analytics and insights</p>
        </div>
        <div className="header-actions">
          <div className="date-range-selector">
            <FiCalendar />
            <select 
  value={dateRange} 
  onChange={(e) => setDateRange(e.target.value)}
  disabled={refreshing}
  style={{
    border: "none",
    outline: "none",
    boxShadow: "none",
    background: "transparent",
    appearance: "none",
  }}
>
              {dateRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>
          <button 
            className="btn-action-header"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh data"
          >
            <FiRefreshCw className={refreshing ? 'spinning' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button 
            className="btn-action-header btn-export"
            onClick={handleExport}
            disabled={exporting}
            title="Export data"
          >
            <FiDownload />
            <span>{exporting ? 'Exporting...' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* Main Stats Grid - 6 cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Total Users</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(124, 58, 237, 0.15)', color: '#7C3AED' }}>
              <FiUsers size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.users.toLocaleString()}</div>
            <div className={`admin-stat-change ${userGrowth.color}`}>
              <userGrowth.icon size={14} />
              {userGrowth.text} this period
            </div>
            <div className="admin-stat-sub">+{analytics.newUsersThisMonth} new users</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Boutiques</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#2563EB' }}>
              <FiShoppingBag size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.boutiques.toLocaleString()}</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} />
              +{Math.floor(analytics.boutiques * 0.1)} this period
            </div>
            <div className="admin-stat-sub">{analytics.activeBoutiques} active</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Total Orders</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
              <FiPackage size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.orders.toLocaleString()}</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} />
              +15% vs previous period
            </div>
            <div className="admin-stat-sub">{analytics.pendingOrders} pending</div>
          </div>
        </div>

        <div className="admin-stat-card highlight">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Total Revenue</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF' }}>
              <FiDollarSign size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">${(analytics.revenue / 1000).toFixed(1)}K</div>
            <div className={`admin-stat-change positive`}>
              <revenueGrowth.icon size={14} />
              {revenueGrowth.text} growth
            </div>
            <div className="admin-stat-sub">Avg: ${analytics.avgOrderValue.toFixed(2)}/order</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Conversion Rate</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#D97706' }}>
              <FiStar size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.conversionRate}%</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} />
              +0.5% vs previous
            </div>
            <div className="admin-stat-sub">Above industry avg</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Customer Satisfaction</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#EC4899' }}>
              <FiHeart size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.customerSatisfaction}/5.0</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} />
              +0.2 this period
            </div>
            <div className="admin-stat-sub">Based on 2,450 reviews</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Active Users</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06B6D4' }}>
              <FiActivity size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.activeUsers.toLocaleString()}</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} />
              +8.3% this period
            </div>
            <div className="admin-stat-sub">{((analytics.activeUsers / analytics.users) * 100).toFixed(1)}% of total users</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Retention Rate</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6' }}>
              <FiPieChart size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.retentionRate}%</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} />
              +2.1% vs previous
            </div>
            <div className="admin-stat-sub">30-day retention</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="analytics-charts">
        <div className="chart-card chart-revenue">
          <div className="chart-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {mainChartMetric === 'revenue' && <><FiDollarSign color={currentColor.main} /> Revenue Trend</>}
              {mainChartMetric === 'orders' && <><FiPackage color={currentColor.main} /> Orders Trend</>}
              {mainChartMetric === 'boutiques' && <><FiShoppingBag color={currentColor.main} /> Boutiques Trend</>}
              {mainChartMetric === 'users' && <><FiUsers color={currentColor.main} /> Users Trend</>}
              {mainChartMetric === 'aov' && <><FiBarChart2 color={currentColor.main} /> Avg Order Value</>}
              {mainChartMetric === 'conversionRate' && <><FiActivity color={currentColor.main} /> Conversion Rate</>}
              {mainChartMetric === 'activeUsersDaily' && <><FiBarChart2 color={currentColor.main} /> Active Visitors</>}
              {mainChartMetric === 'customerSatisfaction' && <><FiStar color={currentColor.main} /> Satisfaction</>}
            </h3>
            <div className="chart-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="chart-legend">
                <span className="legend-item">
                  <span className="legend-color" style={{ background: currentColor.main }}></span>
                  {mainChartMetric.charAt(0).toUpperCase() + mainChartMetric.slice(1)}
                </span>
              </div>
              <div className="metric-selector">
                <select 
                  value={mainChartMetric} 
                  onChange={(e) => setMainChartMetric(e.target.value)}
                  className="metric-select"
                >
                  <option value="revenue">Revenue</option>
                  <option value="orders">Orders</option>
                  <option value="boutiques">Boutiques</option>
                  <option value="users">Users</option>
                  <option value="aov">Avg Order Value</option>
                  <option value="conversionRate">Conversion Rate</option>
                  <option value="activeUsersDaily">Active Visitors</option>
                  <option value="customerSatisfaction">Satisfaction</option>
                </select>
              </div>
            </div>
          </div>
            <div className="chart-placeholder">
            <div className="svg-chart-container">
              <svg viewBox="0 0 1000 250" className="svg-chart" preserveAspectRatio="xMidYMid meet">
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
                  const data = chartData[mainChartMetric];
                  const maxValue = Math.max(...data.map(d => d.value), 1);
                  const chartHeight = 200;
                  const chartWidth = 930;
                  const barWidth = Math.min(50, chartWidth / data.length - 10);
                  const barSpacing = chartWidth / data.length;

                  const formatValue = (val) => {
                    if (mainChartMetric === 'revenue') return `$${Math.round(val / 1000)}K`;
                    if (mainChartMetric === 'aov') return `$${Math.round(val)}`;
                    if (mainChartMetric === 'conversionRate') return `${val.toFixed(1)}%`;
                    if (mainChartMetric === 'customerSatisfaction') return val.toFixed(1);
                    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
                    return Math.round(val);
                  };

                  const formatBarValue = (val) => {
                    if (mainChartMetric === 'revenue') return `$${(val / 1000).toFixed(1)}K`;
                    if (mainChartMetric === 'aov') return `$${Math.round(val)}`;
                    if (mainChartMetric === 'conversionRate') return `${val.toFixed(1)}%`;
                    if (mainChartMetric === 'customerSatisfaction') return val.toFixed(1);
                    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
                    return Math.round(val);
                  };
                  
                  return (
                    <>
                      {/* Grid lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                        <g key={i}>
                          <line
                            x1="30"
                            y1={20 + chartHeight * (1 - ratio)}
                            x2={30 + chartWidth}
                            y2={20 + chartHeight * (1 - ratio)}
                            stroke="#F3F4F6"
                            strokeWidth="1"
                          />
                          <text
                            x="25"
                            y={24 + chartHeight * (1 - ratio)}
                            textAnchor="end"
                            fontSize="10"
                            fill="#9CA3AF"
                          >
                            {formatValue(maxValue * ratio)}
                          </text>
                        </g>
                      ))}
                      
                      {/* Bars */}
                      {data.map((item, i) => {
                        const barHeight = (item.value / maxValue) * chartHeight;
                        const x = 30 + i * barSpacing + (barSpacing - barWidth) / 2;
                        const y = 20 + chartHeight - barHeight;
                        return (
                          <g key={i} className="bar-group">
                            <rect
                              x={x}
                              y={y}
                              width={barWidth}
                              height={barHeight}
                              rx="4"
                              fill={`url(${`#${gradientId}-bar`})`}
                              className="chart-bar"
                            />
                            <text
                              x={x + barWidth / 2}
                              y={y - 6}
                              textAnchor="middle"
                              fontSize="9"
                              fill={currentColor.main}
                              fontWeight="600"
                              className="bar-value-text"
                            >
                              {formatBarValue(item.value)}
                            </text>
                            <text
                              x={x + barWidth / 2}
                              y={235}
                              textAnchor="middle"
                              fontSize="11"
                              fill="#6B7280"
                              fontWeight="500"
                            >
                              {item.date}
                            </text>
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
        </div>

        <div className="chart-card chart-user-growth">
          <div className="chart-header">
            <h3><FiUsers /> User Growth</h3>
            <div className="chart-legend">
              <span className="legend-item">
                <span className="legend-color" style={{ background: '#3B82F6' }}></span>
                Users
              </span>
            </div>
          </div>
          <div className="chart-placeholder">
            <div className="line-chart-container">
              <svg viewBox="0 0 1000 200" className="line-chart" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="userGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 0.3 }} />
                    <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
                {(() => {
                  const data = chartData.users;
                  const maxValue = Math.max(...data.map(d => d.value), 1);
                  const points = data.map((d, i) => {
                    const x = (i / (data.length - 1)) * 1000;
                    const y = 200 - (d.value / maxValue) * 180;
                    return `${x},${y}`;
                  }).join(' ');
                  
                  const areaPoints = `0,200 ${points} 1000,200`;
                  
                  return (
                    <>
                      <polygon points={areaPoints} fill="url(#userGradient)" />
                      <polyline
                        points={points}
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {data.map((d, i) => {
                        const x = (i / (data.length - 1)) * 1000;
                        const y = 200 - (d.value / maxValue) * 180;
                        return (
                          <circle key={i} cx={x} cy={y} r="4" fill="#3B82F6" />
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
              <div className="line-chart-labels">
                {chartData.users.map((item, i) => (
                  <span key={i}>{item.date}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="chart-card chart-orders">
          <div className="chart-header">
            <h3><FiPackage /> Orders Overview</h3>
          </div>
          <div className="chart-placeholder">
            <div className="mini-stats">
              <div className="mini-stat">
                <div className="mini-stat-value">{analytics.orders.toLocaleString()}</div>
                <div className="mini-stat-label">Total Orders</div>
              </div>
              <div className="mini-stat">
                <div className="mini-stat-value">{analytics.pendingOrders}</div>
                <div className="mini-stat-label">Pending</div>
              </div>
              <div className="mini-stat">
                <div className="mini-stat-value">{analytics.orders - analytics.pendingOrders}</div>
                <div className="mini-stat-label">Completed</div>
              </div>
              <div className="mini-stat">
                <div className="mini-stat-value">${analytics.avgOrderValue.toFixed(2)}</div>
                <div className="mini-stat-label">Avg Value</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="quick-insights">
        <div className="insight-card">
          <div className="insight-icon positive">
            <FiTrendingUp />
          </div>
          <div>
            <h4>Strong Growth</h4>
            <p>User acquisition up {userGrowth.text} this period</p>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-icon positive">
            <FiDollarSign />
          </div>
          <div>
            <h4>Revenue Increase</h4>
            <p>{revenueGrowth.text} revenue growth vs previous period</p>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">
            <FiShoppingBag />
          </div>
          <div>
            <h4>Order Volume</h4>
            <p>Consistent order growth across all categories</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverviewPage;