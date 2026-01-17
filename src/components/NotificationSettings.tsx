import { Bell, BellOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

export function NotificationSettings() {
  const {
    soundEnabled,
    setSoundEnabled,
    desktopNotificationsEnabled,
    requestDesktopPermission,
  } = useRealtimeNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {!desktopNotificationsEnabled && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Setări Notificări</h4>
          
          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {soundEnabled ? (
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              ) : (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              )}
              <Label htmlFor="sound-toggle" className="text-sm cursor-pointer">
                Sunet notificări
              </Label>
            </div>
            <Switch
              id="sound-toggle"
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
          </div>

          {/* Desktop Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {desktopNotificationsEnabled ? (
                <Bell className="h-4 w-4 text-muted-foreground" />
              ) : (
                <BellOff className="h-4 w-4 text-muted-foreground" />
              )}
              <Label className="text-sm">
                Notificări desktop
              </Label>
            </div>
            {desktopNotificationsEnabled ? (
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                Activ
              </span>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={requestDesktopPermission}
                className="h-7 text-xs"
              >
                Activează
              </Button>
            )}
          </div>

          {!desktopNotificationsEnabled && (
            <p className="text-xs text-muted-foreground">
              Activează notificările desktop pentru a primi alerte chiar și când nu ești pe acest tab.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
