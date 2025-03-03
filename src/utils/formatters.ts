
export const formatDistance = (meters: number) => {
  const kilometers = (meters / 1000).toFixed(2);
  return `${kilometers} km`;
};

export const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

export const formatQuarter = (quarter: number, year: number) => {
  const quarterNames = ["First", "Second", "Third", "Fourth"];
  return `${quarterNames[quarter - 1]} Quarter ${year}`;
};

// Add the formatPace function
export const formatPace = (speedMetersPerSecond: number) => {
  if (!speedMetersPerSecond) return "N/A";
  
  // Convert speed (m/s) to pace (min/km)
  const paceInSecondsPerKm = 1000 / speedMetersPerSecond;
  const minutes = Math.floor(paceInSecondsPerKm / 60);
  const seconds = Math.floor(paceInSecondsPerKm % 60);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
};
