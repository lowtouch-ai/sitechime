import { WidgetConfig } from '../types/widgetConfig';

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export const fetchWidgetConfig = async (configUrl: string): Promise<WidgetConfig> => {
  try {
    const response = await fetch(configUrl);
    
    if (!response.ok) {
      throw new ConfigurationError(`Failed to fetch configuration: ${response.statusText}`);
    }

    const config = await response.json() as WidgetConfig;


    // Replace the hardcoded API host with the environment variable if available
    if (import.meta.env.VITE_OPENAI_HOST && config.security?.api?.host) {
      config.security.api.host = import.meta.env.VITE_OPENAI_HOST;
    }
    
    return config;
  } catch (error) {
    if (error instanceof ConfigurationError) {
      throw error;
    }
    throw new ConfigurationError(`Error fetching configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
