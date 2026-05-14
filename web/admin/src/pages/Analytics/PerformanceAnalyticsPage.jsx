import React, { useState, useEffect } from 'react';
import { 
  FiActivity, 
  FiTrendingUp, 
  FiUsers,
  FiCalendar,
  FiDownload,
  FiRefreshCw,
  FiArrowUp,
  FiArrowDown,
  FiBarChart2,
  FiClock,
  FiServer,
  FiZap,
  FiWifi,
  FiHardDrive,
  FiAlertCircle,
  FiCheckCircle,
  FiDatabase
} from 'react-icons/fi';
import './AnalyticsOverview.css';

const PerformanceAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [mainChartMetric, setMainChartMetric] = useState('responseTime');
  const [chartData, setChartData] = useState({
    responseTime: [],
    uptime: [],
    requests: [],
    errors: []
  });

  const dateRanges = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' },
    { value: '365', label: 'Last Year' }
  ];

  // Color config for each metric
  const metricColors = {
    responseTime: { main: '#059669', light: '#059669', dark: '#047857' },
    uptime: { main: '#7C3AED', light: '#7C3AED', dark: '#5B21B6' },
    requests: { main: '#2563EB', light: '#2563EB', dark: '#1D4ED8' },
    errors: { main: '#DC2626', light: '#DC2626', dark: '#B91C1C' }
  };

  // Demo data generators
  const generateResponseTimeData = (days) => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayOfWeek = date.getDay();
      const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1;
      data.push({
        date: dateStr,
        value: Math.floor((Math.random() * 60 + 80) * weekendMultiplier)
      });
    }
    return data;
  };

  const generateUptimeData = (days) => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dip = Math.random();
      const value = dip < 0.1 ? 99.5 + Math.random() * 0.3 : 99.9 - Math.random() * 0.05;
      data.push({ date: dateStr, value: parseFloat(value.toFixed(2)) });
    }
    return data;
  };

  const generateRequestsData = (days) => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayOfWeek = date.getDay();
      const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1;
      data.push({
        date: dateStr,
        value: Math.floor((Math.random() * 50000 + 100000) * weekendMultiplier)
      });
    }
    return data;
  };

  const generateErrorsData = (days) => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const spike = Math.random() < 0.05 ? Math.floor(Math.random() * 50 + 30) : Math.floor(Math.random() * 5 + 1);
      data.push({ date: dateStr, value: spike });
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
      const responseTimeData = generateResponseTimeData(days);
      const uptimeData = generateUptimeData(days);
      const requestsData = generateRequestsData(days);
      const errorsData = generateErrorsData(days);

      const avgResponseTime = Math.round(responseTimeData.reduce((s, d) => s + d.value, 0) / responseTimeData.length);
      const avgUptime = uptimeData.reduce((s, d) => s + d.value, 0) / uptimeData.length;
      const totalRequests = requestsData.reduce((s, d) => s + d.value, 0);
      const totalErrors = errorsData.reduce((s, d) => s + d.value, 0);
      const errorRate = ((totalErrors / totalRequests) * 100);
      const peakRequests = Math.max(...requestsData.map(d => d.value));

      const demoAnalytics = {
        avgResponseTime,
        avgUptime: parseFloat(avgUptime.toFixed(2)),
        currentUptime: 99.98,
        totalRequests,
        totalErrors,
        errorRate: parseFloat(errorRate.toFixed(2)),
        peakRequests,
        peakLoadTime: 245,
        activeUsers: 1834,
        dbQueryTime: 45,
        apiLatency: 32,
        cacheHitRate: 94.5,
        serverLoad: 56,
        responseTimeImprovement: 8.3,
        uptimeImprovement: 2.1,
        errorReduction: 15.7
      };

      setAnalytics(demoAnalytics);
      setChartData({
        responseTime: responseTimeData,
        uptime: uptimeData,
        requests: requestsData,
        errors: errorsData
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
      link.download = `performance-analytics-${dateRange}days-${new Date().toISOString().split('T')[0]}.json`;
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
          <p>Loading performance analytics...</p>
        </div>
      </div>
    );
  }

  const currentColor = metricColors[mainChartMetric];
  const gradientId = `perfBarGradient-${mainChartMetric}`;

  // System metrics for distribution
  const systemMetrics = [
    { name: 'Response Time', value: `${analytics.avgResponseTime}ms`, color: '#059669', icon: FiClock },
    { name: 'DB Query Time', value: `${analytics.dbQueryTime}ms`, color: '#2563EB', icon: FiDatabase },
    { name: 'API Latency', value: `${analytics.apiLatency}ms`, color: '#7C3AED', icon: FiWifi },
    { name: 'Cache Hit Rate', value: `${analytics.cacheHitRate}%`, color: '#D97706', icon: FiZap },
    { name: 'Server Load', value: `${analytics.serverLoad}%`, color: '#DC2626', icon: FiServer },
    { name: 'Peak Load Time', value: `${analytics.peakLoadTime}ms`, color: '#0891B2', icon: FiBarChart2 }
  ];

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1><FiActivity /> Platform Performance</h1>
          <p>System health, performance metrics and infrastructure monitoring</p>
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
        <div className="admin-stat-card highlight" style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
          <div className="admin-stat-header">
            <span className="admin-stat-title" style={{ color: 'rgba(255,255,255,0.9)' }}>Avg Response Time</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF' }}>
              <FiClock size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value" style={{ color: 'white' }}>{analytics.avgResponseTime}ms</div>
            <div className="admin-stat-change positive" style={{ color: 'rgba(255,255,255,0.85)' }}>
              <FiArrowDown size={14} /> -{analytics.responseTimeImprovement}% improvement
            </div>
            <div className="admin-stat-sub" style={{ color: 'rgba(255,255,255,0.7)' }}>Target: {'<'} 200ms</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Uptime</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(124, 58, 237, 0.15)', color: '#7C3AED' }}>
              <FiCheckCircle size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.avgUptime}%</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} /> +{analytics.uptimeImprovement}% improvement
            </div>
            <div className="admin-stat-sub">Current: {analytics.currentUptime}%</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Total Requests</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#2563EB' }}>
              <FiBarChart2 size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.totalRequests >= 1000000 ? `${(analytics.totalRequests / 1000000).toFixed(1)}M` : `${(analytics.totalRequests / 1000).toFixed(1)}K`}</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} /> +12.4% vs previous
            </div>
            <div className="admin-stat-sub">Peak: {(analytics.peakRequests / 1000).toFixed(1)}K/day</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Error Rate</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(220, 38, 38, 0.15)', color: '#DC2626' }}>
              <FiAlertCircle size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.errorRate}%</div>
            <div className="admin-stat-change positive">
              <FiArrowDown size={14} /> -{analytics.errorReduction}% vs previous
            </div>
            <div className="admin-stat-sub">{analytics.totalErrors} total errors</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Active Users Now</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#D97706' }}>
              <FiUsers size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.activeUsers.toLocaleString()}</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} /> +5.2% vs previous
            </div>
            <div className="admin-stat-sub">Concurrent users</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">DB Query Time</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#2563EB' }}>
              <FiDatabase size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.dbQueryTime}ms</div>
            <div className="admin-stat-change positive">
              <FiArrowDown size={14} /> -5.1% vs previous
            </div>
            <div className="admin-stat-sub">Average query</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Cache Hit Rate</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#D97706' }}>
              <FiZap size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.cacheHitRate}%</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} /> +2.3% vs previous
            </div>
            <div className="admin-stat-sub">Optimized caching</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Server Load</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(220, 38, 38, 0.15)', color: '#DC2626' }}>
              <FiServer size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.serverLoad}%</div>
            <div className="admin-stat-change positive">
              <FiArrowDown size={14} /> -3.2% lightening
            </div>
            <div className="admin-stat-sub">Average utilization</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="analytics-charts">
        {/* Main Bar Chart */}
        <div className="chart-card chart-revenue">
          <div className="chart-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {mainChartMetric === 'responseTime' && <><FiClock color={currentColor.main} /> Response Time Trend</>}
              {mainChartMetric === 'uptime' && <><FiCheckCircle color={currentColor.main} /> Uptime Trend</>}
              {mainChartMetric === 'requests' && <><FiBarChart2 color={currentColor.main} /> Requests Trend</>}
              {mainChartMetric === 'errors' && <><FiAlertCircle color={currentColor.main} /> Error Count Trend</>}
            </h3>
            <div className="chart-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="chart-legend">
                <span className="legend-item">
                  <span className="legend-color" style={{ background: currentColor.main }}></span>
                  {mainChartMetric === 'responseTime' && 'Avg Response'}
                  {mainChartMetric === 'uptime' && 'Uptime'}
                  {mainChartMetric === 'requests' && 'Requests'}
                  {mainChartMetric === 'errors' && 'Errors'}
                </span>
              </div>
              <div className="metric-selector">
                <select 
                  value={mainChartMetric} 
                  onChange={(e) => setMainChartMetric(e.target.value)}
                  className="metric-select"
                >
                  <option value="responseTime">Response Time</option>
                  <option value="uptime">Uptime</option>
                  <option value="requests">Requests</option>
                  <option value="errors">Errors</option>
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
                    if (mainChartMetric === 'uptime') return `${val.toFixed(1)}%`;
                    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
                    return Math.round(val);
                  };

                  const formatBarValue = (val) => {
                    if (mainChartMetric === 'uptime') return `${val.toFixed(2)}%`;
                    if (mainChartMetric === 'errors') return Math.round(val);
                    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
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

        {/* System Metrics (70%) */}
        <div className="chart-card chart-user-growth">
          <div className="chart-header">
            <h3><FiServer /> System Metrics Summary</h3>
          </div>
          <div className="chart-placeholder">
            <div style={{ padding: '0.5rem 0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.75rem' }}>
              {systemMetrics.map((metric, i) => {
                const Icon = metric.icon;
                const numericValue = parseInt(metric.value);
                const maxVal = 300;
                const barPercent = Math.min((numericValue / maxVal) * 100, 100);
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Icon size={14} color={metric.color} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#374151' }}>{metric.name}</span>
                      </div>
                      <strong style={{ fontSize: '0.85rem', color: '#111827' }}>{metric.value}</strong>
                    </div>
                    <div style={{ height: '6px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${barPercent}%`, 
                        height: '100%', 
                        background: `linear-gradient(90deg, ${metric.color}, ${metric.color}dd)`,
                        borderRadius: '4px',
                        transition: 'width 0.6s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Status Overview (30%) */}
        <div className="chart-card chart-orders">
          <div className="chart-header">
            <h3><FiCheckCircle /> Status Overview</h3>
          </div>
          <div className="chart-placeholder">
            <div className="mini-stats">
              <div className="mini-stat">
                <div className="mini-stat-value" style={{ color: '#059669' }}>{analytics.avgUptime}%</div>
                <div className="mini-stat-label">Uptime</div>
              </div>
              <div className="mini-stat">
                <div className="mini-stat-value" style={{ color: analytics.serverLoad > 80 ? '#DC2626' : '#2563EB' }}>{analytics.serverLoad}%</div>
                <div className="mini-stat-label">Server Load</div>
              </div>
              <div className="mini-stat">
                <div className="mini-stat-value" style={{ color: '#7C3AED' }}>{analytics.avgResponseTime}ms</div>
                <div className="mini-stat-label">Response</div>
              </div>
              <div className="mini-stat">
                <div className="mini-stat-value" style={{ color: analytics.errorRate > 1 ? '#DC2626' : '#059669' }}>{analytics.errorRate}%</div>
                <div className="mini-stat-label">Error Rate</div>
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
            <h4>Excellent Uptime</h4>
            <p>{analytics.avgUptime}% uptime across all services</p>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-icon positive">
            <FiZap />
          </div>
          <div>
            <h4>Fast Response Times</h4>
            <p>Average {analytics.avgResponseTime}ms - {analytics.avgResponseTime < 150 ? 'below' : 'meeting'} target</p>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">
            <FiHardDrive />
          </div>
          <div>
            <h4>Infrastructure Status</h4>
            <p>All systems healthy. Cache at {analytics.cacheHitRate}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalyticsPage;