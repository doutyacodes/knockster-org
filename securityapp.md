# Knockster Security - Mobile App Development Specification

## 📱 Project Overview

Build a **modern, futuristic security guard mobile application** for the Knockster platform using **Expo React Native**. This app enables security personnel to authenticate guest invitations through QR code scanning, OTP verification, and real-time access validation across multiple security levels (L1-L4).

---

## 🎯 Core Objectives

1. **Intuitive & Fast**: Security guards need quick, one-handed operation during active duty
2. **Enterprise-Grade**: Professional design suitable for tech parks, corporate campuses, and government facilities
3. **Offline-Ready**: Critical functions must work with intermittent connectivity
4. **Accessible**: Clear visual feedback for success/failure states in high-pressure environments
5. **Futuristic Design**: Modern glassmorphism, smooth animations, and professional aesthetics

---

## 🛠 Technology Stack Requirements

### **Core Framework**
- **Expo SDK 52+** (latest stable)
- **React Native** with TypeScript
- **Expo Router** (file-based navigation)
- **React Native Reanimated 3** (for smooth animations)

### **UI/UX Libraries**
- **NativeWind** (Tailwind CSS for React Native) or **Tamagui** (for modern, performant UI)
- **React Native Paper** or **React Native Elements** (optional base components)
- **Moti** or **React Native Reanimated** (for micro-interactions and transitions)
- **Lottie React Native** (for success/error animations)
- **React Native Gesture Handler** (for swipe interactions)

### **Functionality**
- **Expo Camera** (QR code scanning)
- **Expo Barcode Scanner** (alternative QR scanning)
- **Axios** or **TanStack Query (React Query)** (API calls with caching)
- **Zustand** or **Redux Toolkit** (state management)
- **AsyncStorage** or **MMKV** (local storage)
- **React Hook Form** (form handling)
- **Zod** (validation)

### **Developer Experience**
- **ESLint + Prettier** (code quality)
- **TypeScript** (type safety)
- **React Native Debugger** (debugging)

---

## 🎨 Design System Requirements

### **Color Palette**
**Professional Security Theme:**
- **Primary**: Deep Blue (`#1E40AF`, `#3B82F6`) - Authority, trust
- **Success**: Emerald Green (`#059669`, `#10B981`) - Approved access
- **Danger**: Rose Red (`#DC2626`, `#EF4444`) - Denied/alerts
- **Warning**: Amber (`#D97706`, `#F59E0B`) - Pending/caution
- **Neutral**: Slate grays (`#0F172A`, `#1E293B`, `#334155`, `#64748B`)
- **Accent**: Electric Blue (`#06B6D4`, `#22D3EE`) - Interactive elements

### **Typography**
- **Primary Font**: Inter or SF Pro (system fonts)
- **Monospace**: JetBrains Mono or SF Mono (for codes, IDs)
- **Sizes**:
  - Headings: 24-32px (bold)
  - Body: 14-16px (medium)
  - Captions: 12px (regular)
  - Buttons: 16px (semibold)

### **Visual Style**
- **Glassmorphism Cards**: Frosted glass effect with backdrop blur
- **Neumorphism Buttons**: Subtle shadows for depth
- **Gradient Accents**: Subtle linear gradients on interactive elements
- **Border Radius**: 16-24px for cards, 12px for buttons
- **Shadows**: Soft, layered shadows for depth
- **Spacing**: 8px base grid system (8, 16, 24, 32px)

### **Animations & Micro-interactions**
- **Page Transitions**: Fade + slide (300ms, easeInOut)
- **Card Reveals**: Stagger animation for lists (50ms delay per item)
- **Button Press**: Scale down 0.95 + haptic feedback
- **Success/Failure**: Lottie animations (checkmark/cross)
- **QR Scanner**: Animated scanning line with glow effect
- **Skeleton Loaders**: Shimmer effect during data fetch
- **Pull-to-Refresh**: Custom animated indicator
- **Tab Transitions**: Smooth spring animations

---

## 📱 Screen Specifications

### **1. Splash Screen**
- Knockster logo with animated glow
- Loading indicator
- Auto-navigate to Login or Dashboard (if authenticated)

### **2. Login Screen**
**Layout:**
- Centered card with glassmorphism effect
- Username input field (with guard icon)
- Password input field (with lock icon, toggle visibility)
- "Remember Me" checkbox
- Login button (gradient, with loading spinner)
- Version number footer

