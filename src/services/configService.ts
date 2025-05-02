import { WidgetConfig } from '../types/widgetConfig';

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export const fetchWidgetConfig = async (configUrl: string): Promise<WidgetConfig> => {
  try {
    console.log('Fetching widget config from:', configUrl);
    const response = await fetch(configUrl);
    
    if (!response.ok) {
      throw new ConfigurationError(`Failed to fetch configuration: ${response.statusText}`);
    }

    const config = await response.json() as WidgetConfig;
    console.log('Raw widget config loaded:', JSON.stringify(config));

    // Only use the environment variable if the host is not specified in the config
    if (import.meta.env.VITE_OPENAI_HOST && (!config.security?.api?.host || config.security.api.host === 'http://127.0.0.1:8000')) {
      console.log('Using API host from environment variable:', import.meta.env.VITE_OPENAI_HOST);
      
      // Create the security structure if it doesn't exist
      if (!config.security) {
        config.security = {
          authentication: {
            maxRetries: 3
          },
          api: {
            host: import.meta.env.VITE_OPENAI_HOST,
            version: 'v1',
            timeout: 30000
          }
        };
      } else if (!config.security.api) {
        config.security.api = {
          host: import.meta.env.VITE_OPENAI_HOST,
          version: 'v1',
          timeout: 30000
        };
      } else {
        config.security.api.host = import.meta.env.VITE_OPENAI_HOST;
      }
    }
    
    // Log the final configuration
    console.log('Final widget config with API host:', config.security?.api?.host);
    
    return config;
  } catch (error) {
    if (error instanceof ConfigurationError) {
      throw error;
    }
    throw new ConfigurationError(`Error fetching configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
