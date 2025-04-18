import { useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { createProfileIfNotExists } from '@/services/profile/profileService';

export const ProfileInitializer = () => {
  const { session } = useAuth();

  useEffect(() => {
    const initializeProfile = async () => {
      if (session?.user) {
        try {
          await createProfileIfNotExists(session.user.id);
        } catch (error) {
          console.error('Failed to initialize profile:', error);
        }
      }
    };

    initializeProfile();
  }, [session]);

  return null; // This component doesn't render anything
}; 