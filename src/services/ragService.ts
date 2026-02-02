// filepath: j:\CloudControl\openai-chat-widget\src\services\ragService.ts
import { RAGUploadResponse } from '../types/chat';
import { Logger } from '../utils/logger';

/**
 * Service for handling Retrieval Augmented Generation (RAG) operations
 * such as file uploads and knowledge collection management.
 */

// Import the fetchWidgetConfig function to get the API host from config
import { fetchWidgetConfig } from './configService';
import { joinUrl } from '../utils/url';

// Hard-coded RAG API endpoint path
const RAG_API_PATH = '/api/openai/api/v1';

// Global configUrl that can be set by the application
let _configUrl: string = '/widget-config.json'; // Default fallback value

/**
 * Set the configuration URL to be used by the RAG service
 * @param configUrl - The URL to fetch widget configuration from
 */
export const setConfigUrl = (configUrl: string): void => {
  _configUrl = configUrl;
};

// Helper function to get the base API URL from the config
const getBaseApiUrl = async (): Promise<string> => {
  try {
    const config = await fetchWidgetConfig(_configUrl);
    return joinUrl(config.security.api.host, RAG_API_PATH);
  } catch (error) {
    Logger.error('Error loading API configuration:', error);
    throw error;
  }
};

/**
 * Upload a file to the RAG system
 * @param file - The file to upload
 * @param apiKey - The API key for authentication
 * @returns Promise with the upload response
 */
export const uploadFile = async (file: File, apiKey: string): Promise<RAGUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const baseApiUrl = await getBaseApiUrl();
    const response = await fetch(joinUrl(baseApiUrl, '/files/'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to upload file: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    Logger.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Add a file to a knowledge collection
 * @param knowledgeId - The ID of the knowledge collection
 * @param fileId - The ID of the file to add
 * @param apiKey - The API key for authentication
 * @returns Promise with the response data
 */
export const addFileToKnowledge = async (
  knowledgeId: string,
  fileId: string,
  apiKey: string
): Promise<any> => {
  try {
    const baseApiUrl = await getBaseApiUrl();
    const response = await fetch(joinUrl(baseApiUrl, `/knowledge/${knowledgeId}/file/add`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ file_id: fileId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add file to knowledge: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    Logger.error('Error adding file to knowledge:', error);
    throw error;
  }
};

/**
 * List available knowledge collections
 * @param apiKey - The API key for authentication
 * @returns Promise with the list of knowledge collections
 */
export const listKnowledgeCollections = async (apiKey: string): Promise<any> => {
  try {
    const baseApiUrl = await getBaseApiUrl();
    const response = await fetch(`${baseApiUrl}/knowledge/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to list knowledge collections: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    Logger.error('Error listing knowledge collections:', error);
    throw error;
  }
};