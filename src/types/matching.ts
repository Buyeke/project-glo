
export interface UserAssessment {
  id: string;
  user_id: string;
  assessment_number: number;
  need_types: string[];
  urgency_level: 'high' | 'medium' | 'low';
  language_preference: string;
  location_data?: {
    address?: string;
    coordinates?: { lat: number; lng: number };
    region?: string;
  };
  vulnerability_tags?: string[];
  literacy_mode?: 'text' | 'voice_first' | 'icon_based';
  assessment_responses: Record<string, any>;
  is_emergency: boolean;
  completed_at: string;
  created_at: string;
}

export interface ServiceProvider {
  id: string;
  provider_name: string;
  service_types: string[];
  location_data: {
    address: string;
    coordinates: { lat: number; lng: number };
    region: string;
  };
  languages_supported: string[];
  vulnerability_specializations?: string[];
  capacity_info?: Record<string, any>;
  contact_info: {
    phone: string;
    email: string;
    address: string;
  };
  operating_hours?: Record<string, any>;
  verification_status: 'verified' | 'pending' | 'rejected';
  emergency_services: boolean;
  is_active: boolean;
}

export interface MatchLog {
  id: string;
  user_id: string;
  provider_id: string;
  assessment_id: string;
  match_score: number;
  match_criteria: Record<string, any>;
  match_type: 'emergency' | 'standard' | 'follow_up';
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  provider_response?: string;
  user_feedback?: Record<string, any>;
  matched_at: string;
  responded_at?: string;
  completed_at?: string;
}

export interface AssessmentQuestions {
  id: string;
  question: string;
  type: 'multiple_choice' | 'single_choice' | 'text' | 'boolean' | 'scale';
  options?: string[];
  required: boolean;
  emergency_keywords?: string[];
}
