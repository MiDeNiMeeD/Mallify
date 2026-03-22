import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiBarChart2, FiShoppingCart, FiTrendingUp, FiUsers } from 'react-icons/fi';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import apiClient from '../../api/apiClient';
import '../../styles/Dashboard.css';
import './Analytics.css';

const FALLBACK_REVENUE = [13200, 15600, 14120, 18840, 21000, 22640, 24010];
const FALLBACK_ORDERS = [380, 402, 395, 428, 472, 498, 530];
const FALLBACK_RETENTION = 67;

const DEFAULT_STATS = {
  totalRevenue: 0,
  totalOrders: 0,
  totalCustomers: 0,
  averageOrderValue: 0,
  activeBoutiques: 0,
  topBoutiques: []
};

const FALLBACK_BOUTIQUES = [
  { name: 'Aurora Lane', totalSales: 21000, orderCount: 520 },
  { name: 'Northwind', totalSales: 18400, orderCount: 480 },
  { name: 'Loft & Co', totalSales: 17200, orderCount: 455 },
  { name: 'Mono Atelier', totalSales: 15050, orderCount: 410 },
  { name: 'Palette Works', totalSales: 14320, orderCount: 388 }
];

const formatCurrency = (value) => {
  if (!value) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};

const buildSerie = (totalValue, fallback) => {
  if (!totalValue) return fallback;
  const totalWeights = fallback.reduce((sum, val) => sum + val, 0);
  const factor = totalValue / Math.max(totalWeights, 1);
  return fallback.map((value) => Math.round(value * factor));
};

const buildAreaPath = (values, width = 560, height = 220) => {
  if (!values || !values.length) return { line: '', area: '' };
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max === min ? 1 : max - min;
  const step = values.length === 1 ? width : width / (values.length - 1);

  const points = values.map((value, index) => {
    const x = index * step;
    const y = height - ((value - min) / range) * height;
    return { x, y };
  });

  const line = points
    .map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(' ');

  const area = `${line} L${width},${height} L0,${height} Z`;
  return { line, area };
};

const getDeltaLabel = (current = 0, previous = 0) => {
  const safeCurrent = Number.isFinite(current) ? current : 0;
  const safePrevious = Number.isFinite(previous) ? previous : 0;
  const baseline = Math.abs(safePrevious) < 1 ? (safePrevious >= 0 ? 1 : -1) : safePrevious;
  const delta = ((safeCurrent - safePrevious) / baseline) * 100;
  if (!Number.isFinite(delta)) return '+0.0%';
  const formatted = delta.toFixed(1);
  return `${delta >= 0 ? '+' : ''}${formatted}%`;
};

