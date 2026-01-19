export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          category: string
          contact_info: string | null
          created_at: string
          currency: string | null
          description: string
          expires_at: string | null
          id: string
          image_url: string | null
          is_active: boolean
          moderated_at: string | null
          moderated_by: string | null
          moderation_notes: string | null
          moderation_status: string
          price: number | null
          title: string
          university_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          contact_info?: string | null
          created_at?: string
          currency?: string | null
          description: string
          expires_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          moderation_status?: string
          price?: number | null
          title: string
          university_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          contact_info?: string | null
          created_at?: string
          currency?: string | null
          description?: string
          expires_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          moderation_status?: string
          price?: number | null
          title?: string
          university_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          resource: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      automated_emails_log: {
        Row: {
          email_type: string
          id: string
          sent_at: string
          user_id: string
        }
        Insert: {
          email_type: string
          id?: string
          sent_at?: string
          user_id: string
        }
        Update: {
          email_type?: string
          id?: string
          sent_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automated_emails_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          automatic_criteria: string | null
          category: string
          color: string
          created_at: string
          description: string
          icon: string
          id: string
          is_manual: boolean | null
          name: string
          points_required: number | null
        }
        Insert: {
          automatic_criteria?: string | null
          category?: string
          color?: string
          created_at?: string
          description: string
          icon: string
          id?: string
          is_manual?: boolean | null
          name: string
          points_required?: number | null
        }
        Update: {
          automatic_criteria?: string | null
          category?: string
          color?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_manual?: boolean | null
          name?: string
          points_required?: number | null
        }
        Relationships: []
      }
      blocked_ips: {
        Row: {
          attempt_count: number
          blocked_at: string
          blocked_until: string
          created_at: string
          id: string
          ip_address: string
          is_active: boolean
          reason: string
          unblocked_at: string | null
          unblocked_by: string | null
        }
        Insert: {
          attempt_count?: number
          blocked_at?: string
          blocked_until: string
          created_at?: string
          id?: string
          ip_address: string
          is_active?: boolean
          reason?: string
          unblocked_at?: string | null
          unblocked_by?: string | null
        }
        Update: {
          attempt_count?: number
          blocked_at?: string
          blocked_until?: string
          created_at?: string
          id?: string
          ip_address?: string
          is_active?: boolean
          reason?: string
          unblocked_at?: string | null
          unblocked_by?: string | null
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          participant_1: string
          participant_2: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          participant_1: string
          participant_2: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          participant_1?: string
          participant_2?: string
          updated_at?: string
        }
        Relationships: []
      }
      exams: {
        Row: {
          created_at: string
          created_by: string
          exam_date: string
          faculty: string
          id: string
          location: string | null
          subject: string
          updated_at: string
          year: number | null
        }
        Insert: {
          created_at?: string
          created_by: string
          exam_date: string
          faculty: string
          id?: string
          location?: string | null
          subject: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string
          exam_date?: string
          faculty?: string
          id?: string
          location?: string | null
          subject?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_public: boolean
          max_members: number | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_notes: string | null
          moderation_status: string
          name: string
          subject_id: string | null
          university_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean
          max_members?: number | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          moderation_status?: string
          name: string
          subject_id?: string | null
          university_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean
          max_members?: number | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          moderation_status?: string
          name?: string
          subject_id?: string | null
          university_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_whitelist: {
        Row: {
          added_by: string | null
          created_at: string
          description: string | null
          id: string
          ip_address: string
          updated_at: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          description?: string | null
          id?: string
          ip_address: string
          updated_at?: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          description?: string | null
          id?: string
          ip_address?: string
          updated_at?: string
        }
        Relationships: []
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_queue: {
        Row: {
          created_at: string
          created_by: string
          failed_count: number | null
          id: string
          message: string
          send_at: string
          sent_at: string | null
          sent_count: number | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          failed_count?: number | null
          id?: string
          message: string
          send_at: string
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          failed_count?: number | null
          id?: string
          message?: string
          send_at?: string
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_templates: {
        Row: {
          created_at: string
          created_by: string
          id: string
          message: string
          name: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          message: string
          name: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          message?: string
          name?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          created_at: string
          description: string | null
          downloads: number
          faculty: string | null
          file_url: string | null
          id: string
          subject: string
          title: string
          updated_at: string
          user_id: string
          year: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          downloads?: number
          faculty?: string | null
          file_url?: string | null
          id?: string
          subject: string
          title: string
          updated_at?: string
          user_id: string
          year?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          downloads?: number
          faculty?: string | null
          file_url?: string | null
          id?: string
          subject?: string
          title?: string
          updated_at?: string
          user_id?: string
          year?: number | null
        }
        Relationships: []
      }
      profile_skills: {
        Row: {
          id: string
          profile_id: string
          skill_id: string
        }
        Insert: {
          id?: string
          profile_id: string
          skill_id: string
        }
        Update: {
          id?: string
          profile_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_subjects: {
        Row: {
          id: string
          profile_id: string
          subject_id: string
        }
        Insert: {
          id?: string
          profile_id: string
          subject_id: string
        }
        Update: {
          id?: string
          profile_id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_subjects_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          faculty: string
          full_name: string
          gdpr_consent: boolean | null
          gdpr_consent_at: string | null
          id: string
          last_seen: string | null
          looking_for: string | null
          online_status: string | null
          privacy_settings: Json | null
          university_id: string | null
          updated_at: string
          user_id: string | null
          year_of_study: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          faculty: string
          full_name: string
          gdpr_consent?: boolean | null
          gdpr_consent_at?: string | null
          id?: string
          last_seen?: string | null
          looking_for?: string | null
          online_status?: string | null
          privacy_settings?: Json | null
          university_id?: string | null
          updated_at?: string
          user_id?: string | null
          year_of_study?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          faculty?: string
          full_name?: string
          gdpr_consent?: boolean | null
          gdpr_consent_at?: string | null
          id?: string
          last_seen?: string | null
          looking_for?: string | null
          online_status?: string | null
          privacy_settings?: Json | null
          university_id?: string | null
          updated_at?: string
          user_id?: string | null
          year_of_study?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_content_id: string
          reported_content_type: string
          reported_user_id: string | null
          reporter_id: string
          resolution_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_content_id: string
          reported_content_type: string
          reported_user_id?: string | null
          reporter_id: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_content_id?: string
          reported_content_type?: string
          reported_user_id?: string | null
          reporter_id?: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string
          id: string
          name: string
        }
        Insert: {
          category?: string
          id?: string
          name: string
        }
        Update: {
          category?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      study_locations: {
        Row: {
          added_by: string | null
          address: string
          amenities: string[] | null
          city: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_verified: boolean | null
          latitude: number
          longitude: number
          name: string
          opening_hours: string | null
          price_range: string | null
          rating: number | null
          reviews_count: number | null
          type: string
          updated_at: string
          website: string | null
        }
        Insert: {
          added_by?: string | null
          address: string
          amenities?: string[] | null
          city?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_verified?: boolean | null
          latitude: number
          longitude: number
          name: string
          opening_hours?: string | null
          price_range?: string | null
          rating?: number | null
          reviews_count?: number | null
          type: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          added_by?: string | null
          address?: string
          amenities?: string[] | null
          city?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_verified?: boolean | null
          latitude?: number
          longitude?: number
          name?: string
          opening_hours?: string | null
          price_range?: string | null
          rating?: number | null
          reviews_count?: number | null
          type?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      subjects: {
        Row: {
          code: string | null
          faculty: string
          id: string
          name: string
          university_id: string | null
        }
        Insert: {
          code?: string | null
          faculty: string
          id?: string
          name: string
          university_id?: string | null
        }
        Update: {
          code?: string | null
          faculty?: string
          id?: string
          name?: string
          university_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subjects_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      universities: {
        Row: {
          city: string
          created_at: string
          id: string
          name: string
          short_name: string
          website: string | null
        }
        Insert: {
          city?: string
          created_at?: string
          id?: string
          name: string
          short_name: string
          website?: string | null
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          name?: string
          short_name?: string
          website?: string | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_suspensions: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          lifted_at: string | null
          lifted_by: string | null
          reason: string
          suspended_at: string
          suspended_by: string
          suspended_until: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          lifted_at?: string | null
          lifted_by?: string | null
          reason: string
          suspended_at?: string
          suspended_by: string
          suspended_until?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          lifted_at?: string | null
          lifted_by?: string | null
          reason?: string
          suspended_at?: string
          suspended_by?: string
          suspended_until?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      announcements_public: {
        Row: {
          category: string | null
          contact_info: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          expires_at: string | null
          id: string | null
          image_url: string | null
          is_active: boolean | null
          price: number | null
          title: string | null
          university_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          contact_info?: never
          created_at?: string | null
          currency?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          price?: number | null
          title?: string | null
          university_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          contact_info?: never
          created_at?: string | null
          currency?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          price?: number | null
          title?: string | null
          university_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      are_friends: {
        Args: { user1_id: string; user2_id: string }
        Returns: boolean
      }
      are_users_connected: {
        Args: { profile_user_id: string; viewer_id: string }
        Returns: boolean
      }
      award_badge: {
        Args: { p_badge_name: string; p_user_id: string }
        Returns: boolean
      }
      award_verified_badge: { Args: { p_user_id: string }; Returns: boolean }
      award_veteran_badges: { Args: never; Returns: undefined }
      check_and_award_badges: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      get_profile_visibility: {
        Args: { profile_user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_ip_blocked: { Args: { check_ip: string }; Returns: boolean }
      is_ip_whitelisted: { Args: { check_ip: string }; Returns: boolean }
      is_user_blocked: {
        Args: { checker_id: string; target_id: string }
        Returns: boolean
      }
      is_user_suspended: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
