
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { SavedStravaActivity } from '@/types/strava';
import { useQuery } from '@tanstack/react-query';
// Update the import path
import { getStravaActivities, checkStravaConnection } from '@/services/strava';

export default function useStravaActivities() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [isConnected, setIsConnected] = useState(false);

  const { data: activities, isLoading, refetch } = useQuery({
    queryKey: ['stravaActivities', userId],
    queryFn: () => getStravaActivities(userId || ''),
    enabled: !!userId,
  });

  const { data: connectionStatus, isLoading: isConnectionLoading } = useQuery({
    queryKey: ['stravaConnection', userId],
    queryFn: () => checkStravaConnection(userId || ''),
    enabled: !!userId,
  });

  useEffect(() => {
    if (connectionStatus) {
      setIsConnected(connectionStatus.isConnected);
    }
  }, [connectionStatus]);

  return {
    activities: activities || [],
    isLoading,
    refetch,
    isConnected,
    isConnectionLoading,
  };
}
