// Location: app/(tabs)/index.tsx
// Dashboard screen with stats and recent activity

import { useAuth } from '@/contexts/AuthContext';
import apiService, { RecentScanEvent } from '@/services/apiService';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface DashboardData {
  stats: {
    today: {
      total: number;
      successful: number;
      failed: number;
      successRate: number;
    };
    allTime: {
      total: number;
      successful: number;
      failed: number;
      successRate: number;
    };
    activeInvitations: number;
  };
  recentActivity: RecentScanEvent[];
}

export default function DashboardScreen() {
  const { guard } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getDashboard();
      if (response.success && response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  if (isLoading && !dashboardData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const todayStats = dashboardData?.stats.today || {
    total: 0,
    successful: 0,
    failed: 0,
    successRate: 0,
  };
  const allTimeStats = dashboardData?.stats.allTime || {
    total: 0,
    successful: 0,
    failed: 0,
    successRate: 0,
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.guardName}>{guard?.username}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: guard?.status === 'active' ? '#10B98120' : '#EF444420',
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: guard?.status === 'active' ? '#10B981' : '#EF4444',
              },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              {
                color: guard?.status === 'active' ? '#10B981' : '#EF4444',
              },
            ]}
          >
            {guard?.status === 'active' ? 'On Duty' : 'Off Duty'}
          </Text>
        </View>
      </View>

      {/* Organization Info */}
      {guard?.organization && (
        <View style={styles.orgCard}>
          <Ionicons name="business" size={20} color="#3B82F6" />
          <View style={styles.orgInfo}>
            <Text style={styles.orgName}>{guard.organization.name}</Text>
            <Text style={styles.orgType}>{guard.organization.type}</Text>
          </View>
        </View>
      )}

      {/* Today's Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Performance</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardPrimary]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="scan-outline" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.statValue}>{todayStats.total}</Text>
            <Text style={styles.statLabel}>Total Scans</Text>
          </View>

          <View style={[styles.statCard, styles.statCardSuccess]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{todayStats.successful}</Text>
            <Text style={styles.statLabel}>Successful</Text>
          </View>

          <View style={[styles.statCard, styles.statCardDanger]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="close-circle-outline" size={24} color="#EF4444" />
            </View>
            <Text style={styles.statValue}>{todayStats.failed}</Text>
            <Text style={styles.statLabel}>Failed</Text>
          </View>

          <View style={[styles.statCard, styles.statCardWarning]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="stats-chart-outline" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{todayStats.successRate.toFixed(1)}%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
        </View>
      </View>

      {/* All-Time Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All-Time Statistics</Text>
        <View style={styles.allTimeCard}>
          <View style={styles.allTimeStat}>
            <Text style={styles.allTimeLabel}>Total Scans</Text>
            <Text style={styles.allTimeValue}>{allTimeStats.total.toLocaleString()}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.allTimeStat}>
            <Text style={styles.allTimeLabel}>Success Rate</Text>
            <Text style={[styles.allTimeValue, { color: '#10B981' }]}>
              {allTimeStats.successRate.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.allTimeStat}>
            <Text style={styles.allTimeLabel}>Active Invites</Text>
            <Text style={[styles.allTimeValue, { color: '#3B82F6' }]}>
              {dashboardData?.stats.activeInvitations || 0}
            </Text>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
          <View style={styles.activityList}>
            {dashboardData.recentActivity.slice(0, 5).map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View
                  style={[
                    styles.activityIcon,
                    {
                      backgroundColor: activity.success ? '#10B98120' : '#EF444420',
                    },
                  ]}
                >
                  <Ionicons
                    name={activity.success ? 'checkmark' : 'close'}
                    size={18}
                    color={activity.success ? '#10B981' : '#EF4444'}
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityName}>{activity.guestName}</Text>
                  <Text style={styles.activityPhone}>{activity.guestPhone}</Text>
                  {!activity.success && activity.failureReason && (
                    <Text style={styles.failureReason}>{activity.failureReason}</Text>
                  )}
                </View>
                <View style={styles.activityRight}>
                  <View
                    style={[
                      styles.levelBadge,
                      { backgroundColor: getLevelColor(activity.securityLevel) },
                    ]}
                  >
                    <Text style={styles.levelText}>L{activity.securityLevel}</Text>
                  </View>
                  <Text style={styles.activityTime}>{formatTime(activity.timestamp)}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#64748B" />
            <Text style={styles.emptyText}>No recent activity</Text>
            <Text style={styles.emptySubtext}>Scanned invitations will appear here</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="scan-outline" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.quickActionText}>Scan QR</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="qr-code-outline" size={24} color="#10B981" />
            </View>
            <Text style={styles.quickActionText}>My QR</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="list-outline" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.quickActionText}>Activity</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer Spacing */}
      <View style={styles.footerSpacing} />
    </ScrollView>
  );
}

const getLevelColor = (level: number): string => {
  switch (level) {
    case 1:
      return '#3B82F620';
    case 2:
      return '#10B98120';
    case 3:
      return '#F59E0B20';
    case 4:
      return '#EF444420';
    default:
      return '#64748B20';
  }
};

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleString('en-US', options);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  guardName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  orgCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  orgInfo: {
    flex: 1,
  },
  orgName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  orgType: {
    fontSize: 13,
    color: '#64748B',
    textTransform: 'capitalize',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (SCREEN_WIDTH - 60) / 2,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    gap: 8,
  },
  statCardPrimary: {
    borderColor: '#3B82F640',
  },
  statCardSuccess: {
    borderColor: '#10B98140',
  },
  statCardDanger: {
    borderColor: '#EF444440',
  },
  statCardWarning: {
    borderColor: '#F59E0B40',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  allTimeCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  allTimeStat: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  allTimeLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  allTimeValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  divider: {
    width: 1,
    backgroundColor: '#334155',
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
    gap: 2,
  },
  activityName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activityPhone: {
    fontSize: 12,
    color: '#64748B',
  },
  failureReason: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 2,
  },
  activityRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  activityTime: {
    fontSize: 10,
    color: '#475569',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#475569',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    gap: 8,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footerSpacing: {
    height: 24,
  },
});
