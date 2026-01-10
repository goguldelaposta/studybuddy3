import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  faculty: string;
  year_of_study: number;
  bio: string | null;
  avatar_url: string | null;
  looking_for: string;
  created_at: string;
  updated_at: string;
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
}

interface ProfileWithRelations extends Profile {
  skills: string[];
  subjects: string[];
}

interface Filters {
  search: string;
  faculty: string;
  skills: string[];
  subjects: string[];
  lookingFor: string;
}

export const useProfiles = () => {
  const [profiles, setProfiles] = useState<ProfileWithRelations[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculties, setFaculties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState<ProfileWithRelations | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch skills and subjects
  useEffect(() => {
    const fetchMetadata = async () => {
      const [skillsResult, subjectsResult] = await Promise.all([
        supabase.from("skills").select("*"),
        supabase.from("subjects").select("*"),
      ]);

      if (skillsResult.data) setSkills(skillsResult.data);
      if (subjectsResult.data) {
        setSubjects(subjectsResult.data);
        const uniqueFaculties = [...new Set(subjectsResult.data.map((s) => s.faculty))];
        setFaculties(uniqueFaculties);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch all profiles with their skills and subjects
  const fetchProfiles = async (filters?: Filters) => {
    setLoading(true);
    try {
      // Fetch profiles
      let query = supabase.from("profiles").select("*");

      if (filters?.faculty) {
        query = query.eq("faculty", filters.faculty);
      }
      if (filters?.lookingFor) {
        query = query.eq("looking_for", filters.lookingFor);
      }
      if (filters?.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`
        );
      }

      const { data: profilesData, error } = await query;

      if (error) throw error;

      // Fetch profile skills and subjects for each profile
      const profilesWithRelations = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const [skillsResult, subjectsResult] = await Promise.all([
            supabase
              .from("profile_skills")
              .select("skill_id, skills(name)")
              .eq("profile_id", profile.id),
            supabase
              .from("profile_subjects")
              .select("subject_id, subjects(name)")
              .eq("profile_id", profile.id),
          ]);

          return {
            ...profile,
            skills: skillsResult.data?.map((ps: any) => ps.skills?.name).filter(Boolean) || [],
            subjects: subjectsResult.data?.map((ps: any) => ps.subjects?.name).filter(Boolean) || [],
          };
        })
      );

      // Apply skill/subject filters client-side (since they require joins)
      let filteredProfiles = profilesWithRelations;
      
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
        title: "Error",
        description: "Failed to load profiles",
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
        const [skillsResult, subjectsResult] = await Promise.all([
          supabase
            .from("profile_skills")
            .select("skill_id, skills(name)")
            .eq("profile_id", profile.id),
          supabase
            .from("profile_subjects")
            .select("subject_id, subjects(name)")
            .eq("profile_id", profile.id),
        ]);

        setCurrentUserProfile({
          ...profile,
          skills: skillsResult.data?.map((ps: any) => ps.skills?.name).filter(Boolean) || [],
          subjects: subjectsResult.data?.map((ps: any) => ps.subjects?.name).filter(Boolean) || [],
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
  }) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save your profile",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Upsert profile
      const profileData = {
        user_id: user.id,
        full_name: data.fullName,
        email: user.email || "",
        faculty: data.faculty,
        year_of_study: data.yearOfStudy,
        bio: data.bio,
        looking_for: data.lookingFor,
      };

      let profileId: string;

      if (currentUserProfile) {
        // Update existing profile
        const { error } = await supabase
          .from("profiles")
          .update(profileData)
          .eq("id", currentUserProfile.id);
        if (error) throw error;
        profileId = currentUserProfile.id;
      } else {
        // Insert new profile
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
        title: "Success!",
        description: "Your profile has been saved.",
      });

      await fetchCurrentUserProfile();
      return true;
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile",
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
    faculties,
    loading,
    currentUserProfile,
    fetchProfiles,
    saveProfile,
    refetch: fetchProfiles,
  };
};