**Features:**
- Auto-fill saved credentials
- Biometric login (Face ID / Fingerprint) - future enhancement
- Form validation with inline errors
- Device registration on first login

**Animation:**
- Fade-in entrance
- Input field focus glow
- Error shake animation

---

### **3. Dashboard/Home Screen**
**Header:**
- Greeting: "Good Morning, [Guard Name]"
- Organization name badge
- Notification bell icon
- Profile avatar

**Stats Cards (2x2 Grid):**
- Today's Scans (with success rate percentage)
- Successful Entries (green accent)
- Failed Attempts (red accent)
- Active Invitations Count

**Quick Actions (Horizontal Scroll):**
- Large "Scan QR Code" button (prominent, gradient)
- "Show My QR" button (for L3/L4)
- "View Activity" button
- "Refresh" button

**Recent Activity Feed:**
- Last 5 scan events
- Each item shows: Guest name, timestamp, status badge, security level
- Swipe-to-view-details gesture
- Empty state: "No scans yet today"

**Bottom Tab Navigator:**
- Home (active)
- Scanner
- My QR
- Activity
- Profile

**Animations:**
- Staggered card entrance
- Pull-to-refresh
- Number count-up animation for stats

---

### **4. QR Scanner Screen**
**Layout:**
- Full-screen camera view
- Rounded corner frame overlay (highlighting scan area)
- Animated scanning line (top-to-bottom loop)
- Top bar: Back button, Flash toggle, Instructions text
- Bottom sheet: Manual entry option

**Features:**
- Auto-focus and scan on QR detection
- Haptic feedback on successful scan
- Flash/torch toggle for low light
- Manual invitation ID entry (fallback)

**Flow:**
- Scan QR → Parse invitation data → Navigate to verification screen
- L1: Direct success screen
- L2: OTP input modal

**Animations:**
- Scanning line pulse
- Corner frame glow on detection
- Smooth transition to result screen

---

### **5. OTP Input Modal (L2/L4)**
**Layout:**
- Bottom sheet modal (covers 60% of screen)
- Title: "Verify OTP Code"
- Guest info summary (name, phone)
- 6-digit OTP input (large, separated boxes)
- Timer countdown (5:00 → 0:00)
- Verify button
- Cancel button

**Features:**
- Auto-focus on first box
- Auto-advance between boxes
- Paste from clipboard support
- Haptic feedback on correct/incorrect
- Disable verify if timer expires

**Animations:**
- Slide-up entrance
- Input box focus glow
- Timer color change (green → amber → red)
- Success: Checkmark lottie + confetti
- Error: Shake + vibration

---

### **6. Scan Result Screen**
**Success State:**
- Large checkmark icon (Lottie animation)
- "Access Granted" title (green)
- Guest details card:
  - Photo placeholder
  - Guest name (large)
  - Guest phone
  - Employee/Host name
  - Security Level badge (L1-L4)
  - Valid time period
  - Organization name
  - Pre-approved badge (if same org)
- "Scan Next Guest" button
- "Back to Home" button

**Failure State:**
- Large X icon (Lottie animation)
- "Access Denied" title (red)
- Failure reason (large, clear text)
  - "Invitation Expired"
  - "QR Code Invalid"
  - "Invitation Revoked"
  - "Not Yet Valid"
- Guest details (limited)
- "Try Again" button
- "Report Issue" button

**Animations:**
- Fade-in + scale entrance
- Auto-dismiss after 10 seconds (success only)
- Confetti for L4 success
- Vibration pattern based on result

---

