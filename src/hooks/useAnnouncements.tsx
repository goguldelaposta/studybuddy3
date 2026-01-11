import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export type AnnouncementCategory = 'tutoring' | 'books' | 'roommate' | 'events' | 'jobs' | 'other';

export interface Announcement {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: AnnouncementCategory;
  price: number | null;
  currency: string | null;
  contact_info: string | null;
  university_id: string | null;
  image_url: string | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  university?: {
    id: string;
    name: string;
    short_name: string;
  };
  author?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    faculty: string;
  };
}

export interface CreateAnnouncementData {
  title: string;
  description: string;
  category: AnnouncementCategory;
  price?: number;
  currency?: string;
  contact_info?: string;
  university_id?: string;
  expires_at?: string;
}

export const CATEGORY_LABELS: Record<AnnouncementCategory, string> = {
  tutoring: 'Meditații',
  books: 'Cărți & Materiale',
  roommate: 'Coleg de cameră',
  events: 'Evenimente',
  jobs: 'Joburi & Internship-uri',
  other: 'Altele',
};

export const CATEGORY_ICONS: Record<AnnouncementCategory, string> = {
  tutoring: '📚',
  books: '📖',
  roommate: '🏠',
  events: '🎉',
  jobs: '💼',
  other: '📌',
};

export function useAnnouncements() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [myAnnouncements, setMyAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all active announcements
  const fetchAnnouncements = useCallback(async (category?: AnnouncementCategory) => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from("announcements")
        .select(`
          *,
          university:universities(id, name, short_name)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Enrich with author info
      const enrichedAnnouncements = await Promise.all(
        (data || []).map(async (announcement) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, faculty")
            .eq("user_id", announcement.user_id)
            .single();

          return {
            ...announcement,
            category: announcement.category as AnnouncementCategory,
            author: profile || undefined,
          };
        })
      );

      setAnnouncements(enrichedAnnouncements);
    } catch (error: any) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch user's own announcements
  const fetchMyAnnouncements = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select(`
          *,
          university:universities(id, name, short_name)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const typedData = (data || []).map((a) => ({
        ...a,
        category: a.category as AnnouncementCategory,
      }));

      setMyAnnouncements(typedData);
    } catch (error: any) {
      console.error("Error fetching my announcements:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create a new announcement
  const createAnnouncement = useCallback(
    async (data: CreateAnnouncementData): Promise<string | null> => {
      if (!user) return null;

      try {
        const { data: newAnnouncement, error } = await supabase
          .from("announcements")
          .insert({
            user_id: user.id,
            title: data.title,
            description: data.description,
            category: data.category,
            price: data.price || null,
            currency: data.currency || 'RON',
            contact_info: data.contact_info || null,
            university_id: data.university_id || null,
            expires_at: data.expires_at || null,
          })
          .select("id")
          .single();

        if (error) throw error;

        toast({
          title: "Succes!",
          description: "Anunțul a fost publicat.",
        });

        fetchAnnouncements();
        fetchMyAnnouncements();

        return newAnnouncement.id;
      } catch (error: any) {
        console.error("Error creating announcement:", error);
        toast({
          title: "Eroare",
          description: "Nu am putut publica anunțul.",
          variant: "destructive",
        });
        return null;
      }
    },
    [user, toast, fetchAnnouncements, fetchMyAnnouncements]
  );

  // Update an announcement
  const updateAnnouncement = useCallback(
    async (id: string, data: Partial<CreateAnnouncementData>): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error } = await supabase
          .from("announcements")
          .update(data)
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) throw error;

        toast({
          title: "Succes!",
          description: "Anunțul a fost actualizat.",
        });

        fetchAnnouncements();
        fetchMyAnnouncements();

        return true;
      } catch (error: any) {
        console.error("Error updating announcement:", error);
        toast({
          title: "Eroare",
          description: "Nu am putut actualiza anunțul.",
          variant: "destructive",
        });
        return false;
      }
    },
    [user, toast, fetchAnnouncements, fetchMyAnnouncements]
  );

  // Toggle announcement active status
  const toggleAnnouncementStatus = useCallback(
    async (id: string, isActive: boolean): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error } = await supabase
          .from("announcements")
          .update({ is_active: isActive })
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) throw error;

        toast({
          title: isActive ? "Anunț activat" : "Anunț dezactivat",
          description: isActive 
            ? "Anunțul este acum vizibil pentru toți." 
            : "Anunțul nu mai este vizibil.",
        });

        fetchAnnouncements();
        fetchMyAnnouncements();

        return true;
      } catch (error: any) {
        console.error("Error toggling announcement:", error);
        return false;
      }
    },
    [user, toast, fetchAnnouncements, fetchMyAnnouncements]
  );

  // Delete an announcement
  const deleteAnnouncement = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error } = await supabase
          .from("announcements")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) throw error;

        toast({
          title: "Anunț șters",
          description: "Anunțul a fost șters definitiv.",
        });

        fetchAnnouncements();
        fetchMyAnnouncements();

        return true;
      } catch (error: any) {
        console.error("Error deleting announcement:", error);
        toast({
          title: "Eroare",
          description: "Nu am putut șterge anunțul.",
          variant: "destructive",
        });
        return false;
      }
    },
    [user, toast, fetchAnnouncements, fetchMyAnnouncements]
  );

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchAnnouncements();
      fetchMyAnnouncements();
    }
  }, [user, fetchAnnouncements, fetchMyAnnouncements]);

  return {
    announcements,
    myAnnouncements,
    loading,
    fetchAnnouncements,
    fetchMyAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    toggleAnnouncementStatus,
    deleteAnnouncement,
  };
}
