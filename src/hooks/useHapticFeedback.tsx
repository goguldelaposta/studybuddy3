import { useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const vibrationPatterns: Record<HapticStyle, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 10],
  warning: [20, 50, 20],
  error: [30, 50, 30, 50, 30],
};

async function triggerNativeHaptic(style: HapticStyle) {
  try {
    switch (style) {
      case 'light':
        await Haptics.impact({ style: ImpactStyle.Light });
        break;
      case 'medium':
        await Haptics.impact({ style: ImpactStyle.Medium });
        break;
      case 'heavy':
        await Haptics.impact({ style: ImpactStyle.Heavy });
        break;
      case 'success':
        await Haptics.notification({ type: NotificationType.Success });
        break;
      case 'warning':
        await Haptics.notification({ type: NotificationType.Warning });
        break;
      case 'error':
        await Haptics.notification({ type: NotificationType.Error });
        break;
    }
  } catch {
    console.debug('Haptic feedback not available');
  }
}

function triggerWebHaptic(style: HapticStyle) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(vibrationPatterns[style]);
    } catch {
      console.debug('Haptic feedback not available');
    }
  }
}

export function useHapticFeedback() {
  const trigger = useCallback((style: HapticStyle = 'light') => {
    if (Capacitor.isNativePlatform()) {
      triggerNativeHaptic(style);
    } else {
      triggerWebHaptic(style);
    }
  }, []);

  const lightTap = useCallback(() => trigger('light'), [trigger]);
  const mediumTap = useCallback(() => trigger('medium'), [trigger]);
  const heavyTap = useCallback(() => trigger('heavy'), [trigger]);
  const successFeedback = useCallback(() => trigger('success'), [trigger]);
  const warningFeedback = useCallback(() => trigger('warning'), [trigger]);
  const errorFeedback = useCallback(() => trigger('error'), [trigger]);

  return {
    trigger,
    lightTap,
    mediumTap,
    heavyTap,
    successFeedback,
    warningFeedback,
    errorFeedback,
  };
}

// Standalone function for use outside React components
export function triggerHaptic(style: HapticStyle = 'light') {
  if (Capacitor.isNativePlatform()) {
    triggerNativeHaptic(style);
  } else {
    triggerWebHaptic(style);
  }
}
