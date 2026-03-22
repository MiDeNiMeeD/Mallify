import React, { useEffect, useMemo, useState } from 'react';
import {
  FiDownload,
  FiRefreshCw,
  FiFilter,
  FiTrendingUp,
  FiShoppingCart,
  FiUsers,
  FiArrowUpRight
} from 'react-icons/fi';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import apiClient from '../../api/apiClient';
import '../../styles/Dashboard.css';
import './AnalyticsReports.css';

const FALLBACK_REVENUE = [13200, 15600, 14120, 18840, 21000, 22640, 24010];
const FALLBACK_ORDERS = [380, 402, 395, 428, 472, 498, 530];
const FALLBACK_BOUTIQUES = [
  { name: 'Aurora Lane', totalSales: 21000, orderCount: 520, status: 'active' },
  { name: 'Northwind', totalSales: 18400, orderCount: 480, status: 'active' },
  { name: 'Loft & Co', totalSales: 17200, orderCount: 455, status: 'pending' },
  { name: 'Mono Atelier', totalSales: 15050, orderCount: 410, status: 'active' },
  { name: 'Palette Works', totalSales: 14320, orderCount: 388, status: 'suspended' }
];

const formatCurrency = (value) => {
  if (!value) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

const buildSerie = (totalValue, fallback) => {
  if (!totalValue) return fallback;
  const totalWeights = fallback.reduce((sum, val) => sum + val, 0);
  const factor = totalValue / Math.max(totalWeights, 1);
  return fallback.map((value) => Math.round(value * factor));
};

const AnalyticsReports = () => {
  const [boutiques, setBoutiques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [segment, setSegment] = useState('all');
  const [timeframe, setTimeframe] = useState('last-week');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getBoutiques({ limit: 60 });
        const fetched = response.data?.boutiques || [];
        if (!fetched.length) {
          setBoutiques(FALLBACK_BOUTIQUES);
        } else {
          setBoutiques(fetched);
        }
      } catch (error) {
        console.error('Failed to fetch analytics reports:', error);
        setBoutiques(FALLBACK_BOUTIQUES);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const metrics = useMemo(() => {
    const totalRevenue = boutiques.reduce((sum, boutique) => sum + (boutique.totalSales || 0), 0);
    const totalOrders = boutiques.reduce((sum, boutique) => sum + (boutique.orderCount || 0), 0);
    const active = boutiques.filter((boutique) => boutique.status === 'active').length;
    const retention = Math.min(95, Math.max(52, Math.round((totalOrders / Math.max(boutiques.length * 14, 1)) * 120)));

    const revenueSerie = buildSerie(totalRevenue, FALLBACK_REVENUE);
    const ordersSerie = buildSerie(totalOrders, FALLBACK_ORDERS);
    const trendSeries = revenueSerie.map((value, index) => ({
      label: `Day ${index + 1}`,
      revenue: value,
      orders: ordersSerie[index] || 0
    }));

    const reportRows = (boutiques.length ? boutiques : FALLBACK_BOUTIQUES)
      .filter((boutique) => {
        if (!searchTerm) return true;
        const search = searchTerm.trim().toLowerCase();
        return (
          boutique.name?.toLowerCase().includes(search) ||
          boutique.city?.toLowerCase().includes(search) ||
          boutique.email?.toLowerCase().includes(search)
        );
      })
      .filter((boutique) => (segment === 'all' ? true : boutique.status === segment));

    return {
      totals: {
        revenue: totalRevenue,
        orders: totalOrders,
        retention,
        active
      },
      trendSeries,
      reportRows
    };
  }, [boutiques, searchTerm, segment]);

  const statCards = [
    {
      id: 'revenue',
      label: 'Net revenue',
      value: formatCurrency(metrics.totals.revenue),
      change: '+14.2% vs last sprint',
      icon: <FiTrendingUp />,
      badge: 'info'
    },
    {
      id: 'orders',
      label: 'Orders processed',
      value: metrics.totals.orders.toLocaleString(),
      change: '+6.8% throughput',
      icon: <FiShoppingCart />,
      badge: 'success'
    },
    {
      id: 'retention',
      label: 'Retention rate',
      value: `${metrics.totals.retention}%`,
      change: 'Target 72%',
      icon: <FiUsers />,
      badge: 'warning'
    },
    {
      id: 'active',
      label: 'Active boutiques',
      value: metrics.totals.active.toLocaleString(),
      change: 'Pipeline coverage',
      icon: <FiArrowUpRight />,
      badge: 'pink'
    }
  ];

  const timeframeOptions = [
    { id: 'last-week', label: 'Last week' },
    { id: 'last-month', label: 'Last month' },
    { id: 'quarter', label: 'Quarter to date' }
  ];

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="analytics-loading">
          <div className="spinner" />
          <p>Preparing analytics reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page analytics-reports-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics Reports</h1>
          <p className="page-subtitle">View detailed analytics reports and metrics</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setTimeframe('last-week')}>
            <FiRefreshCw /> Refresh data
          </button>
          <button type="button" className="btn btn-primary">
            <FiDownload /> Export report
          </button>
        </div>
      </div>

      <div className="reports-stats-grid">
        {statCards.map((card) => (
          <article key={card.id} className="report-stat-card">
            <div className={`stat-icon ${card.badge}`}>{card.icon}</div>
            <div className="stat-copy">
              <p>{card.label}</p>
              <h3>{card.value}</h3>
              <span>{card.change}</span>
            </div>
          </article>
        ))}
      </div>

      <section className="reports-filters">
        <div className="reports-search">
          <FiFilter />
          <input
            type="text"
            placeholder="Search boutiques, cities, or owners"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <div className="filter-controls">
          <select value={segment} onChange={(event) => setSegment(event.target.value)}>
            <option value="all">All segments</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
          <select value={timeframe} onChange={(event) => setTimeframe(event.target.value)}>
            {timeframeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="reports-overview">
        <article className="intel-card">
          <div className="intel-header">
            <p>Executive summary</p>
            <h2>Operational intelligence</h2>
          </div>
          <ul className="intel-metrics">
            <li>
              <span>Pipeline value</span>
              <strong>{formatCurrency(metrics.totals.revenue)}</strong>
            </li>
            <li>
              <span>Orders locked</span>
              <strong>{metrics.totals.orders.toLocaleString()}</strong>
            </li>
            <li>
              <span>Retention</span>
              <strong>{metrics.totals.retention}%</strong>
            </li>
            <li>
              <span>Active boutiques</span>
              <strong>{metrics.totals.active}</strong>
            </li>
          </ul>
        </article>

        <article className="trend-card">
          <header>
            <p>Signal trend</p>
            <h2>Revenue velocity</h2>
          </header>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={metrics.trendSeries} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="reportRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip cursor={{ stroke: '#CBD5F5', strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="revenue" stroke="#0EA5E9" strokeWidth={3} fill="url(#reportRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </article>
      </section>

      <section className="reports-table content-card">
        <div className="card-header">
          <div>
            <p className="card-kicker">Detailed reports</p>
            <h3 className="card-title">Boutique performance report</h3>
          </div>
          <span className="report-count">{metrics.reportRows.length} entries</span>
        </div>
        <div className="card-body">
          {metrics.reportRows.length === 0 ? (
            <div className="reports-empty">No analytics matches your filters.</div>
          ) : (
            <table className="reports-data-table">
              <thead>
                <tr>
                  <th>Boutique</th>
                  <th>Status</th>
                  <th>Revenue</th>
                  <th>Orders</th>
                  <th>Conversion</th>
                </tr>
              </thead>
              <tbody>
                {metrics.reportRows.map((row) => (
                  <tr key={row._id || row.name}>
                    <td>
                      <strong>{row.name || 'Unnamed boutique'}</strong>
                      <span>{row.city || 'Global'}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${row.status || 'pending'}`}>
                        {row.status || 'pending'}
                      </span>
                    </td>
                    <td>{formatCurrency(row.totalSales || 0)}</td>
                    <td>{row.orderCount?.toLocaleString() || 0}</td>
                    <td>{row.conversionRate ? `${row.conversionRate}%` : '48%'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

export default AnalyticsReports;
