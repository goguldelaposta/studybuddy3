import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import DOMPurify from 'dompurify';
import { StudyLocation, TYPE_ICONS, TYPE_LABELS } from '@/hooks/useStudyLocations';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Box, Layers, LocateFixed, Loader2 } from 'lucide-react';

interface StudyMapProps {
  locations: StudyLocation[];
  selectedLocation: StudyLocation | null;
  onSelectLocation: (location: StudyLocation | null) => void;
  onUserLocated?: (position: { latitude: number; longitude: number } | null) => void;
  mapboxToken: string;
}

export function StudyMap({ locations, selectedLocation, onSelectLocation, onUserLocated, mapboxToken }: StudyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [is3D, setIs3D] = useState(true);
  const [locating, setLocating] = useState(false);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const { resolvedTheme } = useTheme();

  // Toggle between 2D and 3D view
  const toggle3D = () => {
    if (!map.current) return;
    const newIs3D = !is3D;
    setIs3D(newIs3D);
    
    map.current.easeTo({
      pitch: newIs3D ? 56 : 0,
      duration: 500,
    });
  };

  // Haversine distance in meters
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Create GeoJSON circle polygon
  const createCircle = (center: [number, number], radiusM: number, points = 64) => {
    const coords: [number, number][] = [];
    const km = radiusM / 1000;
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      const dx = km * Math.cos(angle);
      const dy = km * Math.sin(angle);
      const lat = center[1] + (dy / 111.32);
      const lng = center[0] + (dx / (111.32 * Math.cos((center[1] * Math.PI) / 180)));
      coords.push([lng, lat]);
    }
    return { type: 'Feature' as const, geometry: { type: 'Polygon' as const, coordinates: [coords] }, properties: {} };
  };

  const handleGeolocate = () => {
    if (!map.current || !navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        
        // Remove old user marker
        userMarker.current?.remove();
        
        // Create pulsing dot marker
        const el = document.createElement('div');
        el.className = 'user-location-marker';
        el.innerHTML = `<div style="width:16px;height:16px;background:hsl(217,91%,60%);border:3px solid white;border-radius:50%;box-shadow:0 0 0 6px hsla(217,91%,60%,0.3);"></div>`;
        
        userMarker.current = new mapboxgl.Marker({ element: el })
          .setLngLat([longitude, latitude])
          .addTo(map.current!);

        // Calculate radius to nearest study location (min 300m, max 3km)
        let radiusM = 1500;
        if (locations.length > 0) {
          const distances = locations.map(l => getDistance(latitude, longitude, l.latitude, l.longitude));
          const nearest = Math.min(...distances);
          radiusM = Math.max(300, Math.min(nearest * 1.2, 3000));
        }

        // Add/update radius circle on map
        const m = map.current!;
        const circleData = createCircle([longitude, latitude], radiusM);
        if (m.getSource('user-radius')) {
          (m.getSource('user-radius') as mapboxgl.GeoJSONSource).setData(circleData as any);
        } else {
          m.addSource('user-radius', { type: 'geojson', data: circleData as any });
          m.addLayer({
            id: 'user-radius-fill',
            type: 'fill',
            source: 'user-radius',
            paint: { 'fill-color': 'hsl(217, 91%, 60%)', 'fill-opacity': 0.08 },
          });
          m.addLayer({
            id: 'user-radius-border',
            type: 'line',
            source: 'user-radius',
            paint: { 'line-color': 'hsl(217, 91%, 60%)', 'line-width': 2, 'line-opacity': 0.4, 'line-dasharray': [3, 2] },
          });
        }

        // Add distance label popup
        const distLabel = radiusM >= 1000 ? `${(radiusM / 1000).toFixed(1)} km` : `${Math.round(radiusM)} m`;
        const nearestCount = locations.filter(l => getDistance(latitude, longitude, l.latitude, l.longitude) <= radiusM).length;
        
        // Show info popup at user location
        new mapboxgl.Popup({ offset: 20, closeButton: true, className: 'radius-popup' })
          .setLngLat([longitude, latitude])
          .setHTML(`<div class="p-2 text-center"><div class="font-semibold text-sm">📍 Locația ta</div><div class="text-xs text-gray-600 mt-1">Rază: ${distLabel}</div><div class="text-xs text-gray-600">${nearestCount} ${nearestCount === 1 ? 'loc' : 'locuri'} în apropiere</div></div>`)
          .addTo(m);
        
        m.flyTo({
          center: [longitude, latitude],
          zoom: 14,
          duration: 1000,
          essential: true,
        });
        onUserLocated?.({ latitude, longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Custom Mapbox style
  const getMapStyle = () => {
    return 'mapbox://styles/spilee/cmka1c03h002801r1hfqlgrws';
  };

  // Initialize map with 3D view matching the custom style settings
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: getMapStyle(),
      center: [26.1025, 44.4268], // București
      zoom: 15.62,
      pitch: 56,
      bearing: 0,
      antialias: false, // Disable for better performance
      attributionControl: false,
      logoPosition: 'bottom-left',
      fadeDuration: 0, // Instant tile transitions
      trackResize: true,
      refreshExpiredTiles: false,
    });

    // Navigation controls removed for cleaner UI

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      markers.current.forEach(m => m.remove());
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Update map style when theme changes - set light preset for light mode, night for dark
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    // Use config API to change light preset based on theme
    if (map.current.getConfigProperty) {
      map.current.setConfigProperty('basemap', 'lightPreset', resolvedTheme === 'dark' ? 'night' : 'day');
    }
  }, [resolvedTheme, mapLoaded]);

  // Update markers when locations change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markers.current.forEach(m => m.remove());
    markers.current = [];

    // Add new markers
    locations.forEach((location) => {
      const el = document.createElement('div');
      el.className = 'study-marker';
      el.innerHTML = `<span class="text-2xl cursor-pointer hover:scale-125 transition-transform drop-shadow-lg">${TYPE_ICONS[location.type]}</span>`;
      el.style.fontSize = '28px';
      el.style.cursor = 'pointer';

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setHTML(DOMPurify.sanitize(`
          <div class="p-3 min-w-[180px]">
            <div class="font-bold text-sm mb-1">${location.name}</div>
            <div class="text-xs text-gray-600">${TYPE_LABELS[location.type]}</div>
            <div class="text-xs text-gray-500 mt-1">${location.address}</div>
          </div>
        `));

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([location.longitude, location.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener('click', () => {
        onSelectLocation(location);
      });

      markers.current.push(marker);
    });
  }, [locations, mapLoaded, onSelectLocation]);

  // Fly to selected location
  useEffect(() => {
    if (!map.current || !selectedLocation) return;

    map.current.flyTo({
      center: [selectedLocation.longitude, selectedLocation.latitude],
      zoom: 17,
      pitch: 65,
      duration: 800, // Faster animation
      essential: true,
    });
  }, [selectedLocation]);

  if (!mapboxToken) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
        <p className="text-muted-foreground">Token Mapbox lipsă</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* 2D/3D Toggle Button */}
      {mapLoaded && (
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <Button
            onClick={toggle3D}
            variant="secondary"
            size="icon"
            className="h-9 w-9 shadow-md bg-background/90 backdrop-blur-sm"
            title={is3D ? 'Comută la vizualizare 2D' : 'Comută la vizualizare 3D'}
          >
            {is3D ? <Layers className="h-4 w-4" /> : <Box className="h-4 w-4" />}
          </Button>
          <Button
            onClick={handleGeolocate}
            variant="secondary"
            size="icon"
            className="h-9 w-9 shadow-md bg-background/90 backdrop-blur-sm"
            title="Locația mea"
            disabled={locating}
          >
            {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  );
}
