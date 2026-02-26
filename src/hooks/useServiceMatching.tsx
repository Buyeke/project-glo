
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ServiceProvider } from '@/types/matching';
import { Service } from '@/types/chatbot';

export interface MatchedService {
  service: Service;
  relevance: number;
}

export interface MatchedProvider {
  provider: ServiceProvider;
  matchScore: number;
  matchedServiceTypes: string[];
}

export interface MatchingResult {
  services: MatchedService[];
  providers: MatchedProvider[];
  isEmergency: boolean;
}

// Maps quiz/chatbot need categories to service_providers.service_types values
const NEED_TO_SERVICE_TYPE_MAP: Record<string, string[]> = {
  shelter: ['shelter', 'emergency_housing'],
  housing: ['shelter', 'emergency_housing'],
  emotional: ['mental_health', 'counseling'],
  mental_health: ['mental_health', 'counseling'],
  counseling: ['mental_health', 'counseling'],
  employment: ['job_training', 'employment'],
  legal: ['legal_aid', 'rights_advocacy'],
  healthcare: ['healthcare'],
  childcare: ['childcare'],
  food: ['food_assistance', 'basic_needs'],
  education: ['education', 'training'],
  unsure: [], // will return all
};

// Maps quiz/chatbot need categories to services.category values
const NEED_TO_SERVICE_CATEGORY_MAP: Record<string, string[]> = {
  shelter: ['Emergency', 'Basic Needs'],
  housing: ['Emergency', 'Basic Needs'],
  emotional: ['Healthcare'],
  mental_health: ['Healthcare'],
  counseling: ['Healthcare'],
  employment: ['Employment'],
  legal: ['Legal'],
  healthcare: ['Healthcare'],
  food: ['Basic Needs'],
  education: ['Employment'],
  unsure: [],
};

export const useServiceMatching = () => {
  // Fetch all active service providers
  const { data: providers = [] } = useQuery({
    queryKey: ['service-providers-matching'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('verification_status', 'verified')
        .eq('is_active', true);

      if (error) throw error;
      return data.map(p => ({
        ...p,
        location_data: p.location_data as ServiceProvider['location_data'],
        contact_info: p.contact_info as ServiceProvider['contact_info'],
        capacity_info: p.capacity_info as ServiceProvider['capacity_info'],
        operating_hours: p.operating_hours as ServiceProvider['operating_hours'],
      })) as ServiceProvider[];
    },
    staleTime: 10 * 60 * 1000,
  });

  // Fetch all available services
  const { data: services = [] } = useQuery({
    queryKey: ['services-matching'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('id, title, description, category, priority_level, language_support, contact_phone, contact_url, availability, key_features');

      if (error) throw error;
      return data as Service[];
    },
    staleTime: 10 * 60 * 1000,
  });

  const matchByNeeds = (
    needTypes: string[],
    urgency: 'immediate' | 'soon' | 'planning' | 'high' | 'medium' | 'low' = 'medium'
  ): MatchingResult => {
    const isEmergency = urgency === 'immediate' || urgency === 'high';
    const normalizedNeeds = needTypes.map(n => n.toLowerCase());

    // 1. Match services by category
    const targetCategories = new Set<string>();
    normalizedNeeds.forEach(need => {
      const categories = NEED_TO_SERVICE_CATEGORY_MAP[need] || [];
      categories.forEach(c => targetCategories.add(c));
    });

    const matchedServices: MatchedService[] = services
      .filter(s => s.availability === 'Available')
      .map(s => {
        let relevance = 0;
        if (targetCategories.size === 0) {
          // "unsure" — return all with base relevance
          relevance = 0.5;
        } else if (targetCategories.has(s.category)) {
          relevance = 1;
        }
        // Boost emergency services
        if (isEmergency && s.priority_level === 'Urgent') {
          relevance += 0.3;
        }
        return { service: s, relevance };
      })
      .filter(m => m.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance);

    // 2. Match providers by service_types
    const targetServiceTypes = new Set<string>();
    normalizedNeeds.forEach(need => {
      const types = NEED_TO_SERVICE_TYPE_MAP[need] || [];
      types.forEach(t => targetServiceTypes.add(t));
    });

    const matchedProviders: MatchedProvider[] = providers
      .map(provider => {
        const matchedTypes = provider.service_types.filter(t => 
          targetServiceTypes.has(t)
        );
        
        let matchScore = 0;
        if (targetServiceTypes.size === 0) {
          // "unsure" — return all
          matchScore = 50;
          return { provider, matchScore, matchedServiceTypes: provider.service_types };
        }
        
        if (matchedTypes.length === 0) return null;

        // Base score from type match
        matchScore = (matchedTypes.length / targetServiceTypes.size) * 60;

        // Emergency bonus
        if (isEmergency && provider.emergency_services) {
          matchScore += 25;
        }
        // Emergency penalty if needed but not available
        if (isEmergency && !provider.emergency_services) {
          matchScore -= 15;
        }

        // Language bonus (supports multiple)
        if (provider.languages_supported.length > 2) {
          matchScore += 10;
        }

        return { provider, matchScore: Math.min(100, Math.max(0, matchScore)), matchedServiceTypes: matchedTypes };
      })
      .filter((m): m is MatchedProvider => m !== null)
      .sort((a, b) => b.matchScore - a.matchScore);

    return { services: matchedServices, providers: matchedProviders, isEmergency };
  };

  // Convenience: match from a chatbot intent/service category
  const matchFromIntent = (intentCategory: string, urgency?: string): MatchingResult => {
    const needMap: Record<string, string[]> = {
      shelter: ['shelter'],
      emergency: ['shelter'],
      legal: ['legal'],
      employment: ['employment'],
      healthcare: ['healthcare'],
      mental_health: ['emotional'],
      counseling: ['emotional'],
      support: ['unsure'],
      general: ['unsure'],
    };
    const needs = needMap[intentCategory?.toLowerCase()] || ['unsure'];
    const mappedUrgency = urgency === 'critical' || urgency === 'high' ? 'immediate' : 'medium';
    return matchByNeeds(needs, mappedUrgency as any);
  };

  return { matchByNeeds, matchFromIntent, providers, services };
};
