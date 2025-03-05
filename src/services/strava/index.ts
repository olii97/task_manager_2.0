
// Re-export all Strava services
export * from './connectionService';
export * from './activityService';
export * from './storageService';
export * from './types';

// Placeholder function to maintain compatibility
export const updateStravaEdgeFunction = async () => {
  return { success: true, error: null };
};
