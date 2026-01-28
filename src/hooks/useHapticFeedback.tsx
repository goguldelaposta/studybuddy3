import { useCallback } from 'react';

type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const vibrationPatterns: Record<HapticStyle, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 10],
  warning: [20, 50, 20],
  error: [30, 50, 30, 50, 30],
};

export function useHapticFeedback() {
  const trigger = useCallback((style: HapticStyle = 'light') => {
    // Check if vibration API is available
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        const pattern = vibrationPatterns[style];
        navigator.vibrate(pattern);
      } catch (error) {
        // Silently fail if vibration is not supported
        console.debug('Haptic feedback not available');
      }
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
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      const pattern = vibrationPatterns[style];
      navigator.vibrate(pattern);
    } catch (error) {
      console.debug('Haptic feedback not available');
    }
  }
}
