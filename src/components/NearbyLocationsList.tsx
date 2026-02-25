import { useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Navigation, Star } from 'lucide-react';
import { StudyLocation, TYPE_ICONS, TYPE_LABELS, PRICE_LABELS } from '@/hooks/useStudyLocations';

interface NearbyLocationsListProps {
  locations: StudyLocation[];
  userPosition: { latitude: number; longitude: number };
  onSelectLocation: (location: StudyLocation) => void;
  onClose: () => void;
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function NearbyLocationsList({ locations, userPosition, onSelectLocation, onClose }: NearbyLocationsListProps) {
  const sorted = useMemo(() => {
    return locations
      .map(loc => ({
        ...loc,
        distance: getDistance(userPosition.latitude, userPosition.longitude, loc.latitude, loc.longitude),
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [locations, userPosition]);

  return (
    <div className="bg-background/95 backdrop-blur-md rounded-2xl shadow-xl border border-border/50 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Locuri apropiate</h3>
          <Badge variant="secondary" className="text-xs">{sorted.length}</Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* List */}
      <ScrollArea className="max-h-[45vh]">
        <div className="divide-y divide-border/30">
          {sorted.map((loc) => (
            <button
              key={loc.id}
              onClick={() => onSelectLocation(loc)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left"
            >
              <span className="text-xl shrink-0">{TYPE_ICONS[loc.type]}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{loc.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{TYPE_LABELS[loc.type]}</span>
                  {loc.rating > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {loc.rating.toFixed(1)}
                    </span>
                  )}
                  {loc.price_range && (
                    <span className="text-xs text-muted-foreground">• {PRICE_LABELS[loc.price_range]}</span>
                  )}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-sm font-semibold text-primary">{formatDistance(loc.distance)}</div>
              </div>
            </button>
          ))}
          {sorted.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Niciun loc de studiu găsit în apropiere
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
