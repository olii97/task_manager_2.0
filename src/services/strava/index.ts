
// Re-export all Strava services
export * from './connectionService';
export * from './activityService';
export * from './storageService';
export * from './types';

// Export explicit functions to match imports in components
import { saveStravaActivity } from './storageService';
export { saveStravaActivity };

// Placeholder function to maintain compatibility
export const updateStravaEdgeFunction = async () => {
  return { success: true, error: null };
};
