
// Export types
export * from './types';

// Export connection functions
export * from './connectionService';

// Export renamed from storageService
export {
  saveStravaActivity,
  getStravaActivityById,
  getStoredActivityIds,
  getStoredStravaActivities
} from './storageService';

// Export from activityService
export { 
  fetchStravaActivities,
  getStravaActivities,
  getStravaActivityDetails
} from './activityService';

// Placeholder function to maintain compatibility
export const updateStravaEdgeFunction = async () => {
  return { success: true, error: null };
};
