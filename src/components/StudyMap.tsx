import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { StudyLocation, TYPE_ICONS, TYPE_LABELS, PRICE_LABELS, AMENITY_LABELS } from '@/hooks/useStudyLocations';

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

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/standard',
      center: [26.1025, 44.4268], // București
      zoom: 12,
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
      el.innerHTML = `<span class="text-2xl cursor-pointer hover:scale-125 transition-transform">${TYPE_ICONS[location.type]}</span>`;
      el.style.fontSize = '24px';
      el.style.cursor = 'pointer';

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setHTML(`
          <div class="p-2">
            <div class="font-bold text-sm">${location.name}</div>
            <div class="text-xs text-gray-600">${TYPE_LABELS[location.type]}</div>
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
      zoom: 15,
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
    <div className="relative w-full h-full min-h-[500px]">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" style={{ minHeight: '500px' }} />
    </div>
  );
}
