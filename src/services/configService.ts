import { WidgetConfig } from '../types/widgetConfig';
import { Logger } from '../utils/logger';

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

// Simple in-memory cache to prevent multiple simultaneous or redundant fetches
let configCache: { [url: string]: WidgetConfig } = {};
let fetchPromises: { [url: string]: Promise<WidgetConfig> } = {};

export const fetchWidgetConfig = async (configUrl: string): Promise<WidgetConfig> => {
  // Return from cache if available
  if (configCache[configUrl]) {
    return configCache[configUrl];
  }

  // If a fetch is already in progress for this URL, return that promise
  const existingPromise = fetchPromises[configUrl];
  if (existingPromise) {
    return existingPromise;
  }

  fetchPromises[configUrl] = (async () => {
    try {
      Logger.log(`fetchWidgetConfig: fetching widget configuration from ${configUrl}`);
      // Add a timestamp to bypass browser cache during development if needed, 
      // but standard fetch should be fine. We'll use cache: 'no-cache' to be safe.
      const response = await fetch(configUrl, { cache: 'no-cache' });
      
      if (!response.ok) {
        throw new ConfigurationError(`Failed to fetch configuration: ${response.statusText}`);
      }

      const config = await response.json() as WidgetConfig;
      
      // Store in cache
      configCache[configUrl] = config;
      return config;
    } catch (error) {
      if (error instanceof ConfigurationError) {
        throw error;
      }
      throw new ConfigurationError(`Error fetching configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Clear the promise from the tracking object so it can be retried if it failed
      delete fetchPromises[configUrl];
    }
  })();

  return fetchPromises[configUrl];
};

/**
 * Clear the configuration cache. Useful if the config needs to be re-fetched.
 */
export const clearConfigCache = (configUrl?: string): void => {
  if (configUrl) {
    delete configCache[configUrl];
  } else {
    configCache = {};
  }
};
