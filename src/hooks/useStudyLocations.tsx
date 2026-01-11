import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type LocationType = 'cafe' | 'library' | 'bookstore' | 'coworking' | 'university' | 'other';
export type PriceRange = 'free' | 'budget' | 'moderate' | 'expensive';

export interface StudyLocation {
  id: string;
  name: string;
  description: string | null;
  type: LocationType;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  price_range: PriceRange | null;
  amenities: string[];
  opening_hours: string | null;
  website: string | null;
  image_url: string | null;
  rating: number;
  reviews_count: number;
  is_verified: boolean;
  created_at: string;
}

export const TYPE_LABELS: Record<LocationType, string> = {
  cafe: 'Cafenea',
  library: 'Bibliotecă',
  bookstore: 'Librărie',
  coworking: 'Coworking',
  university: 'Universitate',
  other: 'Altele',
};

export const TYPE_ICONS: Record<LocationType, string> = {
  cafe: '☕',
  library: '📚',
  bookstore: '📖',
  coworking: '💻',
  university: '🎓',
  other: '📍',
};

export const PRICE_LABELS: Record<PriceRange, string> = {
  free: 'Gratuit',
  budget: 'Accesibil',
  moderate: 'Moderat',
  expensive: 'Premium',
};

export const AMENITY_LABELS: Record<string, string> = {
  wifi: 'WiFi',
  prize: 'Prize',
  cafea: 'Cafea',
  aer_conditionat: 'Aer condiționat',
  liniste: 'Liniște',
  grup: 'Spațiu de grup',
  carti: 'Cărți',
  jocuri: 'Jocuri',
  imprimanta: 'Imprimantă',
};

export function useStudyLocations() {
  const [locations, setLocations] = useState<StudyLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<LocationType | null>(null);

  const fetchLocations = useCallback(async (type?: LocationType | null) => {
    setLoading(true);
    try {
      let query = supabase
        .from("study_locations")
        .select("*")
        .order("name");

      if (type) {
        query = query.eq("type", type);
      }

      const { data, error } = await query;

      if (error) throw error;

      const typedData = (data || []).map((loc) => ({
        ...loc,
        type: loc.type as LocationType,
        price_range: loc.price_range as PriceRange | null,
        amenities: loc.amenities || [],
        rating: Number(loc.rating) || 0,
      }));

      setLocations(typedData);
    } catch (error) {
      console.error("Error fetching study locations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations(selectedType);
  }, [selectedType, fetchLocations]);

  return {
    locations,
    loading,
    selectedType,
    setSelectedType,
    fetchLocations,
  };
}
