import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AppRole = "admin" | "moderator" | "user";

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export const useUserRoles = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);

  const fetchRoles = useCallback(async () => {
    if (!user?.id) {
      setRoles([]);
      setIsAdmin(false);
      setIsModerator(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;

      const userRoles = (data || []).map((r: any) => r.role as AppRole);
      setRoles(userRoles);
      setIsAdmin(userRoles.includes('admin'));
      setIsModerator(userRoles.includes('moderator') || userRoles.includes('admin'));
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setRoles([]);
      setIsAdmin(false);
      setIsModerator(false);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Assign role to user (admin only)
  const assignRole = useCallback(async (targetUserId: string, role: AppRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: targetUserId, role });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error assigning role:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Remove role from user (admin only)
  const removeRole = useCallback(async (targetUserId: string, role: AppRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', targetUserId)
        .eq('role', role);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error removing role:', error);
      return { success: false, error: error.message };
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    isAdmin,
    isModerator,
    loading,
    assignRole,
    removeRole,
    refresh: fetchRoles,
  };
};