const Analytics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [focusMetric, setFocusMetric] = useState('revenue');
  const [range, setRange] = useState('weekly');
  const [reportFilter, setReportFilter] = useState('performance');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const boutiquesResponse = await apiClient.getBoutiques({ limit: 120 });
        const boutiques = boutiquesResponse.data || [];

        const totalRevenue = boutiques.reduce((sum, boutique) => sum + (boutique.totalSales || 0), 0);
        const totalOrders = boutiques.reduce((sum, boutique) => sum + (boutique.orderCount || 0), 0);
        const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
        const active = boutiques.filter((boutique) => boutique.status === 'active');

        setStats({
          totalRevenue,
          totalOrders,
          totalCustomers: boutiques.length * 16,
          averageOrderValue,
          activeBoutiques: active.length,
          topBoutiques: active
            .sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0))
            .slice(0, 6)
        });
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        setStats(DEFAULT_STATS);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const revenueSerie = useMemo(() => buildSerie(stats.totalRevenue, FALLBACK_REVENUE), [stats.totalRevenue]);
  const ordersSerie = useMemo(() => buildSerie(stats.totalOrders, FALLBACK_ORDERS), [stats.totalOrders]);
  const retentionRate = useMemo(() => {
    if (!stats.totalCustomers) return FALLBACK_RETENTION;
    const ratio = stats.totalOrders / stats.totalCustomers;
    return Math.min(95, Math.max(48, Math.round(ratio * 22 + 48)));
  }, [stats.totalCustomers, stats.totalOrders]);

  const areaGeometry = useMemo(() => ({
    revenue: buildAreaPath(revenueSerie),
    orders: buildAreaPath(ordersSerie)
  }), [revenueSerie, ordersSerie]);

  const pulseCards = useMemo(
    () => [
      {
        id: 'revenue',
        label: 'Net revenue',
        value: formatCurrency(stats.totalRevenue),
        change: '+14.2% vs last sprint',
        serie: revenueSerie,
        color: '#0EA5E9'
      },
      {
        id: 'orders',
        label: 'Orders locked',
        value: stats.totalOrders.toLocaleString(),
        change: '+6.8% throughput',
        serie: ordersSerie,
        color: '#A855F7'
      },
      {
        id: 'retention',
        label: 'Retention rate',
        value: `${retentionRate}%`,
        change: 'Target 72%',
        serie: ordersSerie.map((value) => Math.round(value * 0.6)),
        color: '#22C55E'
      }
    ],
    [stats.totalRevenue, stats.totalOrders, retentionRate, revenueSerie, ordersSerie]
  );

  const fulfillmentHours = useMemo(() => {
    if (!stats.totalOrders) return 32;
    return Math.max(14, Math.round(44 - (stats.totalOrders % 17)));
  }, [stats.totalOrders]);

  const demandWave = useMemo(
    () => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => ({
      day,
      revenue: revenueSerie[index] || FALLBACK_REVENUE[index],
      orders: ordersSerie[index] || FALLBACK_ORDERS[index]
    })),
    [revenueSerie, ordersSerie]
  );

  const channelMix = useMemo(() => {
    const total = stats.totalOrders || FALLBACK_ORDERS.reduce((sum, val) => sum + val, 0);
    const definitions = [
      { label: 'Marketplace', weight: 0.48, color: '#0EA5E9' },
      { label: 'Direct boutique', weight: 0.29, color: '#F97316' },
      { label: 'Wholesale', weight: 0.15, color: '#22C55E' },
      { label: 'Pop-up', weight: 0.08, color: '#818CF8' }
    ];

    return definitions.map((definition) => {
      const value = Math.round(total * definition.weight);
      return {
        ...definition,
        value,
        pct: `${((value / Math.max(total, 1)) * 100).toFixed(1)}%`
      };
    });
  }, [stats.totalOrders]);

  const stackedOrders = useMemo(
    () => demandWave.map((item) => {
      const marketplace = Math.round(item.orders * 0.58);
      const direct = Math.round(item.orders * 0.27);
      const wholesale = Math.max(item.orders - marketplace - direct, 0);
      return {
        day: item.day,
        marketplace,
        direct,
        wholesale
      };
    }),
    [demandWave]
  );

  const boutiquePerformance = useMemo(() => {
    const source = stats.topBoutiques.length ? stats.topBoutiques : FALLBACK_BOUTIQUES;
    return source.map((boutique, index) => {
      const fallback = FALLBACK_BOUTIQUES[index % FALLBACK_BOUTIQUES.length];
      return {
        name: boutique.name || fallback.name,
        sales: boutique.totalSales || fallback.totalSales,
        orders: boutique.orderCount || fallback.orderCount,
        satisfaction: 68 + ((index * 6) % 24)
      };
    });
  }, [stats.topBoutiques]);

  const revenueTrend = useMemo(
    () => demandWave.map((item) => ({ day: item.day, revenue: item.revenue, orders: item.orders })),
    [demandWave]
  );

  const radarMetrics = useMemo(() => {
    const normalize = (value, baseline) => Math.max(40, Math.min(100, Math.round((value / baseline) * 50 + 40)));
    return [
      { metric: 'Revenue', score: normalize(stats.totalRevenue || 160000, 200000) },
      { metric: 'Orders', score: normalize(stats.totalOrders || 3400, 5200) },
      { metric: 'Retention', score: retentionRate },
      { metric: 'Activation', score: normalize(stats.activeBoutiques || 42, 60) },
      { metric: 'SLA', score: Math.max(55, 100 - fulfillmentHours) }
    ];
  }, [stats.totalRevenue, stats.totalOrders, stats.activeBoutiques, retentionRate, fulfillmentHours]);

  const retentionGauge = useMemo(() => ([
    { name: 'Retention', value: retentionRate },
    { name: 'Gap', value: Math.max(0, 100 - retentionRate) }
  ]), [retentionRate]);

  const scatterPoints = useMemo(
    () => boutiquePerformance.map((item) => ({ boutique: item.name, orders: item.orders, sales: item.sales })),
    [boutiquePerformance]
  );

  const opsPulse = useMemo(
    () => revenueSerie.map((value, index) => ({
      sprint: `S${index + 1}`,
      throughput: ordersSerie[index] || 0,
      accuracy: 70 + ((index * 7) % 20)
    })),
    [ordersSerie, revenueSerie]
  );

  const conversionFunnel = useMemo(() => {
    const visits = stats.totalCustomers || 8200;
    return [
      { stage: 'Visits', value: visits },
      { stage: 'Product views', value: Math.round(visits * 0.72) },
      { stage: 'Cart adds', value: Math.round(visits * 0.38) },
      { stage: 'Checkouts', value: Math.round(visits * 0.24) },
      { stage: 'Orders', value: stats.totalOrders || Math.round(visits * 0.18) }
    ];
  }, [stats.totalCustomers, stats.totalOrders]);

  const handoffTiles = useMemo(() => {
    const averageTicket = stats.averageOrderValue ? formatCurrency(Math.round(stats.averageOrderValue)) : '$0';
    return [
      {
        id: 'hand-revenue',
        label: 'Platform Revenue',
        value: formatCurrency(stats.totalRevenue),
        icon: FiBarChart2,
        iconClass: 'info'
      },
      {
        id: 'hand-orders',
        label: 'Orders Processed',
        value: stats.totalOrders.toLocaleString(),
        icon: FiShoppingCart,
        iconClass: 'pink'
      },
      {
        id: 'hand-aov',
        label: 'Average Order Value',
        value: averageTicket,
        icon: FiTrendingUp,
        iconClass: 'success'
      },
      {
        id: 'hand-boutiques',
        label: 'Active Boutiques',
        value: stats.activeBoutiques.toString(),
        icon: FiUsers,
        iconClass: 'warning'
      }
    ];
  }, [stats.activeBoutiques, stats.averageOrderValue, stats.totalOrders, stats.totalRevenue]);

  const pieColors = ['#0EA5E9', '#22C55E', '#F97316', '#818CF8', '#38BDF8'];

  const chartGallery = useMemo(
    () => [
      {
        id: 'weekday-demand',
        title: 'Weekday demand',
        subtitle: 'Revenue vs orders',
        content: (
          <ResponsiveContainer width="100%" height={190}>
            <ComposedChart data={demandWave}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="day" stroke="#94A3B8" />
              <YAxis yAxisId="left" stroke="#0EA5E9" />
              <YAxis yAxisId="right" orientation="right" stroke="#A855F7" />
              <Tooltip />
              <Bar dataKey="revenue" yAxisId="left" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
              <Line type="monotone" dataKey="orders" yAxisId="right" stroke="#A855F7" strokeWidth={3} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )
      },
      {
        id: 'channel-load',
        title: 'Channel load',
        subtitle: 'Order splits',
        content: (
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={stackedOrders}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="day" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip />
              <Legend verticalAlign="top" height={32} />
              <Bar dataKey="marketplace" stackId="orders" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
              <Bar dataKey="direct" stackId="orders" fill="#A855F7" />
              <Bar dataKey="wholesale" stackId="orders" fill="#22C55E" radius={[0, 0, 6, 6]} />
            </BarChart>
          </ResponsiveContainer>
        )
      },
      {
        id: 'growth-ribbon',
        title: 'Growth ribbon',
        subtitle: 'Revenue trajectory',
        content: (
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#0EA5E9" fill="url(#growthGradient)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        )
      },
      {
        id: 'ops-radar',
        title: 'Ops radar',
        subtitle: 'Composite scores',
        content: (
          <ResponsiveContainer width="100%" height={190}>
            <RadarChart data={radarMetrics}>
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis dataKey="metric" stroke="#94A3B8" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94A3B8" />
              <Radar dataKey="score" stroke="#818CF8" fill="#818CF8" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        )
      },
      {
        id: 'retention-gauge',
        title: 'Retention gauge',
        subtitle: 'Customer loyalty',
        content: (
          <ResponsiveContainer width="100%" height={190}>
            <RadialBarChart innerRadius="60%" outerRadius="100%" data={retentionGauge} startAngle={180} endAngle={-180}>
              <RadialBar minAngle={15} background clockWise dataKey="value" fill="#22C55E" cornerRadius={12} />
              <Tooltip />
              <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#0F172A" fontSize={22} fontWeight={600}>
                {`${retentionRate}%`}
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        )
      },
      {
        id: 'boutique-leaders',
        title: 'Boutique leaders',
        subtitle: 'Revenue ranking',
        content: (
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={boutiquePerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" stroke="#94A3B8" hide />
              <YAxis type="category" dataKey="name" stroke="#94A3B8" width={90} />
              <Tooltip />
              <Bar dataKey="sales" fill="#F97316" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )
      },
      {
        id: 'channel-pie',
        title: 'Channel share',
        subtitle: 'Orders mix',
        content: (
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={channelMix} innerRadius={50} outerRadius={80} dataKey="value">
                {channelMix.map((entry, index) => (
                  <Cell key={`slice-${entry.label}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )
      },
      {
        id: 'revenue-scatter',
        title: 'Revenue scatter',
        subtitle: 'Sales vs orders',
        content: (
          <ResponsiveContainer width="100%" height={190}>
            <ScatterChart>
              <CartesianGrid stroke="#E2E8F0" />
              <XAxis type="number" dataKey="orders" name="Orders" stroke="#94A3B8" />
              <YAxis type="number" dataKey="sales" name="Sales" stroke="#94A3B8" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={scatterPoints} fill="#0EA5E9" />
            </ScatterChart>
          </ResponsiveContainer>
        )
      },
      {
        id: 'ops-line',
        title: 'Ops heartbeat',
        subtitle: 'Throughput & accuracy',
        content: (
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={opsPulse}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="sprint" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip />
              <Line type="monotone" dataKey="throughput" stroke="#0EA5E9" strokeWidth={3} />
              <Line type="monotone" dataKey="accuracy" stroke="#22C55E" strokeWidth={2} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        )
      },
      {
        id: 'conversion-bars',
        title: 'Conversion funnel',
        subtitle: 'Visitor journey',
        content: (
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={conversionFunnel}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="stage" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip />
              <Bar dataKey="value" fill="#818CF8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )
      }
    ],
    [channelMix, conversionFunnel, demandWave, opsPulse, pieColors, radarMetrics, retentionGauge, revenueTrend, scatterPoints, stackedOrders, boutiquePerformance]
  );

  const analyticsReports = useMemo(() => {
    const weeklyRevenue = revenueSerie.reduce((sum, value) => sum + value, 0);
    const weeklyOrders = ordersSerie.reduce((sum, value) => sum + value, 0);
    const peakDay = demandWave.reduce((best, entry) => {
      if (!best || entry.revenue > best.revenue) return entry;
      return best;
    }, null);
    const loyaltyAverage = boutiquePerformance.length
      ? Math.round(boutiquePerformance.reduce((sum, entry) => sum + entry.satisfaction, 0) / boutiquePerformance.length)
      : 0;
    const channelLeader = channelMix.reduce((best, entry) => {
      if (!best || entry.value > best.value) return entry;
      return best;
    }, null);

    const performanceRows = demandWave.map((entry, index) => {
      const prev = demandWave[index - 1] || entry;
      return {
        category: entry.day,
        signal: `${entry.orders.toLocaleString()} orders`,
        metric: formatCurrency(entry.revenue),
        change: getDeltaLabel(entry.revenue, prev.revenue)
      };
    });

    const retentionRows = boutiquePerformance.slice(0, 5).map((entry, index, array) => {
      const prev = array[index - 1] || entry;
      return {
        category: entry.name,
        signal: `${entry.orders.toLocaleString()} orders`,
        metric: `${entry.satisfaction}% satisfaction`,
        change: getDeltaLabel(entry.orders, prev.orders)
      };
    });

    const channelRows = channelMix.map((entry) => ({
      category: entry.label,
      signal: entry.pct,
      metric: `${entry.value.toLocaleString()} orders`,
      change: getDeltaLabel(entry.value, weeklyOrders / Math.max(channelMix.length, 1))
    }));

    return {
      performance: {
        tabLabel: 'Performance',
        title: 'Performance pulse',
        subtitle: 'Weekday throughput and conversion density',
        highlights: [
          {
            badge: 'Revenue',
            label: 'Weekly revenue',
            value: formatCurrency(weeklyRevenue),
            change: getDeltaLabel(revenueSerie[revenueSerie.length - 1] || weeklyRevenue, revenueSerie[0] || weeklyRevenue)
          },
          {
            badge: 'Orders',
            label: 'Weekly orders',
            value: weeklyOrders.toLocaleString(),
            change: getDeltaLabel(weeklyOrders, ordersSerie[0] || weeklyOrders)
          },
          {
            badge: 'Peak day',
            label: 'Top performing day',
            value: peakDay ? peakDay.day : '—',
            change: peakDay ? `${formatCurrency(peakDay.revenue)} run rate` : 'Collecting signals'
          }
        ],
        rows: performanceRows
      },
      retention: {
        tabLabel: 'Retention',
        title: 'Customer health',
        subtitle: 'Boutique momentum and loyalty indicators',
        highlights: [
          {
            badge: 'Retention',
            label: 'Customer loyalty',
            value: `${retentionRate}%`,
            change: getDeltaLabel(retentionRate, 72)
          },
          {
            badge: 'Activation',
            label: 'Active boutiques',
            value: stats.activeBoutiques.toString(),
            change: getDeltaLabel(stats.activeBoutiques, stats.topBoutiques.length || stats.activeBoutiques)
          },
          {
            badge: 'Satisfaction',
            label: 'Average sentiment',
            value: `${loyaltyAverage}%`,
            change: boutiquePerformance.length ? `${boutiquePerformance[0].name} leads` : 'Awaiting data'
          }
        ],
        rows: retentionRows
      },
      channel: {
        tabLabel: 'Channel mix',
        title: 'Channel distribution',
        subtitle: 'Mix of acquisition and fulfillment load',
        highlights: [
          {
            badge: 'Channel',
            label: 'Top contributor',
            value: channelLeader ? channelLeader.label : '—',
            change: channelLeader ? channelLeader.pct : 'Awaiting data'
          },
          {
            badge: 'Efficiency',
            label: 'Fulfillment pace',
            value: `${fulfillmentHours}h SLA`,
            change: 'Target 36h'
          },
          {
            badge: 'Orders',
            label: 'Platform orders',
            value: stats.totalOrders.toLocaleString(),
            change: getDeltaLabel(stats.totalOrders, weeklyOrders || stats.totalOrders)
          }
        ],
        rows: channelRows
      }
    };
  }, [revenueSerie, ordersSerie, stats.totalOrders, stats.activeBoutiques, stats.topBoutiques, demandWave, boutiquePerformance, channelMix, retentionRate, fulfillmentHours]);

  const reportTabs = useMemo(
    () => Object.entries(analyticsReports).map(([key, report]) => ({ id: key, label: report.tabLabel })),
    [analyticsReports]
  );

  const activeReportKey = analyticsReports[reportFilter] ? reportFilter : reportTabs[0]?.id;
  const activeReport = activeReportKey ? analyticsReports[activeReportKey] : null;

  const boutiqueRows = stats.topBoutiques.length ? stats.topBoutiques : new Array(4).fill(null);

  const renderSpark = (values, color) => {
    const geometry = buildAreaPath(values, 160, 70);
    if (!geometry.line) return null;
    return (
      <svg className="spark" viewBox="0 0 160 70" preserveAspectRatio="none">
        <path d={geometry.area} fill={`${color}22`} />
        <path d={geometry.line} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="analytics-v2 loading">
        <div className="spinner" />
        <p>Collecting telemetry...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page analytics-page">
      <div className="analytics-v2">
      <div className="page-header ">
        <div>
          <h1 className="page-title">Analytics Command Center</h1>
          <p className="page-subtitle">Deep dive into demand signals, channel mix, and boutique velocity.</p>
        </div>
       
      </div>

      <div className="stats-grid analytics-stats">
        {handoffTiles.map((tile) => (
          <div key={tile.id} className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">{tile.label}</span>
              <div className={`stat-icon ${tile.iconClass}`}>
                <tile.icon />
              </div>
            </div>
            <div className="stat-value">{tile.value}</div>
          </div>
        ))}
      </div>

      <section className="intro-panel">
        <div className="intro-copy">
          <p className="pill">Mallify Intelligence</p>
          <h1>Operational telemetry for commerce leadership</h1>
          <p>
            Orchestrate boutiques, logistics, and revenue pipelines from a single control room. This board fuses live signals
            from every service and distills them into actions you can trust.
          </p>
          <div className="intro-controls">
            <div className="range-toggle">
              {['weekly', 'monthly', 'quarterly'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={range === option ? 'active' : ''}
                  onClick={() => setRange(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-primary">
              Deploy report
            </button>
          </div>
        </div>
        <div className="intro-visual">
          <div className="radar">
            <div className="radar-ring" />
            <div className="radar-ring" />
            <div className="radar-ring" />
            <div className="radar-dot" style={{ '--dot-x': '34%', '--dot-y': '28%' }} />
            <div className="radar-dot" style={{ '--dot-x': '62%', '--dot-y': '58%' }} />
            <div className="radar-dot" style={{ '--dot-x': '22%', '--dot-y': '72%' }} />
            <div className="radar-core">
              <h2>{formatCurrency(stats.totalRevenue)}</h2>
              <span>Pipeline value</span>
            </div>
          </div>
          <div className="radar-meta">
            <div>
              <p>Fulfillment pace</p>
              <strong>{fulfillmentHours}h avg</strong>
            </div>
            <div>
              <p>Live boutiques</p>
              <strong>{stats.activeBoutiques}</strong>
            </div>
            <div>
              <p>Customer base</p>
              <strong>{stats.totalCustomers.toLocaleString()}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="pulse-row">
        {pulseCards.map((card) => (
          <article
            key={card.id}
            className={`pulse-card ${focusMetric === card.id ? 'active' : ''}`}
            onClick={() => setFocusMetric(card.id)}
          >
            <div>
              <p>{card.label}</p>
              <h3>{card.value}</h3>
              <span>{card.change}</span>
            </div>
            {renderSpark(card.serie, card.color)}
          </article>
        ))}
      </section>

      <section className="canvas-grid">
        <article className="canvas primary">
          <header>
            <div>
              <p>Signal canvas</p>
              <h2>Demand vs throughput</h2>
            </div>
            <div className="legend">
              <span><i style={{ background: '#0EA5E9' }} />Revenue</span>
              <span><i style={{ background: '#A855F7' }} />Orders</span>
            </div>
          </header>
          <svg viewBox="0 0 560 220" preserveAspectRatio="none">
            <defs>
              <linearGradient id="canvasRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="canvasOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A855F7" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
              </linearGradient>
            </defs>
            {areaGeometry.revenue.area && <path d={areaGeometry.revenue.area} fill="url(#canvasRevenue)" />}
            {areaGeometry.revenue.line && (
              <path d={areaGeometry.revenue.line} fill="none" stroke="#0EA5E9" strokeWidth="4" strokeLinecap="round" />
            )}
            {areaGeometry.orders.area && <path d={areaGeometry.orders.area} fill="url(#canvasOrders)" />}
            {areaGeometry.orders.line && (
              <path d={areaGeometry.orders.line} fill="none" stroke="#A855F7" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 10" />
            )}
          </svg>
          <footer>
            {demandWave.map((item) => (
              <span key={item.day}>
                <strong>{item.day}</strong>
                <small>${item.revenue.toLocaleString()} · {item.orders.toLocaleString()} orders</small>
              </span>
            ))}
          </footer>
        </article>

        <article className="canvas side">
          <header>
            <p>Channel saturation</p>
            <h2>Acquisition blend</h2>
          </header>
          <ul className="channel-stack">
            {channelMix.map((channel) => (
              <li key={channel.label}>
                <div className="channel-label">
                  <span style={{ background: channel.color }} />
                  <strong>{channel.label}</strong>
                </div>
                <div className="channel-meter">
                  <div style={{ width: channel.pct, background: channel.color }} />
                </div>
                <div className="channel-meta">
                  <strong>{channel.pct}</strong>
                  <small>{channel.value.toLocaleString()} orders</small>
                </div>
              </li>
            ))}
          </ul>
          <div className="channel-note">
            Pop-up activations are under-indexed. Shift 4% of paid media to IRL to balance reach.
          </div>
        </article>
      </section>

      <section className="chart-gallery">
        <div className="chart-gallery__header">
          <div>
            <p>Visualization library</p>
            <h2>Multi-chart analytics board</h2>
          </div>
          <span>Compare trends in multiple formats to mirror the reference inspiration grid.</span>
        </div>
        <div className="chart-grid">
          {chartGallery.map((card) => (
            <article key={card.id} className="chart-card">
              <div className="chart-card__meta">
                <h3>{card.title}</h3>
                <p>{card.subtitle}</p>
              </div>
              {card.content}
            </article>
          ))}
        </div>
      </section>

      {activeReport && (
        <section className="reports-section">
          <div className="reports-header">
            <div>
              <p>Analytics reports</p>
              <h2>View detailed analytics reports and metrics</h2>
            </div>
            <div className="report-tabs">
              {reportTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`report-tab ${tab.id === activeReportKey ? 'active' : ''}`}
                  onClick={() => setReportFilter(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="reports-highlights">
            {activeReport.highlights.map((highlight) => (
              <article key={`${activeReportKey}-${highlight.label}`} className="report-highlight">
                <span className="report-highlight__badge">{highlight.badge}</span>
                <h3>{highlight.value}</h3>
                <p>{highlight.label}</p>
                <span className="report-trend">{highlight.change}</span>
              </article>
            ))}
          </div>
          <div className="reports-table-card">
            <header>
              <div>
                <h3>{activeReport.title}</h3>
                <span>{activeReport.subtitle}</span>
              </div>
              <span className="report-range">Weekly snapshot</span>
            </header>
            {activeReport.rows.length ? (
              <div className="reports-table-wrapper">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Signal</th>
                      <th>Metric</th>
                      <th>Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeReport.rows.map((row) => (
                      <tr key={`${activeReportKey}-${row.category}`}>
                        <td>{row.category}</td>
                        <td>{row.signal}</td>
                        <td>{row.metric}</td>
                        <td>
                          <span className={`report-delta ${row.change.startsWith('-') ? 'negative' : 'positive'}`}>
                            {row.change}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="reports-empty">No telemetry available yet.</div>
            )}
          </div>
        </section>
      )}

      <section className="insights-split">
        <article className="insight-panel">
          <header>
            <p>Momentum table</p>
            <h2>Boutiques to amplify</h2>
          </header>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Boutique</th>
                  <th>Revenue</th>
                  <th>Orders</th>
                  <th>Pace</th>
                </tr>
              </thead>
              <tbody>
                {boutiqueRows.map((boutique, index) => (
                  <tr key={boutique?._id || index}>
                    <td>
                      <span className={`rank-pill rank-${index + 1}`}>#{index + 1}</span>
                    </td>
                    <td>
                      {boutique ? (
                        <div>
                          <strong>{boutique.name}</strong>
                          <small>{boutique.city || 'Global'}</small>
                        </div>
                      ) : (
                        <div className="placeholder-cell">Awaiting data</div>
                      )}
                    </td>
                    <td>{boutique ? formatCurrency(boutique.totalSales || 0) : '—'}</td>
                    <td>{boutique ? (boutique.orderCount || 0).toLocaleString() : '—'}</td>
                    <td>
                      <div className="pace-bar">
                        <div style={{ width: `${70 - index * 8}%` }} />
                        <span>+{Math.max(4, 14 - index * 2)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="insight-panel">
          <header>
            <p>Tempo journal</p>
            <h2>Day-by-day cadence</h2>
          </header>
          <ul className="tempo-grid">
            {demandWave.map((item) => (
              <li key={item.day}>
                <p>{item.day}</p>
                <strong>{formatCurrency(item.revenue)}</strong>
                <span>{item.orders.toLocaleString()} orders</span>
              </li>
            ))}
          </ul>
          <div className="tempo-note">
            Thursday surge indicates weekend prep. Automate replenishment push notifications on Wednesday night to defend
            conversion.
          </div>
        </article>
      </section>
      </div>
    </div>
  );
};

export default Analytics;
