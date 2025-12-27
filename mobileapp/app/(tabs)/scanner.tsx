// Location: app/(tabs)/scanner.tsx
// QR Scanner screen with expo-camera integration

import apiService from '@/services/apiService';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface ScanResult {
  success: boolean;
  message: string;
  guestName?: string;
  guestPhone?: string;
  securityLevel?: number;
  requiresOtp?: boolean;
  invitationId?: string;
  qrCode?: string;
}

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [manualQrCode, setManualQrCode] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingOtpData, setPendingOtpData] = useState<{
    invitationId: string;
    qrCode: string;
  } | null>(null);

  // Animated scanning line
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!scanned && permission?.granted) {
      // Continuous scanning animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [scanned, permission]);

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (scanned || isProcessing) return;

    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await processScan(data);
  };

  const processScan = async (qrData: string) => {
    try {
      setIsProcessing(true);

      // Parse QR data
      let parsedData: { invitationId: string; qrCode: string };
      try {
        parsedData = JSON.parse(qrData);
      } catch {
        throw new Error('Invalid QR code format');
      }

      if (!parsedData.invitationId || !parsedData.qrCode) {
        throw new Error('Missing required QR data');
      }

      // Call scan API
      const response = await apiService.scanGuest(
        parsedData.invitationId,
        parsedData.qrCode
      );

      if (response.success && response.data) {
        const { status, invitation, message } = response.data;

        if (status === 'pending_otp') {
          // L2 invitation - requires OTP
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          setPendingOtpData(parsedData);
          setScanResult({
            success: true,
            message: 'OTP Required',
            guestName: invitation.guestName,
            guestPhone: invitation.guestPhone,
            securityLevel: invitation.securityLevel,
            requiresOtp: true,
            invitationId: parsedData.invitationId,
            qrCode: parsedData.qrCode,
          });
          setShowOtpModal(true);
        } else if (status === 'success') {
          // L1 invitation - access granted
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setScanResult({
            success: true,
            message: message || 'Access Granted',
            guestName: invitation.guestName,
            guestPhone: invitation.guestPhone,
            securityLevel: invitation.securityLevel,
            requiresOtp: false,
          });
        } else {
          throw new Error(message || 'Scan failed');
        }
      } else {
        throw new Error(response.error || 'Scan failed');
      }
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setScanResult({
        success: false,
        message: error.message || 'Scan failed',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || !pendingOtpData) return;

    try {
      setIsProcessing(true);

      const response = await apiService.verifyOtp(
        pendingOtpData.invitationId,
        pendingOtpData.qrCode,
        otpCode
      );

      if (response.success && response.data) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        setScanResult({
          success: true,
          message: response.data.message || 'Access Granted',
          guestName: scanResult?.guestName,
          guestPhone: scanResult?.guestPhone,
          securityLevel: scanResult?.securityLevel,
          requiresOtp: false,
        });

        setShowOtpModal(false);
        setOtpCode('');
        setPendingOtpData(null);
      } else {
        throw new Error(response.error || 'Invalid OTP');
      }
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'OTP verification failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualEntry = async () => {
    if (!manualQrCode.trim()) {
      Alert.alert('Error', 'Please enter QR code data');
      return;
    }

    setShowManualEntry(false);
    setScanned(true);
    await processScan(manualQrCode);
    setManualQrCode('');
  };

  const resetScanner = () => {
    setScanned(false);
    setScanResult(null);
    setOtpCode('');
    setPendingOtpData(null);
  };

  // Request permission if not granted
  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionCard}>
          <View style={styles.permissionIconContainer}>
            <Ionicons name="camera-outline" size={64} color="#3B82F6" />
          </View>
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            Knockster Security needs camera access to scan guest QR codes
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>QR Scanner</Text>
        <Text style={styles.headerSubtitle}>Point camera at guest QR code</Text>
      </View>

      {/* Camera View or Result */}
      {!scanned ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
            enableTorch={flashEnabled}
          />

          {/* Scan Frame Overlay */}
          <View style={styles.overlay}>
            <View style={styles.scanFrame}>
              {/* Corner indicators */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />

              {/* Animated scan line */}
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [{ translateY: scanLineTranslateY }],
                  },
                ]}
              />
            </View>

            <View style={styles.scanInstruction}>
              <Ionicons name="qr-code-outline" size={24} color="#3B82F6" />
              <Text style={styles.scanInstructionText}>
                Align QR code within the frame
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.resultContainer}>
          <View
            style={[
              styles.resultCard,
              {
                borderColor: scanResult?.success ? '#10B981' : '#EF4444',
              },
            ]}
          >
            <View
              style={[
                styles.resultIconContainer,
                {
                  backgroundColor: scanResult?.success ? '#10B98120' : '#EF444420',
                },
              ]}
            >
              <Ionicons
                name={scanResult?.success ? 'checkmark-circle' : 'close-circle'}
                size={64}
                color={scanResult?.success ? '#10B981' : '#EF4444'}
              />
            </View>

            <Text
              style={[
                styles.resultTitle,
                { color: scanResult?.success ? '#10B981' : '#EF4444' },
              ]}
            >
              {scanResult?.success ? 'Access Granted' : 'Access Denied'}
            </Text>

            <Text style={styles.resultMessage}>{scanResult?.message}</Text>

            {scanResult?.guestName && (
              <View style={styles.resultDetails}>
                <View style={styles.resultDetailRow}>
                  <Ionicons name="person-outline" size={20} color="#64748B" />
                  <Text style={styles.resultDetailText}>{scanResult.guestName}</Text>
                </View>
                <View style={styles.resultDetailRow}>
                  <Ionicons name="call-outline" size={20} color="#64748B" />
                  <Text style={styles.resultDetailText}>{scanResult.guestPhone}</Text>
                </View>
                {scanResult.securityLevel && (
                  <View style={styles.resultDetailRow}>
                    <Ionicons name="shield-checkmark-outline" size={20} color="#64748B" />
                    <Text style={styles.resultDetailText}>
                      Security Level {scanResult.securityLevel}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity style={styles.resetButton} onPress={resetScanner}>
              <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
              <Text style={styles.resetButtonText}>Scan Another</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Controls */}
      {!scanned && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, flashEnabled && styles.controlButtonActive]}
            onPress={() => setFlashEnabled(!flashEnabled)}
          >
            <Ionicons
              name={flashEnabled ? 'flash' : 'flash-outline'}
              size={24}
              color={flashEnabled ? '#3B82F6' : '#FFFFFF'}
            />
            <Text
              style={[
                styles.controlText,
                flashEnabled && styles.controlTextActive,
              ]}
            >
              Flash
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowManualEntry(true)}
          >
            <Ionicons name="text-outline" size={24} color="#FFFFFF" />
            <Text style={styles.controlText}>Manual Entry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Manual Entry Modal */}
      <Modal
        visible={showManualEntry}
        transparent
        animationType="fade"
        onRequestClose={() => setShowManualEntry(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manual QR Entry</Text>
              <TouchableOpacity onPress={() => setShowManualEntry(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Enter the QR code data manually
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Paste QR code JSON data"
              placeholderTextColor="#64748B"
              value={manualQrCode}
              onChangeText={setManualQrCode}
              multiline
              numberOfLines={4}
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleManualEntry}
              disabled={!manualQrCode.trim()}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.modalButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* OTP Verification Modal */}
      <Modal
        visible={showOtpModal}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>OTP Verification</Text>
            </View>

            <Text style={styles.modalSubtitle}>
              Level 2 Security - Enter OTP sent to guest
            </Text>

            {scanResult?.guestName && (
              <View style={styles.otpGuestInfo}>
                <Text style={styles.otpGuestName}>{scanResult.guestName}</Text>
                <Text style={styles.otpGuestPhone}>{scanResult.guestPhone}</Text>
              </View>
            )}

            <TextInput
              style={styles.otpInput}
              placeholder="Enter 6-digit OTP"
              placeholderTextColor="#64748B"
              value={otpCode}
              onChangeText={setOtpCode}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />

            <View style={styles.otpActions}>
              <TouchableOpacity
                style={styles.otpCancelButton}
                onPress={() => {
                  setShowOtpModal(false);
                  resetScanner();
                }}
                disabled={isProcessing}
              >
                <Text style={styles.otpCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.otpVerifyButton,
                  (!otpCode.trim() || isProcessing) && styles.otpVerifyButtonDisabled,
                ]}
                onPress={handleVerifyOtp}
                disabled={!otpCode.trim() || isProcessing}
              >
                <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
                <Text style={styles.otpVerifyText}>
                  {isProcessing ? 'Verifying...' : 'Verify'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    maxWidth: 400,
  },
  permissionIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#3B82F620',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    zIndex: 10,
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
  cameraContainer: {
    flex: 1,
    margin: 24,
    marginTop: 0,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  scanFrame: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderColor: '#3B82F6',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  scanInstruction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 40,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  scanInstructionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  resultCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    maxWidth: 400,
    width: '100%',
  },
  resultIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  resultMessage: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  resultDetails: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    marginBottom: 24,
  },
  resultDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultDetailText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 16,
  },
  controlButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 8,
  },
  controlButtonActive: {
    backgroundColor: '#3B82F620',
    borderColor: '#3B82F6',
  },
  controlText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  controlTextActive: {
    color: '#3B82F6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  otpGuestInfo: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  otpGuestName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  otpGuestPhone: {
    fontSize: 14,
    color: '#64748B',
  },
  otpInput: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#3B82F6',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 8,
  },
  otpActions: {
    flexDirection: 'row',
    gap: 12,
  },
  otpCancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#334155',
    alignItems: 'center',
  },
  otpCancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  otpVerifyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  otpVerifyButtonDisabled: {
    backgroundColor: '#334155',
  },
  otpVerifyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
