import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

export function useServiceWorker() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showReload, setShowReload] = useState(false);
  const { toast } = useToast();

  const reloadPage = useCallback(() => {
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
    setShowReload(false);
    window.location.reload();
  }, [waitingWorker]);

  useEffect(() => {
    // Service workers nu funcționează în aplicații native Capacitor
    if (!('serviceWorker' in navigator) || Capacitor.isNativePlatform()) return;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 1000); // Check every minute

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setShowReload(true);
                toast({
                  title: "🆕 Versiune nouă disponibilă!",
                  description: "O actualizare este gata pentru instalare.",
                  action: (
                    <Button size="sm" onClick={() => {
                      newWorker.postMessage({ type: 'SKIP_WAITING' });
                      window.location.reload();
                    }} className="gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Actualizează
                    </Button>
                  ),
                  duration: Infinity,
                });
              }
            });
          }
        });

        // Handle controller change - only log, don't auto-reload
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('Service Worker controller changed');
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    registerSW();
  }, [toast]);

  return { showReload, reloadPage };
}
