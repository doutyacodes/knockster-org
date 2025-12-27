# Expo Camera Integration Documentation

## Installation

```bash
npx expo install expo-camera expo-barcode-scanner
```

## Permissions Required

Add to `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow Knockster Security to access your camera to scan QR codes."
        }
      ]
    ]
  }
}
```

## Basic Usage for QR Scanning

### 1. Request Permission

```typescript
import { Camera } from 'expo-camera';

const [permission, requestPermission] = Camera.useCameraPermissions();

if (!permission?.granted) {
  await requestPermission();
}
```

### 2. Camera Component

```typescript
<Camera
  style={StyleSheet.absoluteFill}
  onBarcodeScanned={handleBarCodeScanned}
  barcodeScannerSettings={{
    barcodeTypes: ['qr'],
  }}
/>
```

### 3. Handle Scanned Data

```typescript
const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
  setScanned(true);
  // Process QR data
  console.log(`Type: ${type}, Data: ${data}`);
};
```

### 4. Flash/Torch Control

```typescript
import { FlashMode } from 'expo-camera';

const [flashMode, setFlashMode] = useState<FlashMode>(FlashMode.off);

<Camera
  flashMode={flashMode}
  // ... other props
/>
```

## Complete Scanner Implementation

See `app/(tabs)/scanner.tsx` for full working implementation with:
- Camera permissions
- QR code scanning
- Flash/torch toggle
- Scanning animation
- Manual entry fallback
- Error handling
- Modern UI/UX

## API Types for Scanned QR

```typescript
// Expected QR data format from guest
interface GuestQR {
  invitationId: string;
  qrCode: string; // Session QR code
}

// Parse scanned data
const qrData: GuestQR = JSON.parse(scannedData);
```

## Tips

1. **Keep screen awake** while scanning:
   ```typescript
   import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
   ```

2. **Haptic feedback** on successful scan:
   ```typescript
   import * as Haptics from 'expo-haptics';
   Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
   ```

3. **Auto-focus**: Enabled by default on modern devices

4. **Scan delay**: Prevent duplicate scans by debouncing

## Troubleshooting

- **Black screen**: Check camera permissions
- **Not scanning**: Ensure barcode types include 'qr'
- **Slow performance**: Use `barcodeScannerSettings` to limit scan types
- **iOS issues**: Rebuild app after adding camera plugin

## Resources

- [Expo Camera Docs](https://docs.expo.dev/versions/latest/sdk/camera/)
- [Barcode Scanner Docs](https://docs.expo.dev/versions/latest/sdk/bar-code-scanner/)
