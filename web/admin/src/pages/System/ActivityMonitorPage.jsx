import React, { useState, useEffect } from 'react';
import { 
  FiActivity, 
  FiServer, 
  FiCalendar,
  FiDownload,
  FiRefreshCw,
  FiArrowUp,
  FiArrowDown,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiZap,
  FiWifi,
  FiDatabase,
  FiShield,
  FiCloud,
  FiCpu,
  FiBarChart2
} from 'react-icons/fi';
import './SystemPages.css';

const ActivityMonitorPage = () => {
  const [services, setServices] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const serviceNames = [
    { name: 'API Gateway', icon: FiCloud, color: '#7C3AED' },
    { name: 'Database', icon: FiDatabase, color: '#2563EB' },
    { name: 'Payment Service', icon: FiShield, color: '#059669' },
    { name: 'Notification Service', icon: FiZap, color: '#D97706' },
    { name: 'Authentication Service', icon: FiShield, color: '#DC2626' },
    { name: 'Search Service', icon: FiBarChart2, color: '#0891B2' },
    { name: 'File Storage', icon: FiCloud, color: '#8B5CF6' },
    { name: 'Cache Service', icon: FiCpu, color: '#EC4899' }
  ];

  const statuses = ['online', 'degraded', 'offline'];
  const statusWeights = { online: 0.85, degraded: 0.1, offline: 0.05 };

  const generateServices = () => {
    return serviceNames.map((svc, i) => {
      const rand = Math.random();
      let status;
      if (rand < statusWeights.online) status = 'online';
      else if (rand < statusWeights.online + statusWeights.degraded) status = 'degraded';
      else status = 'offline';
      
      return {
        id: i + 1,
        name: svc.name,
        icon: svc.icon,
        color: svc.color,
        status,
        uptime: status === 'online' ? (99.5 + Math.random() * 0.5).toFixed(1) : (97 + Math.random() * 2).toFixed(1),
        responseTime: Math.floor(Math.random() * 150 + 10),
        requests: Math.floor(Math.random() * 50000 + 10000),
        errors: status === 'offline' ? Math.floor(Math.random() * 100 + 50) : status === 'degraded' ? Math.floor(Math.random() * 20 + 5) : Math.floor(Math.random() * 5),
        memory: Math.floor(Math.random() * 40 + 30),
        cpu: Math.floor(Math.random() * 30 + 20),
        lastChecked: new Date()
      };
    });
  };

  const generateAnalytics = (servicesData) => {
    const online = servicesData.filter(s => s.status === 'online').length;
    const degraded = servicesData.filter(s => s.status === 'degraded').length;
    const offline = servicesData.filter(s => s.status === 'offline').length;
    const avgResponse = Math.round(servicesData.reduce((s, svc) => s + svc.responseTime, 0) / servicesData.length);
    const totalRequests = servicesData.reduce((s, svc) => s + svc.requests, 0);
    const totalErrors = servicesData.reduce((s, svc) => s + svc.errors, 0);
    const avgUptime = servicesData.reduce((s, svc) => s + parseFloat(svc.uptime), 0) / servicesData.length;
    const avgCpu = Math.round(servicesData.reduce((s, svc) => s + svc.cpu, 0) / servicesData.length);
    const avgMemory = Math.round(servicesData.reduce((s, svc) => s + svc.memory, 0) / servicesData.length);

    return {
      total: servicesData.length,
      online,
      degraded,
      offline,
      avgResponse,
      totalRequests,
      totalErrors,
      avgUptime: avgUptime.toFixed(1),
      avgCpu,
      avgMemory,
      healthScore: Math.round((online / servicesData.length) * 100),
      errorRate: ((totalErrors / totalRequests) * 100).toFixed(2)
    };
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      refreshData();
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      await new Promise(resolve => setTimeout(resolve, 600));
      
      const generatedServices = generateServices();
      const generatedAnalytics = generateAnalytics(generatedServices);

      setServices(generatedServices);
      setAnalytics(generatedAnalytics);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshData = () => {
    const generatedServices = generateServices();
    const generatedAnalytics = generateAnalytics(generatedServices);
    setServices(generatedServices);
    setAnalytics(generatedAnalytics);
  };

  const handleRefresh = () => fetchData(true);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      const exportData = {
        generatedAt: new Date().toISOString(),
        analytics,
        services
      };
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `activity-monitor-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setExporting(false);
    }, 1000);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'online': return { bg: '#D1FAE5', text: '#065F46', icon: FiCheckCircle, dot: '#10B981' };
      case 'degraded': return { bg: '#FEF3C7', text: '#92400E', icon: FiAlertCircle, dot: '#F59E0B' };
      case 'offline': return { bg: '#FEE2E2', text: '#991B1B', icon: FiAlertCircle, dot: '#EF4444' };
      default: return { bg: '#F3F4F6', text: '#374151', icon: FiActivity, dot: '#6B7280' };
    }
  };

  if (loading || !analytics) {
    return (
      <div className="system-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading activity monitor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="system-page">
      <div className="page-header">
        <div>
          <h1><FiActivity /> System Activity</h1>
          <p>Real-time system monitoring and service health</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            className="btn-action-header"
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              background: autoRefresh ? '#7C3AED' : 'white',
              color: autoRefresh ? 'white' : '#374151',
              borderColor: autoRefresh ? '#7C3AED' : '#E5E7EB'
            }}
            title="Toggle auto-refresh"
          >
            <FiClock size={14} />
            <span>{autoRefresh ? 'Auto Refresh: ON' : 'Auto Refresh: OFF'}</span>
          </button>
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
      <div className="admin-stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="admin-stat-card highlight" style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
          <div className="admin-stat-header">
            <span className="admin-stat-title" style={{ color: 'rgba(255,255,255,0.9)' }}>System Health</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF' }}>
              <FiActivity size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value" style={{ color: 'white' }}>{analytics.healthScore}%</div>
            <div className="admin-stat-change positive" style={{ color: 'rgba(255,255,255,0.85)' }}>
              <FiArrowUp size={14} /> {analytics.online}/{analytics.total} services online
            </div>
            <div className="admin-stat-sub" style={{ color: 'rgba(255,255,255,0.7)' }}>{analytics.avgUptime}% avg uptime</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Online</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
              <FiCheckCircle size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.online}</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} /> {((analytics.online / analytics.total) * 100).toFixed(0)}% of total
            </div>
            <div className="admin-stat-sub">Healthy services</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Degraded</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#D97706' }}>
              <FiAlertCircle size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.degraded}</div>
            <div className="admin-stat-change negative">
              <FiArrowDown size={14} /> Needs attention
            </div>
            <div className="admin-stat-sub">Performance issues</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Offline</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(220, 38, 38, 0.15)', color: '#DC2626' }}>
              <FiAlertCircle size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.offline}</div>
            <div className="admin-stat-change negative">
              <FiArrowDown size={14} /> Critical
            </div>
            <div className="admin-stat-sub">Requires immediate action</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Avg Response</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(124, 58, 237, 0.15)', color: '#7C3AED' }}>
              <FiZap size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.avgResponse}ms</div>
            <div className="admin-stat-change positive">
              <FiArrowDown size={14} /> Fast response
            </div>
            <div className="admin-stat-sub">Across all services</div>
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
              <FiArrowUp size={14} /> Current load
            </div>
            <div className="admin-stat-sub">Total requests</div>
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
              <FiArrowDown size={14} /> Low error rate
            </div>
            <div className="admin-stat-sub">{analytics.totalErrors} total errors</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Avg Resources</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#D97706' }}>
              <FiCpu size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.avgCpu}% CPU</div>
            <div className="admin-stat-change positive">
              <FiArrowDown size={14} /> {analytics.avgMemory}% memory
            </div>
            <div className="admin-stat-sub">Average utilization</div>
          </div>
        </div>
      </div>

      {/* Service Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {services.map((service) => {
          const statusInfo = getStatusColor(service.status);
          const StatusIcon = service.icon;
          return (
            <div key={service.id} style={{ 
              background: 'white', 
              padding: '1.5rem', 
              borderRadius: '16px',
              border: `2px solid ${service.status === 'offline' ? '#FEE2E2' : service.status === 'degraded' ? '#FEF3C7' : '#E5E7EB'}`,
              boxShadow: '0 4px 15px rgba(124, 58, 237, 0.08)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Status indicator bar at top */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: statusInfo.dot
              }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: `${service.color}20`,
                  color: service.color,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  <StatusIcon />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#111827' }}>{service.name}</h3>
                  <span style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.2rem 0.6rem',
                    background: statusInfo.bg,
                    color: statusInfo.text,
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    marginTop: '0.25rem'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusInfo.dot, display: 'inline-block' }} />
                    {service.status}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ background: '#F9FAFB', padding: '0.75rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>UPTIME</div>
                  <strong style={{ color: '#111827' }}>{service.uptime}%</strong>
                </div>
                <div style={{ background: '#F9FAFB', padding: '0.75rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>RESPONSE</div>
                  <strong style={{ color: '#111827' }}>{service.responseTime}ms</strong>
                </div>
                <div style={{ background: '#F9FAFB', padding: '0.75rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>REQUESTS</div>
                  <strong style={{ color: '#111827' }}>{service.requests >= 1000 ? `${(service.requests / 1000).toFixed(1)}K` : service.requests}</strong>
                </div>
                <div style={{ background: '#F9FAFB', padding: '0.75rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>ERRORS</div>
                  <strong style={{ color: service.errors > 20 ? '#DC2626' : '#059669' }}>{service.errors}</strong>
                </div>
              </div>

              {/* Resource bars */}
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#9CA3AF', marginBottom: '0.2rem' }}>
                    <span>CPU</span>
                    <span>{service.cpu}%</span>
                  </div>
                  <div style={{ height: '4px', background: '#F3F4F6', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${service.cpu}%`, height: '100%', background: service.cpu > 80 ? '#DC2626' : '#059669', borderRadius: '2px' }} />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#9CA3AF', marginBottom: '0.2rem' }}>
                    <span>MEM</span>
                    <span>{service.memory}%</span>
                  </div>
                  <div style={{ height: '4px', background: '#F3F4F6', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${service.memory}%`, height: '100%', background: service.memory > 80 ? '#DC2626' : '#2563EB', borderRadius: '2px' }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Insights */}
      <div className="quick-insights">
        <div className="insight-card">
          <div className="insight-icon positive">
            <FiActivity />
          </div>
          <div>
            <h4>System Status</h4>
            <p>{analytics.healthScore}% health score - {analytics.healthScore >= 80 ? 'All systems operational' : 'Some services need attention'}</p>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-icon positive">
            <FiZap />
          </div>
          <div>
            <h4>Performance</h4>
            <p>Average response time {analytics.avgResponse}ms across all services</p>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">
            <FiCpu />
          </div>
          <div>
            <h4>Resource Usage</h4>
            <p>{analytics.avgCpu}% CPU / {analytics.avgMemory}% Memory average utilization</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityMonitorPage;