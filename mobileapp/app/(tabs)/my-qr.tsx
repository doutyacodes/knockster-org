// Location: app/(tabs)/my-qr.tsx
// Guard's QR code for L3/L4 verification

import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/apiService';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function MyQRScreen() {
  const { guard } = useAuth();
  const [qrData, setQrData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQRCode();
  }, []);

  const loadQRCode = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getGuardQR();
      if (response.success && response.data) {
        setQrData(response.data.qrCode);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load QR code');
      console.error('QR load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Generating QR code...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My QR Code</Text>
        <Text style={styles.headerSubtitle}>For L3/L4 guest verification</Text>
      </View>

      {/* Profile Info */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color="#3B82F6" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{guard?.username}</Text>
          <Text style={styles.profileOrg}>
            {guard?.organization?.name || 'No Organization'}
          </Text>
          <View style={styles.shiftInfo}>
            <Ionicons name="time-outline" size={14} color="#64748B" />
            <Text style={styles.shiftText}>
              {guard?.shiftStartTime && guard?.shiftEndTime
                ? `${guard.shiftStartTime} - ${guard.shiftEndTime}`
                : 'No shift assigned'}
            </Text>
          </View>
        </View>
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
                color: guard?.status === 'active' ? '#10B981' : '#EF4444',
              },
            ]}
          >
            {guard?.status === 'active' ? 'On Duty' : 'Off Duty'}
          </Text>
        </View>
      </View>

      {/* QR Code */}
      <View style={styles.qrContainer}>
        <View style={styles.qrCard}>
          {qrData ? (
            <QRCode
              value={qrData}
              size={SCREEN_WIDTH - 100}
              backgroundColor="#FFFFFF"
              color="#000000"
            />
          ) : (
            <View style={styles.qrPlaceholder}>
              <Ionicons name="qr-code" size={120} color="#334155" />
              <Text style={styles.qrPlaceholderText}>QR code unavailable</Text>
            </View>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
          <Text style={styles.instructionsText}>
            Guest scans this code for L3/L4 access verification
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={loadQRCode}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-outline" size={20} color="#3B82F6" />
          <Text style={styles.actionButtonText}>Refresh QR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F620',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileOrg: {
    fontSize: 13,
    color: '#64748B',
  },
  shiftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  shiftText: {
    fontSize: 12,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  qrContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  qrPlaceholder: {
    width: SCREEN_WIDTH - 100,
    height: SCREEN_WIDTH - 100,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  qrPlaceholderText: {
    fontSize: 14,
    color: '#64748B',
  },
  instructionsCard: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  instructionsText: {
    flex: 1,
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
});