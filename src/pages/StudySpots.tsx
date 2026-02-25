import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { StudyMap } from "@/components/StudyMap";
import { LocationCard } from "@/components/LocationCard";
import { NearbyLocationsList } from "@/components/NearbyLocationsList";
import { useStudyLocations, LocationType, TYPE_LABELS, StudyLocation } from "@/hooks/useStudyLocations";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Coffee, Book, Building, Laptop, GraduationCap, MoreHorizontal } from "lucide-react";

const TYPE_BUTTON_ICONS: Record<LocationType, React.ReactNode> = {
  cafe: <Coffee className="h-4 w-4" />,
  library: <Book className="h-4 w-4" />,
  bookstore: <Building className="h-4 w-4" />,
  coworking: <Laptop className="h-4 w-4" />,
  university: <GraduationCap className="h-4 w-4" />,
  other: <MoreHorizontal className="h-4 w-4" />,
};

export default function StudySpots() {
  const { user, loading: authLoading } = useAuth();
  const { locations, loading, selectedType, setSelectedType } = useStudyLocations();
  const [selectedLocation, setSelectedLocation] = useState<StudyLocation | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>("");
  const [userPosition, setUserPosition] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    // Get mapbox token from edge function
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        if (data?.token) {
          setMapboxToken(data.token);
        }
      } catch (err) {
        console.error('Error fetching Mapbox token:', err);
      }
    };
    fetchToken();
  }, []);

  const handleSignOut = async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.auth.signOut();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const typeFilters: LocationType[] = ['cafe', 'library', 'bookstore', 'coworking', 'university', 'other'];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar 
        isAuthenticated={!!user} 
        user={{ email: user.email || "", fullName: undefined, avatarUrl: undefined }}
        onSignOut={handleSignOut} 
      />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
         <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative z-40">
          <div className="container py-3">
            {/* Filter buttons */}
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2 items-center">
                <Button
                  variant={selectedType === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(null)}
                  className="gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Toate
                </Button>
                {typeFilters.map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                    className="gap-2"
                  >
                    {TYPE_BUTTON_ICONS[type]}
                    {TYPE_LABELS[type]}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>

        {/* Map container */}
        <div className="flex-1 relative" style={{ minHeight: 'calc(100vh - 180px)' }}>
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <StudyMap
              locations={locations}
              selectedLocation={selectedLocation}
              onSelectLocation={setSelectedLocation}
              onUserLocated={setUserPosition}
              mapboxToken={mapboxToken}
            />
          )}

          {/* Location details card */}
          {selectedLocation && (
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
              <LocationCard
                location={selectedLocation}
                onClose={() => setSelectedLocation(null)}
              />
            </div>
          )}

          {/* Nearby locations list */}
          {userPosition && !selectedLocation && (
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
              <NearbyLocationsList
                locations={locations}
                userPosition={userPosition}
                onSelectLocation={(loc) => setSelectedLocation(loc)}
                onClose={() => setUserPosition(null)}
              />
            </div>
          )}

          {/* Location count badge */}
          <div className="absolute top-4 right-4 bg-background/95 backdrop-blur rounded-full px-4 py-2 shadow-lg z-10">
            <span className="text-sm font-medium">
              {locations.length} locuri găsite
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
