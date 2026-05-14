import React, { useState, useEffect } from 'react';
import { 
  FiTool, 
  FiRefreshCw, 
  FiDatabase,
  FiCalendar,
  FiDownload,
  FiArrowUp,
  FiArrowDown,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiTrash2,
  FiArchive,
  FiShield,
  FiZap,
  FiServer,
  FiHardDrive,
  FiActivity,
  FiBarChart2
} from 'react-icons/fi';
import './SystemPages.css';

const MaintenancePage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [runningTasks, setRunningTasks] = useState([]);
  const [taskHistory, setTaskHistory] = useState([]);

  // Maintenance tasks configuration
  const maintenanceTasks = [
    {
      id: 'cache',
      name: 'Cache Management',
      description: 'Clear application cache to free up memory and ensure fresh data delivery',
      icon: FiZap,
      color: '#7C3AED',
      duration: 30,
      impact: 'low',
      lastRun: null,
      lastResult: null
    },
    {
      id: 'database-backup',
      name: 'Database Backup',
      description: 'Create a full backup of all databases including users, orders, and products',
      icon: FiDatabase,
      color: '#059669',
      duration: 120,
      impact: 'medium',
      lastRun: null,
      lastResult: null
    },
    {
      id: 'log-cleanup',
      name: 'Log Cleanup',
      description: 'Rotate and archive old system logs to maintain disk space',
      icon: FiTrash2,
      color: '#DC2626',
      duration: 45,
      impact: 'low',
      lastRun: null,
      lastResult: null
    },
    {
      id: 'index-optimization',
      name: 'Index Optimization',
      description: 'Rebuild and optimize database indexes for better query performance',
      icon: FiBarChart2,
      color: '#2563EB',
      duration: 90,
      impact: 'medium',
      lastRun: null,
      lastResult: null
    },
    {
      id: 'security-scan',
      name: 'Security Scan',
      description: 'Run automated security vulnerability scanning on all services',
      icon: FiShield,
      color: '#D97706',
      duration: 180,
      impact: 'medium',
      lastRun: null,
      lastResult: null
    },
    {
      id: 'file-cleanup',
      name: 'Temporary File Cleanup',
      description: 'Remove temporary and orphaned files from the storage system',
      icon: FiHardDrive,
      color: '#0891B2',
      duration: 60,
      impact: 'low',
      lastRun: null,
      lastResult: null
    }
  ];

  const [tasks, setTasks] = useState(maintenanceTasks);

  const generateTaskHistory = () => {
    const history = [];
    const taskNames = ['Cache Management', 'Database Backup', 'Log Cleanup', 'Index Optimization', 'Security Scan', 'File Cleanup'];
    const statuses = ['success', 'failed', 'success', 'success', 'success'];
    
    for (let i = 0; i < 25; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      date.setHours(Math.floor(Math.random() * 24));
      date.setMinutes(Math.floor(Math.random() * 60));
      
      history.push({
        id: i + 1,
        task: taskNames[Math.floor(Math.random() * taskNames.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        duration: Math.floor(Math.random() * 150 + 20),
        timestamp: date,
        details: `Completed by automated scheduler`
      });
    }
    history.sort((a, b) => b.timestamp - a.timestamp);
    return history;
  };

  const generateAnalytics = () => {
    const totalTasks = taskHistory.length;
    const successful = taskHistory.filter(t => t.status === 'success').length;
    const failed = taskHistory.filter(t => t.status === 'failed').length;
    const avgDuration = totalTasks > 0 ? Math.round(taskHistory.reduce((s, t) => s + t.duration, 0) / totalTasks) : 0;
    
    // Count per task
    const taskCounts = {};
    taskHistory.forEach(t => {
      taskCounts[t.task] = (taskCounts[t.task] || 0) + 1;
    });

    return {
      totalTasks,
      successful,
      failed,
      avgDuration,
      successRate: totalTasks > 0 ? ((successful / totalTasks) * 100).toFixed(1) : 0,
      criticalIssues: failed,
      lastBackup: new Date().toLocaleDateString(),
      cacheSize: '2.4 GB',
      dbSize: '8.7 GB',
      logSize: '1.2 GB'
    };
  };

  useEffect(() => {
    const history = generateTaskHistory();
    setTaskHistory(history);
    
    // Update lastRun for tasks based on history
    const updatedTasks = tasks.map(task => {
      const taskHistoryEntries = history.filter(h => h.task === task.name);
      if (taskHistoryEntries.length > 0) {
        const lastEntry = taskHistoryEntries[0];
        return {
          ...task,
          lastRun: lastEntry.timestamp,
          lastResult: lastEntry.status
        };
      }
      return task;
    });
    setTasks(updatedTasks);
  }, []);

  useEffect(() => {
    if (taskHistory.length > 0) {
      setAnalytics(generateAnalytics());
      setLoading(false);
    }
  }, [taskHistory]);

  const runTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || runningTasks.includes(taskId)) return;

    setRunningTasks(prev => [...prev, taskId]);

    // Simulate task execution
    setTimeout(() => {
      const status = Math.random() < 0.85 ? 'success' : 'failed';
      const now = new Date();
      
      // Update task
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, lastRun: now, lastResult: status } : t
      ));

      // Add to history
      const newHistoryEntry = {
        id: taskHistory.length + 1,
        task: task.name,
        status,
        duration: task.duration + Math.floor(Math.random() * 30),
        timestamp: now,
        details: `Manual run by admin`
      };
      setTaskHistory(prev => [newHistoryEntry, ...prev]);
      setRunningTasks(prev => prev.filter(id => id !== taskId));
    }, 2000);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      const exportData = {
        generatedAt: new Date().toISOString(),
        analytics,
        tasks: tasks.map(t => ({ name: t.name, lastRun: t.lastRun, lastResult: t.lastResult })),
        history: taskHistory
      };
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `maintenance-report-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setExporting(false);
    }, 1000);
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'success': return { bg: '#D1FAE5', text: '#065F46', icon: FiCheckCircle };
      case 'failed': return { bg: '#FEE2E2', text: '#991B1B', icon: FiAlertCircle };
      default: return { bg: '#FEF3C7', text: '#92400E', icon: FiClock };
    }
  };

  if (loading || !analytics) {
    return (
      <div className="system-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading maintenance dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="system-page">
      <div className="page-header">
        <div>
          <h1><FiTool /> System Maintenance</h1>
          <p>Manage maintenance tasks and system health operations</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
        <div className="admin-stat-card highlight" style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' }}>
          <div className="admin-stat-header">
            <span className="admin-stat-title" style={{ color: 'rgba(255,255,255,0.9)' }}>Total Tasks</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF' }}>
              <FiTool size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value" style={{ color: 'white' }}>{analytics.totalTasks}</div>
            <div className="admin-stat-change positive" style={{ color: 'rgba(255,255,255,0.85)' }}>
              <FiArrowUp size={14} /> {analytics.successRate}% success rate
            </div>
            <div className="admin-stat-sub" style={{ color: 'rgba(255,255,255,0.7)' }}>All time tasks</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Successful</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
              <FiCheckCircle size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.successful}</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} /> {((analytics.successful / analytics.totalTasks) * 100).toFixed(0)}% of total
            </div>
            <div className="admin-stat-sub">Completed tasks</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Failed</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(220, 38, 38, 0.15)', color: '#DC2626' }}>
              <FiAlertCircle size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.failed}</div>
            <div className="admin-stat-change negative">
              <FiArrowDown size={14} /> Needs investigation
            </div>
            <div className="admin-stat-sub">Failed tasks</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Avg Duration</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#2563EB' }}>
              <FiClock size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.avgDuration}s</div>
            <div className="admin-stat-change positive">
              <FiArrowDown size={14} /> Normal
            </div>
            <div className="admin-stat-sub">Average task duration</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Cache Size</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#D97706' }}>
              <FiZap size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.cacheSize}</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} /> Needs clearing
            </div>
            <div className="admin-stat-sub">Current cache usage</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Database Size</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#2563EB' }}>
              <FiDatabase size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.dbSize}</div>
            <div className="admin-stat-change positive">
              <FiArrowUp size={14} /> Last backup: {analytics.lastBackup}
            </div>
            <div className="admin-stat-sub">Total database storage</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Log Size</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
              <FiTrash2 size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.logSize}</div>
            <div className="admin-stat-change negative">
              <FiArrowUp size={14} /> Growing
            </div>
            <div className="admin-stat-sub">System log storage</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Critical Issues</span>
            <div className="admin-stat-icon" style={{ background: 'rgba(220, 38, 38, 0.15)', color: '#DC2626' }}>
              <FiShield size={22} />
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{analytics.criticalIssues}</div>
            <div className="admin-stat-change negative">
              <FiArrowDown size={14} /> Requires attention
            </div>
            <div className="admin-stat-sub">Failed tasks to review</div>
          </div>
        </div>
      </div>

      {/* Maintenance Tasks Grid */}
      <h2 style={{ fontSize: '1.25rem', color: '#1F2937', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FiTool /> Maintenance Tasks
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {tasks.map(task => {
          const Icon = task.icon;
          const isRunning = runningTasks.includes(task.id);
          const StatusIcon = task.lastResult ? getStatusStyle(task.lastResult).icon : null;
          
          return (
            <div key={task.id} style={{ 
              background: 'white', 
              padding: '1.5rem', 
              borderRadius: '16px',
              border: '2px solid #E5E7EB',
              boxShadow: '0 4px 15px rgba(124, 58, 237, 0.08)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: `${task.color}20`,
                  color: task.color,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}>
                  {isRunning ? <FiRefreshCw className="spinning" /> : <Icon />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#111827' }}>{task.name}</h3>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#6B7280', lineHeight: '1.4' }}>
                    {task.description}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.8rem' }}>
                <div style={{ background: task.impact === 'high' ? '#FEE2E2' : task.impact === 'medium' ? '#FEF3C7' : '#D1FAE5', 
                  padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: 600,
                  color: task.impact === 'high' ? '#991B1B' : task.impact === 'medium' ? '#92400E' : '#065F46' }}>
                  {task.impact.toUpperCase()} IMPACT
                </div>
                <div style={{ background: '#F3F4F6', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: 500, color: '#374151' }}>
                  ~{task.duration}s
                </div>
              </div>

              {task.lastRun && (
                <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {StatusIcon && <StatusIcon size={12} color={task.lastResult === 'success' ? '#059669' : '#DC2626'} />}
                  Last run: {task.lastRun.toLocaleString()} - 
                  <span style={{ color: task.lastResult === 'success' ? '#059669' : '#DC2626', fontWeight: 600 }}>
                    {task.lastResult}
                  </span>
                </div>
              )}

              <button 
                onClick={() => runTask(task.id)}
                disabled={isRunning}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: isRunning ? '#9CA3AF' : task.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s ease',
                  opacity: isRunning ? 0.7 : 1
                }}
              >
                {isRunning ? (
                  <><FiRefreshCw className="spinning" size={14} /> Running...</>
                ) : (
                  <><Icon size={14} /> Run Task</>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Task History Table */}
      <h2 style={{ fontSize: '1.25rem', color: '#1F2937', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FiClock /> Recent Task History
      </h2>
      <div className="logs-table">
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(124, 58, 237, 0.08)',
          border: '1px solid rgba(124, 58, 237, 0.1)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#7C3AED' }}>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', color: 'white', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Task</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', color: 'white', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', color: 'white', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Duration</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', color: 'white', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Timestamp</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', color: 'white', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {taskHistory.slice(0, 10).map((entry, i) => {
                  const statusStyle = getStatusStyle(entry.status);
                  const StatusIcon = statusStyle.icon;
                  return (
                    <tr key={entry.id} style={{ 
                      borderBottom: i < 9 ? '1px solid #F3F4F6' : 'none',
                      transition: 'background 0.2s ease'
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '0.875rem 1.25rem', fontWeight: 500, color: '#111827', fontSize: '0.875rem' }}>{entry.task}</td>
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <span style={{ 
                          padding: '0.3rem 0.75rem', 
                          background: statusStyle.bg, 
                          color: statusStyle.text, 
                          borderRadius: '8px', 
                          fontSize: '0.75rem', 
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}>
                          <StatusIcon size={12} />
                          {entry.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem', color: '#374151', fontSize: '0.875rem' }}>{entry.duration}s</td>
                      <td style={{ padding: '0.875rem 1.25rem', color: '#6B7280', fontSize: '0.8rem' }}>{entry.timestamp.toLocaleString()}</td>
                      <td style={{ padding: '0.875rem 1.25rem', color: '#6B7280', fontSize: '0.8rem' }}>{entry.details}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;