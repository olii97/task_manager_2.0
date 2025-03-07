
// Export types
export * from './types';

// Export connection functions
export * from './connectionService';

// Export from activityService
export { 
  fetchStravaActivities,
  getStravaActivities,
  getStravaActivityDetails
} from './activityService';

// Export from storageService
export {
  saveStravaActivity,
  getStravaActivityById,
  getStoredActivityIds,
  getStoredStravaActivities
} from './storageService';

// Placeholder function to maintain compatibility
export const updateStravaEdgeFunction = async () => {
  return { success: true, error: null };
};
