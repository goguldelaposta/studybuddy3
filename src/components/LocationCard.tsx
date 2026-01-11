import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapPin, Clock, Globe, X, Wifi, Zap, Coffee } from "lucide-react";
import { StudyLocation, TYPE_LABELS, TYPE_ICONS, PRICE_LABELS, AMENITY_LABELS } from "@/hooks/useStudyLocations";

interface LocationCardProps {
  location: StudyLocation;
  onClose: () => void;
}

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-3 w-3" />,
  prize: <Zap className="h-3 w-3" />,
  cafea: <Coffee className="h-3 w-3" />,
};

export function LocationCard({ location, onClose }: LocationCardProps) {
  return (
    <Card className="w-full shadow-lg animate-in slide-in-from-bottom-4">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{TYPE_ICONS[location.type]}</span>
            <div>
              <h3 className="font-semibold text-lg">{location.name}</h3>
              <p className="text-sm text-muted-foreground">{TYPE_LABELS[location.type]}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {location.description && (
          <p className="text-sm text-muted-foreground">{location.description}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {location.price_range && (
            <Badge variant={location.price_range === 'free' ? 'default' : 'secondary'}>
              {PRICE_LABELS[location.price_range]}
            </Badge>
          )}
          {location.is_verified && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              ✓ Verificat
            </Badge>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{location.address}, {location.city}</span>
          </div>
          {location.opening_hours && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" />
              <span>{location.opening_hours}</span>
            </div>
          )}
          {location.website && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
              <a 
                href={location.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Website
              </a>
            </div>
          )}
        </div>

        {location.amenities && location.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {location.amenities.map((amenity) => (
              <Badge key={amenity} variant="outline" className="gap-1">
                {AMENITY_ICONS[amenity] || null}
                {AMENITY_LABELS[amenity] || amenity}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
