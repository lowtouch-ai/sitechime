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

    const config = await response.json();
    return config as WidgetConfig;
  } catch (error) {
    if (error instanceof ConfigurationError) {
      throw error;
    }
    throw new ConfigurationError(`Error fetching configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
