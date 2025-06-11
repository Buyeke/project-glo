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
