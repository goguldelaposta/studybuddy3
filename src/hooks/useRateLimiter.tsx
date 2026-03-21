import { useState, useCallback, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface RateLimiterConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
  storageKey: string;
}

interface RateLimiterState {
  attempts: number[];
  blockedUntil: number | null;
}

const DEFAULT_CONFIG: RateLimiterConfig = {
  maxAttempts: 5,
  windowMs: 60 * 1000, // 1 minute
  blockDurationMs: 5 * 60 * 1000, // 5 minutes block
  storageKey: "auth_rate_limit",
};

export const useRateLimiter = (config: Partial<RateLimiterConfig> = {}) => {
  const { toast } = useToast();
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const [state, setState] = useState<RateLimiterState>(() => {
    try {
      const stored = localStorage.getItem(finalConfig.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          attempts: parsed.attempts || [],
          blockedUntil: parsed.blockedUntil || null,
        };
      }
    } catch {
      // Ignore parsing errors
    }
    return { attempts: [], blockedUntil: null };
  });

  const [remainingTime, setRemainingTime] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(finalConfig.storageKey, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  }, [state, finalConfig.storageKey]);

  // Update remaining time countdown
  useEffect(() => {
    if (state.blockedUntil && state.blockedUntil > Date.now()) {
      const updateRemaining = () => {
        const remaining = Math.max(0, state.blockedUntil! - Date.now());
        setRemainingTime(remaining);

        if (remaining <= 0) {
          setState((prev) => ({ ...prev, blockedUntil: null, attempts: [] }));
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }
      };

      updateRemaining();
      timerRef.current = setInterval(updateRemaining, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    } else {
      setRemainingTime(0);
    }
  }, [state.blockedUntil]);

  const isBlocked = useCallback((): boolean => {
    if (state.blockedUntil && state.blockedUntil > Date.now()) {
      return true;
    }
    return false;
  }, [state.blockedUntil]);

  const getRemainingAttempts = useCallback((): number => {
    const now = Date.now();
    const recentAttempts = state.attempts.filter(
      (timestamp) => now - timestamp < finalConfig.windowMs
    );
    return Math.max(0, finalConfig.maxAttempts - recentAttempts.length);
  }, [state.attempts, finalConfig.maxAttempts, finalConfig.windowMs]);

  const recordAttempt = useCallback((): boolean => {
    const now = Date.now();

    // Check if currently blocked
    if (state.blockedUntil && state.blockedUntil > now) {
      const remainingMinutes = Math.ceil((state.blockedUntil - now) / 60000);
      toast({
        title: "Prea multe încercări",
        description: `Te rugăm să aștepți ${remainingMinutes} ${remainingMinutes === 1 ? "minut" : "minute"} înainte de a încerca din nou.`,
        variant: "destructive",
      });
      return false;
    }

    // Filter out old attempts
    const recentAttempts = state.attempts.filter(
      (timestamp) => now - timestamp < finalConfig.windowMs
    );

    // Add new attempt
    const newAttempts = [...recentAttempts, now];

    // Check if limit exceeded
    if (newAttempts.length >= finalConfig.maxAttempts) {
      const blockedUntil = now + finalConfig.blockDurationMs;
      setState({ attempts: newAttempts, blockedUntil });
      
      const blockMinutes = Math.ceil(finalConfig.blockDurationMs / 60000);
      toast({
        title: "Cont blocat temporar",
        description: `Ai depășit numărul maxim de încercări. Încearcă din nou peste ${blockMinutes} minute.`,
        variant: "destructive",
      });
      return false;
    }

    // Record the attempt
    setState((prev) => ({ ...prev, attempts: newAttempts }));

    // Warn if getting close to limit
    const remaining = finalConfig.maxAttempts - newAttempts.length;
    if (remaining <= 2 && remaining > 0) {
      toast({
        title: "Atenție",
        description: `Mai ai ${remaining} ${remaining === 1 ? "încercare" : "încercări"} înainte de blocare temporară.`,
        variant: "default",
      });
    }

    return true;
  }, [state, finalConfig, toast]);

  const resetAttempts = useCallback(() => {
    setState({ attempts: [], blockedUntil: null });
    try {
      localStorage.removeItem(finalConfig.storageKey);
    } catch {
      // Ignore storage errors
    }
  }, [finalConfig.storageKey]);

  const formatRemainingTime = useCallback((): string => {
    if (remainingTime <= 0) return "";
    const minutes = Math.floor(remainingTime / 60000);
    const seconds = Math.floor((remainingTime % 60000) / 1000);
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${seconds}s`;
  }, [remainingTime]);

  return {
    isBlocked,
    getRemainingAttempts,
    recordAttempt,
    resetAttempts,
    remainingTime,
    formatRemainingTime,
  };
};
