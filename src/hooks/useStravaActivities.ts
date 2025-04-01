import { useState, useEffect } from 'react';
import { StravaActivity } from '@/types/strava';
import { getStravaActivities } from '@/services/strava/activityService';

interface UseStravaActivitiesResult {
  stravaActivities: StravaActivity[];
  isLoading: boolean;
  error: string | null;
  fetchNextPage: () => Promise<void>;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
}

export const useStravaActivities = (userId?: string): UseStravaActivitiesResult => {
  const [stravaActivities, setStravaActivities] = useState<StravaActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 10;

  useEffect(() => {
    const fetchActivities = async () => {
      if (!userId) return;

      setIsLoading(true);
      try {
        const activities = await getStravaActivities(userId, 1, PER_PAGE);
        setStravaActivities(activities);
        setHasNextPage(activities.length === PER_PAGE);
        setCurrentPage(1);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch activities');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [userId]);

  const fetchNextPage = async () => {
    if (!userId || isFetchingNextPage) return;

    const nextPage = currentPage + 1;
    setIsFetchingNextPage(true);
    
    try {
      const nextActivities = await getStravaActivities(userId, nextPage, PER_PAGE);
      setStravaActivities(prev => [...prev, ...nextActivities]);
      setHasNextPage(nextActivities.length === PER_PAGE);
      setCurrentPage(nextPage);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch more activities');
    } finally {
      setIsFetchingNextPage(false);
    }
  };

  return {
    stravaActivities,
    isLoading,
    error,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage
  };
};
