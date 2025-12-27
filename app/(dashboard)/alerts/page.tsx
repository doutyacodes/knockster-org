"use client";

import React, { useState, useEffect } from 'react';
import { ICONS } from '@/constants';
import { api } from '@/lib/api-client';

interface Alert {
  id: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  failureReason: string;
  timestamp: string;
  guestName: string;
  guestPhone: string;
  guardUsername: string;
  securityLevel: number;
  invitationId: string;
  invitationStatus: string;
}

interface AlertStats {
  total: number;
  high: number;
  medium: number;
  low: number;
  today: number;
}

interface AlertsData {
  alerts: Alert[];
  stats: AlertStats;
}

const Alerts: React.FC = () => {
  const [alertsData, setAlertsData] = useState<AlertsData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [timeFilter, setTimeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [timeFilter, severityFilter]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get(`/api/alerts?time=${timeFilter}&severity=${severityFilter}`);

      if (data) {
        setAlertsData(data);
        setAlerts(data.alerts || []);
      } else {
        setError('Failed to fetch alerts');
      }
    } catch (err) {
      console.error('Alerts fetch error:', err);
      setError('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const handleDismiss = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const markAllAsRead = () => {
    setAlerts([]);
  };

  if (loading && !alertsData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading alerts...</p>
        </div>
      </div>
    );
  }

  if (error && !alertsData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <ICONS.Warning className="mx-auto text-rose-500 mb-4" size={48} />
          <p className="text-slate-600 font-medium">{error}</p>
          <button
            onClick={fetchAlerts}
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
      <header className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              Security Alerts
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                LIVE
              </span>
            </h1>
            <p className="text-slate-500 mt-1">
              Manage system notifications and critical failures
              {alertsData && <span className="font-semibold"> • {alertsData.stats.total} total alerts</span>}
            </p>
          </div>
          {alerts.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-blue-600 text-sm font-bold hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Time:</span>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg text-sm px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg text-sm px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
            </select>
          </div>

          {alertsData && (
            <div className="flex items-center gap-3 ml-auto">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <span className="text-xs font-medium text-slate-600">High: {alertsData.stats.high}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-xs font-medium text-slate-600">Medium: {alertsData.stats.medium}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs font-medium text-slate-600">Today: {alertsData.stats.today}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="space-y-4">
        {alerts.map((alert) => {
          const isHigh = alert.severity === 'high';
          const isMedium = alert.severity === 'medium';

          return (
            <div
              key={alert.id}
              className={`p-6 bg-white rounded-3xl shadow-sm border-l-4 transition-all hover:translate-x-1 animate-in fade-in slide-in-from-left-2 ${
                isHigh ? 'border-rose-500' : isMedium ? 'border-amber-500' : 'border-blue-500'
              } flex items-start gap-5`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                isHigh ? 'bg-rose-50 text-rose-500' : isMedium ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'
              }`}>
                {alert.type === 'OTP_FAILURE' ? <ICONS.Warning size={24} /> : <ICONS.Alerts size={24} />}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-bold text-slate-900">{alert.failureReason}</p>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    isHigh ? 'bg-rose-500 text-white shadow-sm' : isMedium ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {alert.severity} Priority
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  <span className="font-medium">Guest:</span> {alert.guestName} ({alert.guestPhone})
                  <span className="mx-2">•</span>
                  <span className="font-medium">Guard:</span> {alert.guardUsername}
                  <span className="mx-2">•</span>
                  <span className="font-medium">Security Level:</span> L{alert.securityLevel}
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <ICONS.Time size={14} /> {new Date(alert.timestamp).toLocaleString()}
                  </p>
                  <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    alert.invitationStatus === 'active' ? 'bg-emerald-50 text-emerald-600' :
                    alert.invitationStatus === 'expired' ? 'bg-slate-100 text-slate-600' :
                    'bg-rose-50 text-rose-600'
                  }`}>
                    {alert.invitationStatus?.toUpperCase()}
                  </span>
                  <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    Acknowledge
                  </button>
                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {alerts.length === 0 && (
          <div className="bg-white p-20 rounded-3xl border border-dashed border-slate-200 text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <ICONS.Success className="text-slate-300" size={32} />
            </div>
            <p className="text-slate-500 font-medium">No pending alerts. All systems operational.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Alerts;