### **7. My QR Screen (For L3/L4)**
**Layout:**
- Centered large QR code (guard's security QR)
- Guard profile info above QR:
  - Username
  - Organization name
  - Current shift time
  - Status badge (On Duty / Off Duty)
- Brightness slider (to help guest scanning)
- "Refresh QR" button (if needed)
- Instructions: "Guest scans this code for L3/L4 access"

**Features:**
- Auto-brightness boost when screen active
- Keep screen awake while on this page
- Copy QR data to clipboard (for debugging)
- Share QR as image (for troubleshooting)

**Animations:**
- QR code fade-in
- Pulse glow around QR border
- Smooth brightness slider

---

### **8. Activity/History Screen**
**Header:**
- Date range filter (Today / Last 7 Days / Last 30 Days)
- Search bar (search by guest name/phone)
- Filter button (Success / Failed / All)

**List:**
- Grouped by date
- Each item:
  - Guest name + phone
  - Timestamp (relative: "2 mins ago")
  - Status badge (Success/Failed)
  - Security level badge
  - Tap to expand: Full details + failure reason

**Stats Summary (Top):**
- Total scans today
- Success rate (circular progress)
- Most common failure reason

**Features:**
- Infinite scroll / pagination
- Pull-to-refresh
- Empty state: "No activity found"
- Export option (CSV/PDF) - future enhancement

**Animations:**
- Skeleton loader while fetching
- Stagger list items entrance
- Expand/collapse with spring animation

---

### **9. Profile Screen**
**Layout:**
- Header: Avatar (placeholder) + Guard name
- Organization info card:
  - Organization name
  - Organization type
  - Your role: "Security Personnel"

**Account Details:**
- Username (read-only)
- Shift Schedule (editable - future)
  - Shift Start Time
  - Shift End Time
- Status: Active/Disabled (badge)
- Device info
  - Model
  - OS Version
  - Last Active

**Actions:**
- Change Password button
- App Settings button
- Help & Support button
- Logout button (red, bottom)

**Animations:**
- Smooth section reveals
- Button press effects
- Logout confirmation modal slide-up

---

### **10. Settings Screen (Optional)**
**Sections:**

**Appearance:**
- Theme: Light / Dark / Auto (future)
- Language: English (expandable)

**Scanner:**
- Enable Sound (toggle)
- Enable Vibration (toggle)
- Scanner Sensitivity (slider)

**Notifications:**
- Push Notifications (toggle)
- Success Alerts (toggle)
- Failure Alerts (toggle)

**Data:**
- Cache Size (display + clear button)
- Offline Mode Status
- Last Sync Time

**About:**
- App Version
- Terms of Service
- Privacy Policy
- Licenses

---

### **11. Help/Instructions Screen**
**Sections:**
- "How to Scan QR Codes" (with GIF/video)
- "Security Levels Explained" (L1-L4 cards)
- "What to Do if Scan Fails" (troubleshooting)
- "Common Error Messages" (accordion)
- "Contact Support" (button → opens email/chat)

---

### **12. Offline Mode Screen**
**Display:**
- Cloud with slash icon
- "No Internet Connection"
- "Some features are limited"
- "Tap to retry" button
- List of available offline features

---

## 🔧 Key Features & Requirements

### **Authentication & Security**
- JWT token storage in secure storage (MMKV or AsyncStorage encrypted)
- Auto-refresh token before expiry
- Biometric authentication (Face ID/Touch ID) - Phase 2
- Session timeout after 30 minutes of inactivity
- Force logout on device change (handled by API)
- Device registration and tracking

### **QR Code Scanning**
- Real-time QR detection with camera
- Parse JSON QR data (invitation ID + session code)
- Validate QR format before API call
- Support manual invitation ID entry
- Flash/torch control for low-light scanning
- Haptic feedback on successful scan

### **Offline Capabilities**
- Cache recent scan history (last 50 scans)
- Cache dashboard stats (refresh when online)
- Queue failed API requests for retry
- Show offline banner when disconnected
- Store guard profile data locally

### **Performance Optimization**
- Image lazy loading
- List virtualization (FlashList or RecyclerListView)
- API response caching (React Query)
- Debounce search inputs
- Minimize re-renders (React.memo, useMemo)
- Code splitting (Expo Router lazy loading)

### **Accessibility**
- Screen reader support (ARIA labels)
- High contrast mode
- Minimum touch target: 44x44px
- Clear error messages
- Keyboard navigation support

### **Error Handling**
- Network error retry with exponential backoff
- API error messages displayed clearly
- Validation errors inline
- Global error boundary
- Crash reporting (Sentry - optional)

### **Haptic Feedback Patterns**
- Light impact: Button press
- Medium impact: Successful scan
- Heavy impact: Failed scan
- Notification: New alert received

---

## 📊 State Management Structure

### **Global State (Zustand/Redux):**
```typescript
interface AppState {
  // Auth
  user: Guard | null;
  token: string | null;
  isAuthenticated: boolean;

  // Dashboard
  stats: DashboardStats | null;
  recentActivity: ScanEvent[];

  // Scanner
  lastScanResult: ScanResult | null;

  // Offline
  isOnline: boolean;
  pendingRequests: Request[];

  // Settings
  preferences: UserPreferences;
}
```

### **API State (React Query):**
- Dashboard stats (stale time: 30s)
- Activity history (stale time: 1m)
- Guard profile (stale time: 5m)
- Infinite query for activity pagination

---

## 🎬 Animation Timing Guidelines

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Page Transition | 300ms | easeInOut |
| Modal Slide | 250ms | spring |
| Button Press | 150ms | easeOut |
| Fade In/Out | 200ms | linear |
| List Item Stagger | 50ms delay | easeOut |
| Success Lottie | 1500ms | - |
| Error Shake | 400ms | easeInOut |
| Skeleton Pulse | 1200ms loop | linear |

---

## 📦 Project Structure

```
knockster-security/
├── app/                        # Expo Router pages
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── _layout.tsx
│   ├── (tabs)/
│   │   ├── index.tsx          # Dashboard
│   │   ├── scanner.tsx
│   │   ├── my-qr.tsx
│   │   ├── activity.tsx
│   │   └── profile.tsx
│   ├── scan-result.tsx
│   └── _layout.tsx
├── components/
│   ├── ui/                     # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Badge.tsx
│   ├── StatsCard.tsx
│   ├── ActivityItem.tsx
│   ├── QRScanner.tsx
│   └── OTPInput.tsx
├── lib/
│   ├── api.ts                  # API client
│   ├── storage.ts              # AsyncStorage wrapper
│   └── constants.ts            # Colors, spacing
├── hooks/
│   ├── useAuth.ts
│   ├── useDashboard.ts
│   └── useScanner.ts
├── store/
│   └── index.ts                # Zustand store
├── types/
│   └── index.ts                # TypeScript types
└── assets/
    ├── lottie/                 # Animation files
    ├── images/
    └── fonts/
```

---

## 🔌 API Integration (To Be Provided)

The following API endpoints will be provided with full documentation:

### **Authentication:**
- `POST /api/mobile-api/security/login`
- `POST /api/mobile-api/security/logout` (optional)

### **Dashboard:**
- `GET /api/mobile-api/security/dashboard`

### **QR & Scanning:**
- `GET /api/mobile-api/security/qr` (Get guard's QR)
- `POST /api/mobile-api/security/scan-guest` (Scan guest QR - L1/L2)
- `POST /api/mobile-api/security/verify-otp` (Verify OTP - L2/L4)

### **Profile:**
- `GET /api/mobile-api/security/profile` (optional)
- `PATCH /api/mobile-api/security/profile` (optional)

**Database Schema & Full API Documentation will be provided separately.**

---

## ✅ Success Criteria

1. **Fast Performance**: App loads in <2s, QR scan responds in <500ms
2. **Smooth Animations**: 60fps maintained during transitions
3. **Intuitive UX**: Security guards can scan without training
4. **Professional Design**: Suitable for enterprise security environments
5. **Reliable Offline**: Core functions work without internet
6. **Accessible**: Meets WCAG 2.1 AA standards
7. **Production Ready**: Error handling, logging, crash reporting

---

## 🚀 Development Phases

### **Phase 1: MVP (Week 1-2)**
- ✅ Login screen
- ✅ Dashboard with stats
- ✅ QR Scanner (L1 flow)
- ✅ Basic navigation
- ✅ API integration

### **Phase 2: Full Features (Week 3-4)**
- ✅ OTP verification (L2/L4)
- ✅ My QR screen (L3/L4)
- ✅ Activity history
- ✅ Profile screen
- ✅ Offline mode

### **Phase 3: Polish (Week 5)**
- ✅ Animations & micro-interactions
- ✅ Error handling
- ✅ Performance optimization
- ✅ Testing (unit + E2E)
- ✅ Documentation

### **Phase 4: Deployment**
- ✅ Build for iOS/Android
- ✅ App Store submission
- ✅ Beta testing with real guards

---

## 📝 Notes for Developer

- **Prioritize simplicity**: Guards use this app in high-pressure situations
- **Large touch targets**: Gloves may be worn
- **High contrast**: Must work in bright sunlight
- **Battery optimization**: App will run for full shifts (8-12 hours)
- **Test on low-end devices**: Not all guards have flagship phones
- **Support landscape**: Tablets may be used at fixed checkpoints

---

## 🎯 Deliverables

1. **Functional Expo React Native App** (iOS + Android)
2. **Clean, documented TypeScript code**
3. **Component library/design system**
4. **API integration layer**
5. **User documentation** (for guards)
6. **Developer documentation** (setup, architecture)
7. **APK/IPA builds** for testing

---

**Ready to build a world-class security app! 🚀**

*Database schema and API endpoints will be provided in subsequent documents.*
