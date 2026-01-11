import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { StudyLocation, TYPE_ICONS, TYPE_LABELS } from '@/hooks/useStudyLocations';
import { useTheme } from 'next-themes';

interface StudyMapProps {
  locations: StudyLocation[];
  selectedLocation: StudyLocation | null;
  onSelectLocation: (location: StudyLocation | null) => void;
  mapboxToken: string;
}

export function StudyMap({ locations, selectedLocation, onSelectLocation, mapboxToken }: StudyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { resolvedTheme } = useTheme();

  // Get map style based on theme
  const getMapStyle = () => {
    return resolvedTheme === 'dark' 
      ? 'mapbox://styles/mapbox/navigation-night-v1'
      : 'mapbox://styles/mapbox/streets-v12';
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: getMapStyle(),
      center: [26.1025, 44.4268], // București
      zoom: 13,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'top-right'
    );

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      markers.current.forEach(m => m.remove());
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Update map style when theme changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    map.current.setStyle(getMapStyle());
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
        .setHTML(`
          <div class="p-3 min-w-[180px]">
            <div class="font-bold text-sm mb-1">${location.name}</div>
            <div class="text-xs text-gray-600">${TYPE_LABELS[location.type]}</div>
            <div class="text-xs text-gray-500 mt-1">${location.address}</div>
          </div>
        `);

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
      zoom: 16,
      duration: 1000,
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
    <div className="relative w-full h-full" style={{ minHeight: 'calc(100vh - 180px)' }}>
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
}
