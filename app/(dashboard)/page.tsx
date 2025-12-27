"use client"
import React, { useState, useEffect } from 'react';
import { ICONS, SECURITY_INFO } from '@/constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '@/lib/api-client';

interface DashboardStats {
  activeInvitations: number;
  upcomingVisits: number;
  securityGuards: number;
  alertsPending: number;
}

interface ScanFrequency {
  name: string;
  scans: number;
}

interface TierDistribution {
  name: string;
  value: number;
  count: number;
  color: string;
  [key: string]: string | number;
}


interface Alert {
  id: string;
  type: string;
  time: string;
  message: string;
  guard: string;
  severity?: string;
}

interface OrganizationInfo {
  name: string;
  type: string;
}

interface DashboardData {
  stats: DashboardStats;
  scanFrequency: ScanFrequency[];
  tierDistribution: TierDistribution[];
  alerts: Alert[];
  organizationInfo: OrganizationInfo;
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [timeRange, setTimeRange] = useState('today');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get(`/api/dashboard?range=${timeRange}`);

      if (data) {
        setDashboardData(data);
        setAlerts(data.alerts || []);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const stats = dashboardData ? [
    {
      name: 'Active Invitations',
      value: dashboardData.stats.activeInvitations.toString(),
      icon: ICONS.Invitations,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      name: 'Upcoming Visits',
      value: dashboardData.stats.upcomingVisits.toString(),
      icon: ICONS.Calendar,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100'
    },
    {
      name: 'Security Guards',
      value: dashboardData.stats.securityGuards.toString(),
      icon: ICONS.Personnel,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      name: 'Alerts Pending',
      value: alerts.length.toString(),
      icon: ICONS.Alerts,
      color: 'text-rose-600',
      bg: 'bg-rose-100'
    },
  ] : [];

  const chartData = dashboardData?.scanFrequency || [];
  const distributionData = dashboardData?.tierDistribution || [];

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <ICONS.Warning className="mx-auto text-rose-500 mb-4" size={48} />
          <p className="text-slate-600 font-medium">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              LIVE
            </span>
            Real-time monitoring for {dashboardData?.organizationInfo.name || 'Your Organization'}
          </p>
        </div>
        <button
          onClick={() => window.location.href = '/invitations'}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-sm font-medium"
        >
          <ICONS.Add size={18} />
          Create Invitation
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group">
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.name}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scans Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900">Scan Frequency</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                LIVE
              </span>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="scans" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Security Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Tier Distribution</h3>
          <p className="text-sm text-slate-500 mb-8">Percentage of L1–L4 invites</p>
          <div className="h-[200px] flex justify-center items-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {distributionData.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                <span className="text-xs font-medium text-slate-600">{d.name}: {d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Alerts Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <ICONS.Alerts size={18} className="text-rose-500" />
            Critical Security Alerts ({alerts.length})
          </h3>
          <button className="text-blue-600 text-sm font-medium hover:underline">View all</button>
        </div>
        <div className="divide-y divide-slate-100">
          {alerts.length > 0 ? alerts.map((alert) => (
            <div key={alert.id} className="px-6 py-4 hover:bg-slate-50/80 transition-all flex items-center justify-between group">
              <div className="flex gap-4">
                <div className="mt-1">
                  <ICONS.Warning className="text-rose-500" size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{alert.message}</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <ICONS.Time size={12} /> {alert.time} • Reported by <span className="font-medium text-slate-700">{alert.guard}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => dismissAlert(alert.id)}
                  className="px-3 py-1 text-[10px] font-bold text-slate-400 border border-slate-200 rounded-lg hover:text-slate-600 hover:border-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Dismiss
                </button>
                <ICONS.ArrowRight className="text-slate-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" size={20} />
              </div>
            </div>
          )) : (
            <div className="p-12 text-center text-slate-400">
              <ICONS.Success size={40} className="mx-auto mb-2 text-emerald-400 opacity-20" />
              <p className="text-sm font-medium">All security protocols cleared</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
