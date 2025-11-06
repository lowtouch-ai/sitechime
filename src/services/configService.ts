import { WidgetConfig } from '../types/widgetConfig';

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export const fetchWidgetConfig = async (configUrl: string): Promise<WidgetConfig> => {
  try {
    console.log(`fetchWidgetConfig: fetching widget configuration from ${configUrl}`);
    const response = await fetch(configUrl);
    
    if (!response.ok) {
      throw new ConfigurationError(`Failed to fetch configuration: ${response.statusText}`);
    }

    const config = await response.json() as WidgetConfig;


    // Replace the hardcoded API host with the environment variable if available
    const envHost = import.meta.env.VITE_BACKEND_API_URL || import.meta.env.VITE_OPENAI_HOST;
    if (envHost) {
      config.security.api.host = envHost as string;
    }
    
    return config;
  } catch (error) {
    if (error instanceof ConfigurationError) {
      throw error;
    }
    throw new ConfigurationError(`Error fetching configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
