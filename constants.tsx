
import React from 'react';
import {
  LayoutDashboard,
  UserPlus,
  ShieldCheck,
  History,
  Bell,
  UserCircle,
  LogOut,
  Plus,
  MoreVertical,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronRight,
  Menu,
  X,
  Phone,
  Calendar,
  Layers,
  Link,
  Info,
  Key
} from 'lucide-react';

export const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
};

export const ICONS = {
  Dashboard: LayoutDashboard,
  Invitations: UserPlus,
  Personnel: ShieldCheck,
  // Added ShieldCheck to resolve property access errors in multiple components
  ShieldCheck: ShieldCheck,
  Logs: History,
  Alerts: Bell,
  Profile: UserCircle,
  Logout: LogOut,
  Add: Plus,
  More: MoreVertical,
  Search: Search,
  Filter: Filter,
  Success: CheckCircle2,
  Failure: XCircle,
  Warning: AlertTriangle,
  Time: Clock,
  Clock: Clock,
  ArrowRight: ChevronRight,
  Menu: Menu,
  Close: X,
  Phone: Phone,
  Calendar: Calendar,
  Layers: Layers,
  Link: Link,
  Info: Info,
  Key: Key
};

export const SECURITY_INFO = {
  L1: { label: 'Level 1', color: 'bg-blue-100 text-blue-700', description: 'Rotating QR Code' },
  L2: { label: 'Level 2', color: 'bg-emerald-100 text-emerald-700', description: 'Rotating QR + OTP' },
  L3: { label: 'Level 3', color: 'bg-amber-100 text-amber-700', description: 'Guard QR + App Auth' },
  L4: { label: 'Level 4', color: 'bg-rose-100 text-rose-700', description: 'App Auth + OTP' },
};
