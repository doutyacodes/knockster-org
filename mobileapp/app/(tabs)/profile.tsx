// Location: app/(tabs)/profile.tsx
// Profile screen with guard info and settings

import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { guard, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await logout();
              // Navigation handled by NavigationGuard
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerSubtitle}>Manage your account</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color="#3B82F6" />
          </View>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  guard?.status === 'active' ? '#10B981' : '#EF4444',
              },
            ]}
          />
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{guard?.username}</Text>
          <Text style={styles.profileRole}>Security Personnel</Text>
        </View>
      </View>

      {/* Organization Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Organization</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={20} color="#64748B" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Organization Name</Text>
              <Text style={styles.infoValue}>
                {guard?.organization?.name || 'Not assigned'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#64748B" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Type</Text>
              <Text style={styles.infoValue}>
                {guard?.organization?.type || 'N/A'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Account Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Details</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color="#64748B" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Username</Text>
              <Text style={styles.infoValue}>{guard?.username}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#64748B" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Status</Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      guard?.status === 'active' ? '#10B98120' : '#EF444420',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        guard?.status === 'active' ? '#10B981' : '#EF4444',
                    },
                  ]}
                >
                  {guard?.status === 'active' ? 'Active' : 'Disabled'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#64748B" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Shift Schedule</Text>
              <Text style={styles.infoValue}>
                {guard?.shiftStartTime && guard?.shiftEndTime
                  ? `${guard.shiftStartTime} - ${guard.shiftEndTime}`
                  : 'Not set'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Coming Soon', 'Change password feature')}
        >
          <Ionicons name="key-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Change Password</Text>
          <Ionicons name="chevron-forward" size={20} color="#64748B" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Coming Soon', 'App settings')}
        >
          <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>App Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#64748B" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Coming Soon', 'Help & support')}
        >
          <Ionicons name="help-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={isLoggingOut}
      >
        <Ionicons
          name="log-out-outline"
          size={20}
          color={isLoggingOut ? '#64748B' : '#EF4444'}
        />
        <Text style={[styles.logoutButtonText, isLoggingOut && styles.disabled]}>
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Knockster Security v1.0.0</Text>
        <Text style={styles.footerSubtext}>© 2024 All rights reserved</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
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
  profileCard: {
    marginHorizontal: 24,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#3B82F620',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#3B82F6',
  },
  statusDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#1E293B',
  },
  profileInfo: {
    alignItems: 'center',
    gap: 4,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileRole: {
    fontSize: 14,
    color: '#64748B',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoContent: {
    flex: 1,
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 24,
    backgroundColor: '#1E293B',
    padding: 18,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
  disabled: {
    color: '#64748B',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 4,
  },
  footerText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 11,
    color: '#334155',
  },
});