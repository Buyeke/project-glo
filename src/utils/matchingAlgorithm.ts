
import { UserAssessment, ServiceProvider, MatchLog } from '@/types/matching';

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const calculateMatchScore = (
  assessment: UserAssessment,
  provider: ServiceProvider
): { score: number; criteria: Record<string, any> } => {
  let totalScore = 0;
  const criteria: Record<string, any> = {};

  // 1. Service Type Match (40% weight)
  const serviceMatches = assessment.need_types.filter(need => 
    provider.service_types.includes(need)
  );
  const serviceScore = (serviceMatches.length / assessment.need_types.length) * 40;
  totalScore += serviceScore;
  criteria.service_match = {
    score: serviceScore,
    matches: serviceMatches,
    total_needs: assessment.need_types.length
  };

  // 2. Language Support (20% weight)
  const languageMatch = provider.languages_supported.includes(assessment.language_preference);
  const languageScore = languageMatch ? 20 : 0;
  totalScore += languageScore;
  criteria.language_match = {
    score: languageScore,
    supported: languageMatch,
    user_preference: assessment.language_preference
  };

  // 3. Location Proximity (20% weight)
  let locationScore = 0;
  if (assessment.location_data?.coordinates && provider.location_data.coordinates) {
    const distance = calculateDistance(
      assessment.location_data.coordinates.lat,
      assessment.location_data.coordinates.lng,
      provider.location_data.coordinates.lat,
      provider.location_data.coordinates.lng
    );
    
    // Score based on distance (closer = higher score)
    if (distance <= 5) locationScore = 20;
    else if (distance <= 15) locationScore = 15;
    else if (distance <= 30) locationScore = 10;
    else if (distance <= 50) locationScore = 5;
    else locationScore = 0;
    
    criteria.location_match = {
      score: locationScore,
      distance_km: Math.round(distance * 10) / 10
    };
  }
  totalScore += locationScore;

  // 4. Vulnerability Specialization (15% weight)
  let vulnerabilityScore = 0;
  if (assessment.vulnerability_tags && provider.vulnerability_specializations) {
    const vulnerabilityMatches = assessment.vulnerability_tags.filter(tag =>
      provider.vulnerability_specializations?.includes(tag)
    );
    vulnerabilityScore = assessment.vulnerability_tags.length > 0 
      ? (vulnerabilityMatches.length / assessment.vulnerability_tags.length) * 15
      : 0;
      
    criteria.vulnerability_match = {
      score: vulnerabilityScore,
      matches: vulnerabilityMatches,
      total_vulnerabilities: assessment.vulnerability_tags.length
    };
  }
  totalScore += vulnerabilityScore;

  // 5. Emergency Capability (5% weight)
  let emergencyScore = 0;
  if (assessment.is_emergency) {
    emergencyScore = provider.emergency_services ? 5 : -10; // Penalty if emergency needed but not available
  }
  totalScore += emergencyScore;
  criteria.emergency_match = {
    score: emergencyScore,
    user_emergency: assessment.is_emergency,
    provider_emergency: provider.emergency_services
  };

  // Ensure score is between 0-100
  const finalScore = Math.max(0, Math.min(100, totalScore));

  return { score: finalScore, criteria };
};

export const findBestMatches = (
  assessment: UserAssessment,
  providers: ServiceProvider[],
  maxMatches: number = 3
): Array<{ provider: ServiceProvider; score: number; criteria: Record<string, any> }> => {
  // Filter for verified and active providers
  const eligibleProviders = providers.filter(provider => 
    provider.verification_status === 'verified' && 
    provider.is_active
  );

  // If emergency, only consider providers that handle emergencies
  const filteredProviders = assessment.is_emergency 
    ? eligibleProviders.filter(provider => provider.emergency_services)
    : eligibleProviders;

  // Calculate match scores
  const scoredMatches = filteredProviders.map(provider => {
    const { score, criteria } = calculateMatchScore(assessment, provider);
    return { provider, score, criteria };
  });

  // Sort by score (highest first) and return top matches
  return scoredMatches
    .sort((a, b) => b.score - a.score)
    .slice(0, maxMatches)
    .filter(match => match.score >= 30); // Minimum threshold
};
