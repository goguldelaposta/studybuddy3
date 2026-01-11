import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  reported_content_type: string;
  reported_content_id: string;
  reason: string;
  description: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  resolution_notes: string | null;
  created_at: string;
  reporter?: {
    full_name: string;
    email: string;
  };
  reported_user?: {
    full_name: string;
    email: string;
  };
}

export interface Suspension {
  id: string;
  user_id: string;
  suspended_by: string;
  reason: string;
  suspended_at: string;
  suspended_until: string | null;
  is_active: boolean;
  lifted_by: string | null;
  lifted_at: string | null;
  user?: {
    full_name: string;
    email: string;
  };
  suspended_by_user?: {
    full_name: string;
  };
}

export const useModeration = () => {
  const { user } = useAuth();
  const { isAdmin, isModerator } = useUserRoles();
  const [reports, setReports] = useState<Report[]>([]);
  const [suspensions, setSuspensions] = useState<Suspension[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    if (!isAdmin && !isModerator) return;

    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch reporter and reported user profiles
      const reportsWithProfiles = await Promise.all(
        (data || []).map(async (report: any) => {
          const { data: reporterProfile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("user_id", report.reporter_id)
            .single();

          let reportedUserProfile = null;
          if (report.reported_user_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, email")
              .eq("user_id", report.reported_user_id)
              .single();
            reportedUserProfile = profile;
          }

          return {
            ...report,
            reporter: reporterProfile,
            reported_user: reportedUserProfile,
          };
        })
      );

      setReports(reportsWithProfiles);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  }, [isAdmin, isModerator]);

  const fetchSuspensions = useCallback(async () => {
    if (!isAdmin && !isModerator) return;

    try {
      const { data, error } = await supabase
        .from("user_suspensions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user profiles
      const suspensionsWithProfiles = await Promise.all(
        (data || []).map(async (suspension: any) => {
          const { data: userProfile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("user_id", suspension.user_id)
            .single();

          const { data: suspendedByProfile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", suspension.suspended_by)
            .single();

          return {
            ...suspension,
            user: userProfile,
            suspended_by_user: suspendedByProfile,
          };
        })
      );

      setSuspensions(suspensionsWithProfiles);
    } catch (error) {
      console.error("Error fetching suspensions:", error);
    }
  }, [isAdmin, isModerator]);

  const updateReportStatus = async (
    reportId: string,
    status: string,
    resolutionNotes?: string
  ) => {
    try {
      const { error } = await supabase
        .from("reports")
        .update({
          status,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          resolution_notes: resolutionNotes || null,
        })
        .eq("id", reportId);

      if (error) throw error;
      await fetchReports();
      return { success: true };
    } catch (error: any) {
      console.error("Error updating report:", error);
      return { success: false, error: error.message };
    }
  };

  const suspendUser = async (
    targetUserId: string,
    reason: string,
    suspendedUntil?: string
  ) => {
    try {
      const { error } = await supabase.from("user_suspensions").insert({
        user_id: targetUserId,
        suspended_by: user?.id,
        reason,
        suspended_until: suspendedUntil || null,
      });

      if (error) throw error;
      await fetchSuspensions();
      return { success: true };
    } catch (error: any) {
      console.error("Error suspending user:", error);
      return { success: false, error: error.message };
    }
  };

  const liftSuspension = async (suspensionId: string) => {
    if (!isAdmin) return { success: false, error: "Only admins can lift suspensions" };

    try {
      const { error } = await supabase
        .from("user_suspensions")
        .update({
          is_active: false,
          lifted_by: user?.id,
          lifted_at: new Date().toISOString(),
        })
        .eq("id", suspensionId);

      if (error) throw error;
      await fetchSuspensions();
      return { success: true };
    } catch (error: any) {
      console.error("Error lifting suspension:", error);
      return { success: false, error: error.message };
    }
  };

  const moderateContent = async (
    table: "announcements" | "groups",
    contentId: string,
    status: "approved" | "rejected" | "pending",
    notes?: string
  ) => {
    try {
      const { error } = await supabase
        .from(table)
        .update({
          moderation_status: status,
          moderated_by: user?.id,
          moderated_at: new Date().toISOString(),
          moderation_notes: notes || null,
        })
        .eq("id", contentId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("Error moderating content:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteContent = async (table: "announcements" | "groups", contentId: string) => {
    if (!isAdmin) return { success: false, error: "Only admins can delete content" };

    try {
      const { error } = await supabase.from(table).delete().eq("id", contentId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting content:", error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchReports(), fetchSuspensions()]);
      setLoading(false);
    };

    if (isAdmin || isModerator) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAdmin, isModerator, fetchReports, fetchSuspensions]);

  return {
    reports,
    suspensions,
    loading,
    updateReportStatus,
    suspendUser,
    liftSuspension,
    moderateContent,
    deleteContent,
    refreshReports: fetchReports,
    refreshSuspensions: fetchSuspensions,
  };
};
