import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { PrivacySettingsData, getDefaultPrivacySettings } from "@/components/PrivacySettings";
import { Badge as BadgeType, UserBadge } from "@/hooks/useBadges";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  faculty: string;
  year_of_study: number;
  bio: string | null;
  avatar_url: string | null;
  looking_for: string;
  university_id: string | null;
  created_at: string;
  updated_at: string;
  privacy_settings: PrivacySettingsData | null;
}

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface Subject {
  id: string;
  name: string;
  code: string | null;
  faculty: string;
  university_id: string | null;
}

interface University {
  id: string;
  name: string;
  short_name: string;
  city: string;
  website: string | null;
}

interface ProfileWithRelations extends Profile {
  skills: string[];
  subjects: string[];
  university?: University;
  privacy_settings: PrivacySettingsData;
  userBadges?: UserBadge[];
}

interface Filters {
  search: string;
  faculty: string;
  skills: string[];
  subjects: string[];
  lookingFor: string;
  universityId?: string;
}

export const useProfiles = () => {
  const [profiles, setProfiles] = useState<ProfileWithRelations[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [faculties, setFaculties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState<ProfileWithRelations | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch skills, subjects, and universities
  useEffect(() => {
    const fetchMetadata = async () => {
      const [skillsResult, subjectsResult, universitiesResult] = await Promise.all([
        supabase.from("skills").select("*").order("name"),
        supabase.from("subjects").select("*").order("name"),
        supabase.from("universities").select("*").order("name"),
      ]);

      if (skillsResult.data) setSkills(skillsResult.data);
      if (subjectsResult.data) {
        setSubjects(subjectsResult.data);
        const uniqueFaculties = [...new Set(subjectsResult.data.map((s) => s.faculty))];
        setFaculties(uniqueFaculties);
      }
      if (universitiesResult.data) setUniversities(universitiesResult.data);
    };
    fetchMetadata();
  }, []);

  // Fetch all profiles with their skills and subjects
  const fetchProfiles = async (filters?: Filters) => {
    setLoading(true);
    try {
      // Query profiles table - email protection is handled at database level via RLS
      let query = supabase.from("profiles").select("*");

      if (filters?.faculty) {
        query = query.eq("faculty", filters.faculty);
      }
      if (filters?.lookingFor) {
        query = query.eq("looking_for", filters.lookingFor);
      }
      if (filters?.universityId) {
        query = query.eq("university_id", filters.universityId);
      }
      if (filters?.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`
        );
      }

      const { data: profilesData, error } = await query;

      if (error) throw error;

      const profilesWithRelations = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const [skillsResult, subjectsResult, universityResult, badgesResult] = await Promise.all([
            supabase
              .from("profile_skills")
              .select("skill_id, skills(name)")
              .eq("profile_id", profile.id),
            supabase
              .from("profile_subjects")
              .select("subject_id, subjects(name)")
              .eq("profile_id", profile.id),
            profile.university_id 
              ? supabase.from("universities").select("*").eq("id", profile.university_id).single()
              : Promise.resolve({ data: null }),
            profile.user_id
              ? supabase
                  .from("user_badges")
                  .select("*, badge:badges(*)")
                  .eq("user_id", profile.user_id)
              : Promise.resolve({ data: null }),
          ]);

          const mappedBadges: UserBadge[] = (badgesResult.data || []).map((ub: any) => ({
            id: ub.id,
            user_id: ub.user_id,
            badge_id: ub.badge_id,
            earned_at: ub.earned_at,
            badge: ub.badge as BadgeType,
          }));

          return {
            ...profile,
            skills: skillsResult.data?.map((ps: any) => ps.skills?.name).filter(Boolean) || [],
            subjects: subjectsResult.data?.map((ps: any) => ps.subjects?.name).filter(Boolean) || [],
            university: universityResult.data || undefined,
            privacy_settings: (profile.privacy_settings as unknown as PrivacySettingsData) || getDefaultPrivacySettings(),
            userBadges: mappedBadges,
          };
        })
      );

      // De-duplicate profiles.
      // Prefer user_id (one profile per auth user). Fall back to id for seed/anonymous rows.
      // If duplicates exist, keep the most recently updated.
      const uniqueProfilesMap = new Map<string, ProfileWithRelations>();
      for (const profile of profilesWithRelations) {
        const key = profile.user_id || profile.id;
        const existing = uniqueProfilesMap.get(key);

        if (!existing) {
          uniqueProfilesMap.set(key, profile);
          continue;
        }

        const existingUpdated = new Date(existing.updated_at).getTime();
        const incomingUpdated = new Date(profile.updated_at).getTime();
        if (incomingUpdated >= existingUpdated) {
          uniqueProfilesMap.set(key, profile);
        }
      }

      let filteredProfiles = Array.from(uniqueProfilesMap.values());
      
      if (filters?.skills && filters.skills.length > 0) {
        filteredProfiles = filteredProfiles.filter((p) =>
          filters.skills.some((skill) => p.skills.includes(skill))
        );
      }
      
      if (filters?.subjects && filters.subjects.length > 0) {
        filteredProfiles = filteredProfiles.filter((p) =>
          filters.subjects.some((subject) => p.subjects.includes(subject))
        );
      }

      setProfiles(filteredProfiles);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca profilurile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch current user's profile
  const fetchCurrentUserProfile = async () => {
    if (!user) {
      setCurrentUserProfile(null);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (profile) {
        const [skillsResult, subjectsResult, universityResult] = await Promise.all([
          supabase
            .from("profile_skills")
            .select("skill_id, skills(name)")
            .eq("profile_id", profile.id),
          supabase
            .from("profile_subjects")
            .select("subject_id, subjects(name)")
            .eq("profile_id", profile.id),
          profile.university_id 
            ? supabase.from("universities").select("*").eq("id", profile.university_id).single()
            : Promise.resolve({ data: null }),
        ]);

        setCurrentUserProfile({
          ...profile,
          skills: skillsResult.data?.map((ps: any) => ps.skills?.name).filter(Boolean) || [],
          subjects: subjectsResult.data?.map((ps: any) => ps.subjects?.name).filter(Boolean) || [],
          university: universityResult.data || undefined,
          privacy_settings: (profile.privacy_settings as unknown as PrivacySettingsData) || getDefaultPrivacySettings(),
        });
      } else {
        setCurrentUserProfile(null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Create or update profile
  const saveProfile = async (data: {
    fullName: string;
    faculty: string;
    yearOfStudy: number;
    bio: string;
    lookingFor: string;
    skills: string[];
    subjects: string[];
    universityId?: string;
  }) => {
    if (!user) {
      toast({
        title: "Eroare",
        description: "Trebuie să fii autentificat pentru a salva profilul",
        variant: "destructive",
      });
      return false;
    }

    try {
      const profileData = {
        user_id: user.id,
        full_name: data.fullName,
        email: user.email || "",
        faculty: data.faculty,
        year_of_study: data.yearOfStudy,
        bio: data.bio,
        looking_for: data.lookingFor,
        university_id: data.universityId || null,
      };

      let profileId: string;

      if (currentUserProfile) {
        const { error } = await supabase
          .from("profiles")
          .update(profileData)
          .eq("id", currentUserProfile.id);
        if (error) throw error;
        profileId = currentUserProfile.id;
      } else {
        const { data: newProfile, error } = await supabase
          .from("profiles")
          .insert(profileData)
          .select()
          .single();
        if (error) throw error;
        profileId = newProfile.id;
      }

      // Update skills
      await supabase.from("profile_skills").delete().eq("profile_id", profileId);

      if (data.skills.length > 0) {
        const skillIds = skills
          .filter((s) => data.skills.includes(s.name))
          .map((s) => ({ profile_id: profileId, skill_id: s.id }));

        if (skillIds.length > 0) {
          await supabase.from("profile_skills").insert(skillIds);
        }
      }

      // Update subjects
      await supabase.from("profile_subjects").delete().eq("profile_id", profileId);

      if (data.subjects.length > 0) {
        const subjectIds = subjects
          .filter((s) => data.subjects.includes(s.name))
          .map((s) => ({ profile_id: profileId, subject_id: s.id }));

        if (subjectIds.length > 0) {
          await supabase.from("profile_subjects").insert(subjectIds);
        }
      }

      toast({
        title: "Succes!",
        description: "Profilul tău a fost salvat.",
      });

      await fetchCurrentUserProfile();
      return true;
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut salva profilul",
        variant: "destructive",
      });
      return false;
    }
  };

  // Save privacy settings
  const savePrivacySettings = async (settings: PrivacySettingsData) => {
    if (!user || !currentUserProfile) {
      toast({
        title: "Eroare",
        description: "Trebuie să fii autentificat pentru a salva setările",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ privacy_settings: JSON.parse(JSON.stringify(settings)) })
        .eq("id", currentUserProfile.id);

      if (error) throw error;

      toast({
        title: "Succes!",
        description: "Setările de confidențialitate au fost salvate.",
      });

      await fetchCurrentUserProfile();
      return true;
    } catch (error) {
      console.error("Error saving privacy settings:", error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut salva setările",
        variant: "destructive",
      });
      return false;
    }
  };

  // Save avatar URL
  const saveAvatarUrl = async (avatarUrl: string | null) => {
    if (!user || !currentUserProfile) {
      toast({
        title: "Eroare",
        description: "Trebuie să fii autentificat pentru a salva poza",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", currentUserProfile.id);

      if (error) throw error;

      await fetchCurrentUserProfile();
      return true;
    } catch (error) {
      console.error("Error saving avatar:", error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut salva poza de profil",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    fetchCurrentUserProfile();
  }, [user]);

  return {
    profiles,
    skills,
    subjects,
    universities,
    faculties,
    loading,
    currentUserProfile,
    fetchProfiles,
    saveProfile,
    savePrivacySettings,
    saveAvatarUrl,
    refetch: fetchProfiles,
  };
};
