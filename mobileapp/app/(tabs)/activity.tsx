// Location: app/(tabs)/activity.tsx
// Activity history screen

import apiService, { RecentScanEvent } from '@/services/apiService';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ActivityScreen() {
  const [activities, setActivities] = useState<RecentScanEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getDashboard();
      if (response.success && response.data) {
        setActivities(response.data.recentActivity || []);
      }
    } catch (error) {
      console.error('Activity load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };

  const filteredActivities = activities.filter((activity) => {
    if (filter === 'all') return true;
    if (filter === 'success') return activity.success;
    if (filter === 'failed') return !activity.success;
    return true;
  });

  const renderActivityItem = ({ item }: { item: RecentScanEvent }) => (
    <View style={styles.activityItem}>
      <View
        style={[
          styles.statusIndicator,
          {
            backgroundColor: item.success ? '#10B98120' : '#EF444420',
          },
        ]}
      >
        <Ionicons
          name={item.success ? 'checkmark' : 'close'}
          size={20}
          color={item.success ? '#10B981' : '#EF4444'}
        />
      </View>

      <View style={styles.activityContent}>
        <Text style={styles.activityName}>{item.guestName}</Text>
        <Text style={styles.activityPhone}>{item.guestPhone}</Text>
        {!item.success && item.failureReason && (
          <Text style={styles.failureReason}>{item.failureReason}</Text>
        )}
        <Text style={styles.activityTime}>{formatTime(item.timestamp)}</Text>
      </View>

      <View
        style={[
          styles.levelBadge,
          { backgroundColor: getLevelColor(item.securityLevel) },
        ]}
      >
        <Text style={styles.levelText}>L{item.securityLevel}</Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading activities...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity History</Text>
        <Text style={styles.headerSubtitle}>{activities.length} total scans</Text>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.filterTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'success' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('success')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'success' && styles.filterTextActive,
            ]}
          >
            Success
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'failed' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('failed')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'failed' && styles.filterTextActive,
            ]}
          >
            Failed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Activity List */}
      <FlatList
        data={filteredActivities}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="documents-outline" size={64} color="#64748B" />
            <Text style={styles.emptyText}>No activities found</Text>
            <Text style={styles.emptySubtext}>
              Scanned invitations will appear here
            </Text>
          </View>
        }
      />
    </View>
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
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
  },
  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
    gap: 2,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activityPhone: {
    fontSize: 13,
    color: '#64748B',
  },
  failureReason: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#475569',
  },
});