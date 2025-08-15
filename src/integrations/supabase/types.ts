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
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      allocated_resources: {
        Row: {
          allocated_at: string | null
          allocated_by: string | null
          created_at: string | null
          id: string
          notes: string | null
          resource_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          allocated_at?: string | null
          allocated_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          resource_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          allocated_at?: string | null
          allocated_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          resource_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "allocated_resources_allocated_by_fkey"
            columns: ["allocated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allocated_resources_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allocated_resources_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          caseworker_id: string | null
          created_at: string | null
          duration_minutes: number | null
          google_calendar_event_id: string | null
          id: string
          notes: string | null
          service_type: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          appointment_date: string
          caseworker_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          google_calendar_event_id?: string | null
          id?: string
          notes?: string | null
          service_type: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          appointment_date?: string
          caseworker_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          google_calendar_event_id?: string | null
          id?: string
          notes?: string | null
          service_type?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_caseworker_id_fkey"
            columns: ["caseworker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          category: string | null
          content: string | null
          created_at: string | null
          created_by: string | null
          excerpt: string | null
          featured_image_url: string | null
          id: string
          meta_description: string | null
          published: boolean | null
          published_at: string | null
          scheduled_publish_at: string | null
          seo_title: string | null
          slug: string
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          published?: boolean | null
          published_at?: string | null
          scheduled_publish_at?: string | null
          seo_title?: string | null
          slug: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          published?: boolean | null
          published_at?: string | null
          scheduled_publish_at?: string | null
          seo_title?: string | null
          slug?: string
          tags?: string[] | null
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
      contact_submissions: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          ip_address: string | null
          message: string
          name: string
          rate_limit_passed: boolean | null
          responded_at: string | null
          status: string
          submission_hash: string | null
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
          message: string
          name: string
          rate_limit_passed?: boolean | null
          responded_at?: string | null
          status?: string
          submission_hash?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          message?: string
          name?: string
          rate_limit_passed?: boolean | null
          responded_at?: string | null
          status?: string
          submission_hash?: string | null
          updated_at?: string
          user_agent?: string | null
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
      employer_profiles: {
        Row: {
          company_name: string | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          phone_number: string | null
          updated_at: string | null
          user_id: string | null
          verification_method: string | null
          verified: boolean | null
        }
        Insert: {
          company_name?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_method?: string | null
          verified?: boolean | null
        }
        Update: {
          company_name?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_method?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      job_applicants: {
        Row: {
          applicant_email: string | null
          applicant_name: string
          applicant_phone: string | null
          applicant_user_id: string | null
          applied_at: string | null
          cover_message: string | null
          id: string
          job_posting_id: string | null
        }
        Insert: {
          applicant_email?: string | null
          applicant_name: string
          applicant_phone?: string | null
          applicant_user_id?: string | null
          applied_at?: string | null
          cover_message?: string | null
          id?: string
          job_posting_id?: string | null
        }
        Update: {
          applicant_email?: string | null
          applicant_name?: string
          applicant_phone?: string | null
          applicant_user_id?: string | null
          applied_at?: string | null
          cover_message?: string | null
          id?: string
          job_posting_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applicants_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_payments: {
        Row: {
          amount: number
          created_at: string | null
          employer_id: string | null
          id: string
          is_renewal: boolean | null
          job_posting_id: string | null
          mpesa_checkout_id: string | null
          payment_method: string
          payment_reference: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          employer_id?: string | null
          id?: string
          is_renewal?: boolean | null
          job_posting_id?: string | null
          mpesa_checkout_id?: string | null
          payment_method: string
          payment_reference?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          employer_id?: string | null
          id?: string
          is_renewal?: boolean | null
          job_posting_id?: string | null
          mpesa_checkout_id?: string | null
          payment_method?: string
          payment_reference?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_payments_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_payments_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          applicant_count: number | null
          created_at: string | null
          description: string
          employer_id: string | null
          expires_at: string | null
          gender_preference: string | null
          id: string
          job_date: string | null
          job_time: string | null
          job_type: string
          location: string
          pay_amount: number
          payment_reference: string | null
          payment_status: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          applicant_count?: number | null
          created_at?: string | null
          description: string
          employer_id?: string | null
          expires_at?: string | null
          gender_preference?: string | null
          id?: string
          job_date?: string | null
          job_time?: string | null
          job_type: string
          location: string
          pay_amount: number
          payment_reference?: string | null
          payment_status?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          applicant_count?: number | null
          created_at?: string | null
          description?: string
          employer_id?: string | null
          expires_at?: string | null
          gender_preference?: string | null
          id?: string
          job_date?: string | null
          job_time?: string | null
          job_type?: string
          location?: string
          pay_amount?: number
          payment_reference?: string | null
          payment_status?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_renewals: {
        Row: {
          expires_at: string
          id: string
          job_posting_id: string | null
          payment_id: string | null
          renewed_at: string | null
        }
        Insert: {
          expires_at: string
          id?: string
          job_posting_id?: string | null
          payment_id?: string | null
          renewed_at?: string | null
        }
        Update: {
          expires_at?: string
          id?: string
          job_posting_id?: string | null
          payment_id?: string | null
          renewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_renewals_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_renewals_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "job_payments"
            referencedColumns: ["id"]
          },
        ]
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
          id_number: string | null
          id_type: string | null
          location: string | null
          phone: string | null
          profile_photo_url: string | null
          progress_notes: Json | null
          support_stage: string | null
          updated_at: string | null
          user_type: string
          visit_count: number | null
        }
        Insert: {
          age?: number | null
          created_at?: string | null
          full_name?: string | null
          id: string
          id_number?: string | null
          id_type?: string | null
          location?: string | null
          phone?: string | null
          profile_photo_url?: string | null
          progress_notes?: Json | null
          support_stage?: string | null
          updated_at?: string | null
          user_type?: string
          visit_count?: number | null
        }
        Update: {
          age?: number | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          id_number?: string | null
          id_type?: string | null
          location?: string | null
          phone?: string | null
          profile_photo_url?: string | null
          progress_notes?: Json | null
          support_stage?: string | null
          updated_at?: string | null
          user_type?: string
          visit_count?: number | null
        }
        Relationships: []
      }
      progress_notes: {
        Row: {
          caseworker_id: string | null
          content: string
          created_at: string | null
          id: string
          note_type: string | null
          updated_at: string | null
          user_id: string | null
          visibility: string | null
        }
        Insert: {
          caseworker_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          note_type?: string | null
          updated_at?: string | null
          user_id?: string | null
          visibility?: string | null
        }
        Update: {
          caseworker_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          note_type?: string | null
          updated_at?: string | null
          user_id?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_notes_caseworker_id_fkey"
            columns: ["caseworker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          action_type: string
          attempt_count: number | null
          blocked_until: string | null
          created_at: string | null
          id: string
          identifier: string
          updated_at: string | null
          window_start: string | null
        }
        Insert: {
          action_type: string
          attempt_count?: number | null
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          identifier: string
          updated_at?: string | null
          window_start?: string | null
        }
        Update: {
          action_type?: string
          attempt_count?: number | null
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          identifier?: string
          updated_at?: string | null
          window_start?: string | null
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
      security_logs: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      service_bookings: {
        Row: {
          booking_date: string
          created_at: string
          google_calendar_event_id: string | null
          id: string
          meeting_link: string | null
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
          meeting_link?: string | null
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
          meeting_link?: string | null
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
      site_content: {
        Row: {
          content_key: string
          content_type: string
          content_value: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          published: boolean
          section: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content_key: string
          content_type?: string
          content_value?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          published?: boolean
          section: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content_key?: string
          content_type?: string
          content_value?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          published?: boolean
          section?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      support_requests: {
        Row: {
          created_at: string | null
          id: string
          language: string | null
          message: string | null
          phone_number: string | null
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
          phone_number?: string | null
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
          phone_number?: string | null
          priority?: string | null
          service_type?: string | null
          status?: string | null
          updated_at?: string | null
          user_email?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string | null
          department: string | null
          id: string
          permissions: Json | null
          role: string
          updated_at: string | null
          user_id: string | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          id?: string
          permissions?: Json | null
          role: string
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          id?: string
          permissions?: Json | null
          role?: string
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      user_concerns: {
        Row: {
          assigned_caseworker: string | null
          concern_type: string
          created_at: string | null
          date_logged: string | null
          description: string | null
          id: string
          resolved: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_caseworker?: string | null
          concern_type: string
          created_at?: string | null
          date_logged?: string | null
          description?: string | null
          id?: string
          resolved?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_caseworker?: string | null
          concern_type?: string
          created_at?: string | null
          date_logged?: string | null
          description?: string | null
          id?: string
          resolved?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_concerns_assigned_caseworker_fkey"
            columns: ["assigned_caseworker"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_concerns_user_id_fkey"
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
      expire_old_jobs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      setup_admin_user: {
        Args:
          | Record<PropertyKey, never>
          | { user_email: string; user_name: string }
        Returns: undefined
      }
      validate_contact_submission: {
        Args: { p_email: string; p_message: string; p_name: string }
        Returns: boolean
      }
      verify_admin_setup: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          email_confirmed: boolean
          is_admin: boolean
          profile_exists: boolean
          user_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
