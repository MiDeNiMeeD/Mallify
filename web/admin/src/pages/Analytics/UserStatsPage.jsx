import React, { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiTrendingUp, 
  FiCalendar,
  FiDownload,
  FiRefreshCw,
  FiArrowUp,
  FiArrowDown,
  FiActivity,
  FiBarChart2,
  FiStar,
  FiHeart,
  FiShoppingBag,
  FiTruck,
  FiAward,
  FiClock,
  FiUserCheck,
  FiUserPlus
} from 'react-icons/fi';
import './AnalyticsOverview.css';

const UserStatsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [mainChartMetric, setMainChartMetric] = useState('customers');
  const [chartData, setChartData] = useState({
    customers: [],
    boutiques: [],
    drivers: [],
    active: []
  });

  const dateRanges = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' },
    { value: '365', label: 'Last Year' }
  ];

  // Color config for each metric
  const metricColors = {
    customers: { main: '#7C3AED', light: '#7C3AED', dark: '#5B21B6' },
    boutiques: { main: '#059669', light: '#059669', dark: '#047857' },
    drivers: { main: '#2563EB', light: '#2563EB', dark: '#1D4ED8' },
    active: { main: '#D97706', light: '#D97706', dark: '#B45309' }
  };

  // Demo data generators
  const generateCustomerData = (days) => {
    const data = [];
    let base = 150;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      base += Math.floor(Math.random() * 30 + 5);
      data.push({ date: dateStr, value: base });
    }
    return data;
  };

  const generateBoutiqueData = (days) => {
    const data = [];
    let base = 30;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      base += Math.floor(Math.random() * 4 + 1);
      data.push({ date: dateStr, value: base });
    }
    return data;
  };

  const generateDriverData = (days) => {
    const data = [];
    let base = 40;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      base += Math.floor(Math.random() * 3 + 1);
      data.push({ date: dateStr, value: base });
    }
    return data;
  };

  const generateActiveData = (days) => {
    const data = [];
    let base = 200;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      base += Math.floor(Math.random() * 20 - 10);
      base = Math.max(150, base);
      data.push({ date: dateStr, value: base });
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

      await new Promise(resolve => setTimeout(resolve, 800));

      const days = parseInt(dateRange);
      const customerData = generateCustomerData(days);
      const boutiqueData = generateBoutiqueData(days);
      const driverData = generateDriverData(days);
      const activeData = generateActiveData(days);

      const totalCustomers = customerData[customerData.length - 1].value;
      const totalBoutiques = boutiqueData[boutiqueData.length - 1].value;
      const totalDrivers = driverData[driverData.length - 1].value;
      const activeUsers = activeData[activeData.length - 1].value;

      const demoAnalytics = {
        totalUsers: totalCustomers + totalBoutiques + totalDrivers,
        totalCustomers,
        totalBoutiques,
        totalDrivers,
        activeUsers,
        customerGrowth: 15.2,
        boutiqueGrowth: 12.8,
        driverGrowth: 18.4,
        retentionRate: 76.3,
        newUsersThisMonth: Math.floor(Math.random() * 500 + 1200),
        avgSessionDuration: 420,
        conversionRate: 3.8,
        satisfaction: 4.7,
        activeRate: ((activeUsers / (totalCustomers + totalBoutiques + totalDrivers)) * 100).toFixed(1)
      };

      setAnalytics(demoAnalytics);
      setChartData({
        customers: customerData,
        boutiques: boutiqueData,
        drivers: driverData,
        active: activeData
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => fetchAnalytics(true);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      const exportData = {
        dateRange: `${dateRange} days`,
        generatedAt: new Date().toISOString(),
        analytics,
        charts: chartData
      };
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `user-analytics-${dateRange}days-${new Date().toISOString().split('T')[0]}.json`;
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
          <p>Loading user statistics...</p>
        </div>
      </div>
    );
  }

  const currentColor = metricColors[mainChartMetric];
  const gradientId = `userBarGradient-${mainChartMetric}`;

  // Role distribution data for the donut-like visualization
  const roleData = [
    { name: 'Customers', value: analytics.totalCustomers, color: '#7C3AED', icon: FiUsers },
    { name: 'Boutique Owners', value: analytics.totalBoutiques, color: '#059669', icon: FiShoppingBag },
    { name: 'Drivers', value: analytics.totalDrivers, color: '#2563EB', icon: FiTruck }
  ];
  const totalForRole = roleData.reduce((s, r) => s + r.value, 0);

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1><FiUsers /> User Statistics</h1>
          <p>User demographics, growth and engagement metrics</p>
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

      {/* Stats Grid - 8 cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card highlight" style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' }}>
          <div className="admin-stat-header">
            <span className="admin-stat-title" style={{ color: 'rgba(255,255,255,0.9)' }}>Total Users</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF' }}>
              <FiUsers size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value" style={{ color: 'white' }}>{analytics.totalUsers.toLocaleString()}</div>
            <div className="admin-stat-change positive" style={{ color: 'rgba(255,255,255,0.85)' }}>
              <FiArrowUp size={14} /> +{analytics.customerGrowth}% growth
            </div>
            <div className="admin-stat-sub" style={{ color: 'rgba(255,255,255,0.7)' }}>+{analytics.newUsersThisMonth} this month</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Customers</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(124, 58, 237, 0.15)', color: '#7C3AED' }}>
              <FiUsers size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.totalCustomers.toLocaleString()}</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} /> +{analytics.customerGrowth}% vs previous
            </div>
            <div className="admin-stat-sub">{((analytics.totalCustomers / analytics.totalUsers) * 100).toFixed(1)}% of total</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Boutique Owners</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
              <FiShoppingBag size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.totalBoutiques.toLocaleString()}</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} /> +{analytics.boutiqueGrowth}% vs previous
            </div>
            <div className="admin-stat-sub">{((analytics.totalBoutiques / analytics.totalUsers) * 100).toFixed(1)}% of total</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Drivers</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#2563EB' }}>
              <FiTruck size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.totalDrivers.toLocaleString()}</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} /> +{analytics.driverGrowth}% vs previous
            </div>
            <div className="admin-stat-sub">{((analytics.totalDrivers / analytics.totalUsers) * 100).toFixed(1)}% of total</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Active Users</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#D97706' }}>
              <FiActivity size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.activeUsers.toLocaleString()}</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} /> {analytics.activeRate}% active rate
            </div>
            <div className="admin-stat-sub">Currently active users</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Retention Rate</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#EC4899' }}>
              <FiHeart size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.retentionRate}%</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} /> +2.1% vs previous
            </div>
            <div className="admin-stat-sub">30-day retention</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Satisfaction</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#F59E0B' }}>
              <FiStar size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.satisfaction}/5.0</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} /> +0.2 this period
            </div>
            <div className="admin-stat-sub">Based on user feedback</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Conversion Rate</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06B6D4' }}>
              <FiBarChart2 size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.conversionRate}%</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} /> +0.5% vs previous
            </div>
            <div className="admin-stat-sub">Visitor to user conversion</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="analytics-charts">
        {/* Main Bar Chart */}
        <div className="chart-card chart-revenue">
          <div className="chart-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {mainChartMetric === 'customers' && <><FiUsers color={currentColor.main} /> Customer Growth</>}
              {mainChartMetric === 'boutiques' && <><FiShoppingBag color={currentColor.main} /> Boutique Growth</>}
              {mainChartMetric === 'drivers' && <><FiTruck color={currentColor.main} /> Driver Growth</>}
              {mainChartMetric === 'active' && <><FiActivity color={currentColor.main} /> Active Users</>}
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
                  <option value="customers">Customers</option>
                  <option value="boutiques">Boutiques</option>
                  <option value="drivers">Drivers</option>
                  <option value="active">Active Users</option>
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
                    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
                    return Math.round(val);
                  };

                  const formatBarValue = (val) => {
                    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
                    return Math.round(val);
                  };

                  return (
                    <>
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

        {/* Role Distribution - User Growth chart (70%) */}
        <div className="chart-card chart-user-growth">
          <div className="chart-header">
            <h3><FiUsers /> Role Distribution</h3>
          </div>
          <div className="chart-placeholder">
            <div style={{ padding: '1rem 0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
              {roleData.map((role, i) => {
                const percentage = ((role.value / totalForRole) * 100).toFixed(1);
                const Icon = role.icon;
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Icon size={16} color={role.color} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>{role.name}</span>
                      </div>
                      <strong style={{ fontSize: '0.875rem', color: '#111827' }}>{percentage}%</strong>
                    </div>
                    <div style={{ height: '8px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${percentage}%`, 
                        height: '100%', 
                        background: role.color,
                        borderRadius: '4px',
                        transition: 'width 0.6s ease'
                      }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.1rem' }}>
                      {role.value.toLocaleString()} users
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Stats - Orders Overview (30%) */}
        <div className="chart-card chart-orders">
          <div className="chart-header">
            <h3><FiAward /> Engagement</h3>
          </div>
          <div className="chart-placeholder">
            <div className="mini-stats">
              <div className="mini-stat">
                <div className="mini-stat-value">{analytics.retentionRate}%</div>
                <div className="mini-stat-label">Retention</div>
              </div>
              <div className="mini-stat">
                <div className="mini-stat-value">{analytics.activeRate}%</div>
                <div className="mini-stat-label">Active Rate</div>
              </div>
              <div className="mini-stat">
                <div className="mini-stat-value">{analytics.satisfaction}</div>
                <div className="mini-stat-label">Satisfaction</div>
              </div>
              <div className="mini-stat">
                <div className="mini-stat-value">{analytics.conversionRate}%</div>
                <div className="mini-stat-label">Conversion</div>
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
            <h4>Strong User Growth</h4>
            <p>User base growing at +{analytics.customerGrowth}% this period</p>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-icon positive">
            <FiUserCheck />
          </div>
          <div>
            <h4>High Engagement</h4>
            <p>{analytics.activeRate}% of users are active</p>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">
            <FiUserPlus />
          </div>
          <div>
            <h4>New User Acquisition</h4>
            <p>{analytics.newUsersThisMonth.toLocaleString()} new users this month</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatsPage;