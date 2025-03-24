import { useState, useEffect } from 'react';

interface DashboardSettings {
  hiddenTiles: Record<string, boolean>;
}

const STORAGE_KEY = 'dashboard_settings';

const defaultSettings: DashboardSettings = {
  hiddenTiles: {}
};

export const useDashboardSettings = () => {
  const [settings, setSettings] = useState<DashboardSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to parse dashboard settings', error);
        // If parsing fails, reset to defaults
        setSettings(defaultSettings);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Toggle visibility of a tile
  const toggleTileVisibility = (tileId: string) => {
    setSettings(prev => ({
      ...prev,
      hiddenTiles: {
        ...prev.hiddenTiles,
        [tileId]: !prev.hiddenTiles[tileId]
      }
    }));
  };

  // Check if a tile is hidden
  const isTileHidden = (tileId: string): boolean => {
    return !!settings.hiddenTiles[tileId];
  };

  // Reset all settings to default
  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return {
    isTileHidden,
    toggleTileVisibility,
    resetSettings,
  };
}; 