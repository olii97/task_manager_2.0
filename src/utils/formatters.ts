
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
