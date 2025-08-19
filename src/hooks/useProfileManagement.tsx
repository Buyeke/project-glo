
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

interface Concern {
  id: string;
  category: string;
  name: string;
  severity: 'high' | 'medium' | 'low';
}

interface Profile {
  name: string;
  location: string;
  concerns: Concern[];
}

export const useProfileManagement = (profileId?: string) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predefinedConcerns = [
    { id: '1', category: 'Housing', name: 'Emergency Shelter', severity: 'high' as const },
    { id: '2', category: 'Housing', name: 'Temporary Accommodation', severity: 'medium' as const },
    { id: '3', category: 'Healthcare', name: 'Mental Health Support', severity: 'high' as const },
    { id: '4', category: 'Healthcare', name: 'Medical Care', severity: 'medium' as const },
    { id: '5', category: 'Safety', name: 'Domestic Violence Support', severity: 'high' as const },
    { id: '6', category: 'Employment', name: 'Job Training', severity: 'low' as const },
    { id: '7', category: 'Legal', name: 'Legal Aid', severity: 'medium' as const },
    { id: '8', category: 'Childcare', name: 'Emergency Childcare', severity: 'high' as const },
    { id: '9', category: 'Food', name: 'Food Security', severity: 'medium' as const },
    { id: '10', category: 'Transportation', name: 'Transport Assistance', severity: 'low' as const }
  ];

  const createProfile = async (name: string, location: string, selectedConcerns: string[]) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call or database interaction
      await new Promise(resolve => setTimeout(resolve, 1000));

      const concerns = predefinedConcerns.filter(concern => selectedConcerns.includes(concern.id));

      const newProfile: Profile = {
        name,
        location,
        concerns,
      };

      setProfile(newProfile);
    } catch (err) {
      setError('Failed to create profile. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call or database interaction
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile as Profile);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateVisitCount = useMutation({
    mutationFn: async () => {
      // Simulate API call to update visit count
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Visit count updated for profile:', profileId);
    },
    onError: (error) => {
      console.error('Failed to update visit count:', error);
    }
  });

  const clearProfile = () => {
    setProfile(null);
  };

  return {
    profile,
    isLoading,
    error,
    predefinedConcerns,
    createProfile,
    updateProfile,
    updateVisitCount,
    clearProfile
  };
};
