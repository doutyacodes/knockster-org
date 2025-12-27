// app/index.tsx
// Location: Root splash/redirect screen

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // Navigate based on authentication status
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading]);

  return (
    <View style={styles.container}>
      {/* Logo Container */}
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>K</Text>
        </View>
        <Text style={styles.appName}>KNOCKSTER</Text>
        <Text style={styles.subtitle}>Security</Text>
      </View>

      {/* Loading Indicator */}
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>

      {/* Version */}
      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1E40AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  version: {
    position: 'absolute',
    bottom: 40,
    fontSize: 12,
    color: '#475569',
  },
});