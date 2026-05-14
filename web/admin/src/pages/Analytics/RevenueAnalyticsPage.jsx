import React, { useState, useEffect } from 'react';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiShoppingBag, 
  FiCalendar,
  FiDownload,
  FiRefreshCw,
  FiArrowUp,
  FiArrowDown,
  FiBarChart2,
  FiPackage,
  FiStar,
  FiCreditCard,
  FiPieChart,
  FiActivity
} from 'react-icons/fi';
import './AnalyticsOverview.css';

const RevenueAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [mainChartMetric, setMainChartMetric] = useState('revenue');
  const [chartData, setChartData] = useState({
    revenue: [],
    orders: [],
    aov: [],
    boutiques: []
  });

  const dateRanges = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' },
    { value: '365', label: 'Last Year' }
  ];

  // Color config for each metric
  const metricColors = {
    revenue: { main: '#D97706', light: '#D97706', dark: '#B45309' },
    orders: { main: '#059669', light: '#059669', dark: '#047857' },
    aov: { main: '#DC2626', light: '#DC2626', dark: '#B91C1C' },
    boutiques: { main: '#2563EB', light: '#2563EB', dark: '#1D4ED8' }
  };

  // Demo data generators
  const generateRevenueData = (days) => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayOfWeek = date.getDay();
      const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1;
      data.push({
        date: dateStr,
        value: Math.floor((Math.random() * 5000 + 3000) * weekendMultiplier)
      });
    }
    return data;
  };

  const generateOrdersData = (days) => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      data.push({ date: dateStr, value: Math.floor(Math.random() * 200 + 100) });
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

  const generateBoutiqueData = () => {
    const boutiques = [
      { name: 'Fashion Hub', revenue: 245000, orders: 1250, growth: 18.5 },
      { name: 'Tech Store', revenue: 189000, orders: 980, growth: 22.3 },
      { name: 'Home & Living', revenue: 156000, orders: 820, growth: 15.7 },
      { name: 'Sports Center', revenue: 134000, orders: 710, growth: 12.4 },
      { name: 'Beauty World', revenue: 112000, orders: 650, growth: 25.1 },
      { name: 'Book Haven', revenue: 89000, orders: 540, growth: 8.9 },
      { name: 'Electronic Zone', revenue: 78000, orders: 420, growth: 19.6 },
      { name: 'Garden Supplies', revenue: 65000, orders: 380, growth: 11.2 },
      { name: 'Pet Paradise', revenue: 54000, orders: 310, growth: 14.8 },
      { name: 'Auto Parts', revenue: 42000, orders: 250, growth: 9.5 }
    ];
    return boutiques;
  };

  const [topBoutiques] = useState(generateBoutiqueData);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      await new Promise(resolve => setTimeout(resolve, 800));

      const days = parseInt(dateRange);
      const revenueData = generateRevenueData(days);
      const ordersData = generateOrdersData(days);

      const totalRevenue = revenueData.reduce((s, d) => s + d.value, 0);
      const totalOrders = ordersData.reduce((s, d) => s + d.value, 0);

      const demoAnalytics = {
        totalRevenue,
        totalOrders,
        avgOrderValue: totalRevenue / totalOrders,
        revenueGrowth: 18.2,
        orderGrowth: 12.5,
        aovGrowth: 5.1,
        topBoutiqueRevenue: topBoutiques[0].revenue,
        monthlyRecurringRevenue: 425000,
        refundRate: 2.8,
        netProfitMargin: 34.2
      };

      setAnalytics(demoAnalytics);
      setChartData({
        revenue: revenueData,
        orders: ordersData,
        aov: generateAOVData(days),
        boutiques: generateRevenueData(days).map(d => ({ ...d, value: Math.floor(d.value / 15) }))
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
      link.download = `revenue-analytics-${dateRange}days-${new Date().toISOString().split('T')[0]}.json`;
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
          <p>Loading revenue analytics...</p>
        </div>
      </div>
    );
  }

  const currentColor = metricColors[mainChartMetric];
  const gradientId = `revenueBarGradient-${mainChartMetric}`;

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1><FiDollarSign /> Revenue Analytics</h1>
          <p>Detailed revenue breakdown and trends</p>
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

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card highlight" style={{ background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)' }}>
          <div className="admin-stat-header">
            <span className="admin-stat-title" style={{ color: 'rgba(255,255,255,0.9)' }}>Total Revenue</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF' }}>
              <FiDollarSign size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value" style={{ color: 'white' }}>${(analytics.totalRevenue / 1000).toFixed(1)}K</div>
            <div className="admin-stat-change positive" style={{ color: 'rgba(255,255,255,0.85)' }}>
              <FiArrowUp size={14} /> +{analytics.revenueGrowth}% vs previous
            </div>
            <div className="admin-stat-sub" style={{ color: 'rgba(255,255,255,0.7)' }}>${(analytics.totalRevenue / analytics.totalOrders).toFixed(2)} avg per order</div>
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
            <div className="admin-stat-value">{analytics.totalOrders.toLocaleString()}</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} /> +{analytics.orderGrowth}% vs previous
            </div>
            <div className="admin-stat-sub">{analytics.totalOrders} orders this period</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Avg Order Value</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(220, 38, 38, 0.15)', color: '#DC2626' }}>
              <FiCreditCard size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">${analytics.avgOrderValue.toFixed(2)}</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} /> +{analytics.aovGrowth}% vs previous
            </div>
            <div className="admin-stat-sub">Per transaction</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">MRR</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6' }}>
              <FiPieChart size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">${(analytics.monthlyRecurringRevenue / 1000).toFixed(1)}K</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} /> +8.3% this period
            </div>
            <div className="admin-stat-sub">Monthly Recurring Revenue</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Top Boutique</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#2563EB' }}>
              <FiShoppingBag size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">${(analytics.topBoutiqueRevenue / 1000).toFixed(1)}K</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} /> {topBoutiques[0].name}
            </div>
            <div className="admin-stat-sub">Top performing boutique</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Net Profit Margin</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
              <FiActivity size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.netProfitMargin}%</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} /> +2.1% vs previous
            </div>
            <div className="admin-stat-sub">Healthy margin</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Refund Rate</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#D97706' }}>
              <FiStar size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.refundRate}%</div>
            <div className="admin-stat-change positive">
              <FiArrowDown size={14} /> -0.3% improvement
            </div>
            <div className="admin-stat-sub">Low return rate</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Growth Rate</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#D97706' }}>
              <FiTrendingUp size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">+{analytics.revenueGrowth}%</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} /> Strong growth
            </div>
            <div className="admin-stat-sub">Period over period</div>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="analytics-charts">
        <div className="chart-card chart-revenue">
          <div className="chart-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {mainChartMetric === 'revenue' && <><FiDollarSign color={currentColor.main} /> Revenue Trend</>}
              {mainChartMetric === 'orders' && <><FiPackage color={currentColor.main} /> Orders Trend</>}
              {mainChartMetric === 'aov' && <><FiCreditCard color={currentColor.main} /> Avg Order Value Trend</>}
              {mainChartMetric === 'boutiques' && <><FiShoppingBag color={currentColor.main} /> Boutiques Trend</>}
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
                  <option value="aov">Avg Order Value</option>
                  <option value="boutiques">Boutiques</option>
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
                    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
                    return Math.round(val);
                  };

                  const formatBarValue = (val) => {
                    if (mainChartMetric === 'revenue') return `$${(val / 1000).toFixed(1)}K`;
                    if (mainChartMetric === 'aov') return `$${Math.round(val)}`;
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
      </div>

      {/* Top Boutiques Section */}
      <div className="analytics-charts" style={{ gridTemplateColumns: 'repeat(1, 1fr)' }}>
        <div className="chart-card">
          <div className="chart-header">
            <h3><FiShoppingBag /> Top Boutiques by Revenue</h3>
          </div>
          <div className="chart-placeholder">
            <div style={{ padding: '0.5rem 0' }}>
              {topBoutiques.map((b, i) => {
                const maxRevenue = topBoutiques[0].revenue;
                const barWidthPercent = (b.revenue / maxRevenue) * 100;
                return (
                  <div key={i} style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '6px', 
                          background: i < 3 ? `linear-gradient(135deg, ${metricColors.revenue.light}, ${metricColors.revenue.dark})` : '#F3F4F6',
                          color: i < 3 ? 'white' : '#6B7280',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: '700'
                        }}>
                          {i + 1}
                        </span>
                        <span style={{ fontWeight: 500, color: '#374151' }}>{b.name}</span>
                        <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                          <FiArrowUp size={10} style={{ marginRight: '2px' }} />
                          {b.growth}%
                        </span>
                      </div>
                      <strong style={{ color: '#111827' }}>${(b.revenue / 1000).toFixed(1)}K</strong>
                    </div>
                    <div style={{ 
                      height: '8px', 
                      background: '#F3F4F6', 
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${barWidthPercent}%`, 
                        height: '100%', 
                        background: i < 3 
                          ? `linear-gradient(90deg, ${metricColors.revenue.light}, ${metricColors.revenue.dark})`
                          : '#D1D5DB',
                        borderRadius: '4px',
                        transition: 'width 0.6s ease'
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.15rem' }}>
                      <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>{b.orders} orders</span>
                      <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>${(b.revenue / b.orders).toFixed(2)} avg</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalyticsPage;