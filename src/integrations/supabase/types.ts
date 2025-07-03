export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_reports: {
        Row: {
          generated_at: string | null
          generated_by: string | null
          id: string
          metrics: Json
          report_date: string
          report_type: string
        }
        Insert: {
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          metrics: Json
          report_date: string
          report_type: string
        }
        Update: {
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          metrics?: Json
          report_date?: string
          report_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          content: string | null
          created_at: string | null
          created_by: string | null
          excerpt: string | null
          id: string
          published: boolean | null
          published_at: string | null
          slug: string
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          excerpt?: string | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          slug: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          excerpt?: string | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          slug?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_interactions: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          detected_language: string | null
          id: string
          matched_intent: string | null
          matched_service: string | null
          original_message: string
          response: string
          translated_message: string | null
          translated_response: string | null
          user_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          detected_language?: string | null
          id?: string
          matched_intent?: string | null
          matched_service?: string | null
          original_message: string
          response: string
          translated_message?: string | null
          translated_response?: string | null
          user_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          detected_language?: string | null
          id?: string
          matched_intent?: string | null
          matched_service?: string | null
          original_message?: string
          response?: string
          translated_message?: string | null
          translated_response?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_intents: {
        Row: {
          category: string
          created_at: string | null
          id: string
          intent_key: string
          keywords: Json
          response_template: Json
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          intent_key: string
          keywords: Json
          response_template: Json
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          intent_key?: string
          keywords?: Json
          response_template?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          anonymous: boolean | null
          created_at: string | null
          currency: string | null
          donor_email: string | null
          donor_name: string | null
          id: string
          message: string | null
          payment_id: string | null
          payment_method: string | null
          status: string | null
        }
        Insert: {
          amount: number
          anonymous?: boolean | null
          created_at?: string | null
          currency?: string | null
          donor_email?: string | null
          donor_name?: string | null
          id?: string
          message?: string | null
          payment_id?: string | null
          payment_method?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          anonymous?: boolean | null
          created_at?: string | null
          currency?: string | null
          donor_email?: string | null
          donor_name?: string | null
          id?: string
          message?: string | null
          payment_id?: string | null
          payment_method?: string | null
          status?: string | null
        }
        Relationships: []
      }
      match_logs: {
        Row: {
          assessment_id: string
          completed_at: string | null
          id: string
          match_criteria: Json
          match_score: number
          match_type: string
          matched_at: string | null
          provider_id: string
          provider_response: string | null
          responded_at: string | null
          status: string | null
          user_feedback: Json | null
          user_id: string
        }
        Insert: {
          assessment_id: string
          completed_at?: string | null
          id?: string
          match_criteria: Json
          match_score: number
          match_type: string
          matched_at?: string | null
          provider_id: string
          provider_response?: string | null
          responded_at?: string | null
          status?: string | null
          user_feedback?: Json | null
          user_id: string
        }
        Update: {
          assessment_id?: string
          completed_at?: string | null
          id?: string
          match_criteria?: Json
          match_score?: number
          match_type?: string
          matched_at?: string | null
          provider_id?: string
          provider_response?: string | null
          responded_at?: string | null
          status?: string | null
          user_feedback?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_logs_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "user_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_logs_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          read: boolean | null
          recipient_id: string | null
          sender_id: string | null
          subject: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          recipient_id?: string | null
          sender_id?: string | null
          subject?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          recipient_id?: string | null
          sender_id?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ngo_details: {
        Row: {
          capacity: number | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          location: string | null
          organization_name: string
          registration_number: string | null
          services_offered: string[] | null
          updated_at: string | null
          user_id: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          capacity?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          organization_name: string
          registration_number?: string | null
          services_offered?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          capacity?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          organization_name?: string
          registration_number?: string | null
          services_offered?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ngo_details_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          created_at: string | null
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          updated_at: string | null
          user_type: string
        }
        Insert: {
          age?: number | null
          created_at?: string | null
          full_name?: string | null
          id: string
          location?: string | null
          phone?: string | null
          updated_at?: string | null
          user_type?: string
        }
        Update: {
          age?: number | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          updated_at?: string | null
          user_type?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string
          contact_info: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          file_url: string | null
          id: string
          location: string | null
          published: boolean | null
          service_type: string | null
          summary: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          contact_info?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          location?: string | null
          published?: boolean | null
          service_type?: string | null
          summary?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          contact_info?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          location?: string | null
          published?: boolean | null
          service_type?: string | null
          summary?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_bookings: {
        Row: {
          booking_date: string
          created_at: string
          google_calendar_event_id: string | null
          id: string
          service_id: string
          service_title: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_date: string
          created_at?: string
          google_calendar_event_id?: string | null
          id?: string
          service_id: string
          service_title: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_date?: string
          created_at?: string
          google_calendar_event_id?: string | null
          id?: string
          service_id?: string
          service_title?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          capacity_info: Json | null
          contact_info: Json
          created_at: string | null
          created_by: string | null
          emergency_services: boolean | null
          id: string
          is_active: boolean | null
          languages_supported: string[]
          location_data: Json
          operating_hours: Json | null
          provider_name: string
          service_types: string[]
          updated_at: string | null
          verification_status: string | null
          vulnerability_specializations: string[] | null
        }
        Insert: {
          capacity_info?: Json | null
          contact_info: Json
          created_at?: string | null
          created_by?: string | null
          emergency_services?: boolean | null
          id?: string
          is_active?: boolean | null
          languages_supported: string[]
          location_data: Json
          operating_hours?: Json | null
          provider_name: string
          service_types: string[]
          updated_at?: string | null
          verification_status?: string | null
          vulnerability_specializations?: string[] | null
        }
        Update: {
          capacity_info?: Json | null
          contact_info?: Json
          created_at?: string | null
          created_by?: string | null
          emergency_services?: boolean | null
          id?: string
          is_active?: boolean | null
          languages_supported?: string[]
          location_data?: Json
          operating_hours?: Json | null
          provider_name?: string
          service_types?: string[]
          updated_at?: string | null
          verification_status?: string | null
          vulnerability_specializations?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "service_providers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          ngo_id: string | null
          response: string | null
          service_type: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          ngo_id?: string | null
          response?: string | null
          service_type: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          ngo_id?: string | null
          response?: string | null
          service_type?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_ngo_id_fkey"
            columns: ["ngo_id"]
            isOneToOne: false
            referencedRelation: "ngo_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests_tracking: {
        Row: {
          completed_at: string | null
          completion_time_hours: number | null
          created_at: string | null
          id: string
          language_used: string | null
          priority: string | null
          referral_made: boolean | null
          referral_successful: boolean | null
          responded_at: string | null
          response_time_hours: number | null
          service_type: string
          status: string | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          completion_time_hours?: number | null
          created_at?: string | null
          id?: string
          language_used?: string | null
          priority?: string | null
          referral_made?: boolean | null
          referral_successful?: boolean | null
          responded_at?: string | null
          response_time_hours?: number | null
          service_type: string
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          completion_time_hours?: number | null
          created_at?: string | null
          id?: string
          language_used?: string | null
          priority?: string | null
          referral_made?: boolean | null
          referral_successful?: boolean | null
          responded_at?: string | null
          response_time_hours?: number | null
          service_type?: string
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_schedule: {
        Row: {
          available_day: string
          available_time: string
          created_at: string
          duration_minutes: number
          id: string
          max_bookings: number
          service_id: string
        }
        Insert: {
          available_day: string
          available_time: string
          created_at?: string
          duration_minutes?: number
          id?: string
          max_bookings?: number
          service_id: string
        }
        Update: {
          available_day?: string
          available_time?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          max_bookings?: number
          service_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          availability: string | null
          category: string
          contact_phone: string | null
          contact_url: string | null
          created_at: string | null
          delivery_mode: string | null
          description: string | null
          id: string
          key_features: Json | null
          language_support: string | null
          location: string | null
          priority_level: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          availability?: string | null
          category: string
          contact_phone?: string | null
          contact_url?: string | null
          created_at?: string | null
          delivery_mode?: string | null
          description?: string | null
          id?: string
          key_features?: Json | null
          language_support?: string | null
          location?: string | null
          priority_level?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          availability?: string | null
          category?: string
          contact_phone?: string | null
          contact_url?: string | null
          created_at?: string | null
          delivery_mode?: string | null
          description?: string | null
          id?: string
          key_features?: Json | null
          language_support?: string | null
          location?: string | null
          priority_level?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      support_requests: {
        Row: {
          created_at: string | null
          id: string
          language: string | null
          message: string | null
          priority: string | null
          service_type: string | null
          status: string | null
          updated_at: string | null
          user_email: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          language?: string | null
          message?: string | null
          priority?: string | null
          service_type?: string | null
          status?: string | null
          updated_at?: string | null
          user_email?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          language?: string | null
          message?: string | null
          priority?: string | null
          service_type?: string | null
          status?: string | null
          updated_at?: string | null
          user_email?: string | null
        }
        Relationships: []
      }
      usage_stats: {
        Row: {
          action_type: string
          created_at: string | null
          device_type: string | null
          id: string
          language_preference: string | null
          page_visited: string | null
          session_duration_minutes: number | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          device_type?: string | null
          id?: string
          language_preference?: string | null
          page_visited?: string | null
          session_duration_minutes?: number | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          device_type?: string | null
          id?: string
          language_preference?: string | null
          page_visited?: string | null
          session_duration_minutes?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_assessments: {
        Row: {
          assessment_number: number
          assessment_responses: Json
          completed_at: string | null
          created_at: string | null
          id: string
          is_emergency: boolean | null
          language_preference: string
          literacy_mode: string | null
          location_data: Json | null
          need_types: string[]
          urgency_level: string
          user_id: string
          vulnerability_tags: string[] | null
        }
        Insert: {
          assessment_number: number
          assessment_responses: Json
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_emergency?: boolean | null
          language_preference: string
          literacy_mode?: string | null
          location_data?: Json | null
          need_types: string[]
          urgency_level: string
          user_id: string
          vulnerability_tags?: string[] | null
        }
        Update: {
          assessment_number?: number
          assessment_responses?: Json
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_emergency?: boolean | null
          language_preference?: string
          literacy_mode?: string | null
          location_data?: Json | null
          need_types?: string[]
          urgency_level?: string
          user_id?: string
          vulnerability_tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "user_assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feedback: {
        Row: {
          anonymous: boolean | null
          comment: string | null
          created_at: string | null
          feedback_type: string | null
          id: string
          rating: number
          service_request_id: string | null
          user_id: string | null
        }
        Insert: {
          anonymous?: boolean | null
          comment?: string | null
          created_at?: string | null
          feedback_type?: string | null
          id?: string
          rating: number
          service_request_id?: string | null
          user_id?: string | null
        }
        Update: {
          anonymous?: boolean | null
          comment?: string | null
          created_at?: string | null
          feedback_type?: string | null
          id?: string
          rating?: number
          service_request_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_feedback_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests_tracking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_needs: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          need_type: string
          priority: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          need_type: string
          priority?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          need_type?: string
          priority?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_needs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
