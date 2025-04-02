// filepath: j:\CloudControl\openai-chat-widget\src\services\ragService.ts
import { RAGFile, RAGUploadResponse } from '../types/chat';

/**
 * Service for handling Retrieval Augmented Generation (RAG) operations
 * such as file uploads and knowledge collection management.
 */

// Base API URL - should be configurable in a production environment
const BASE_API_URL = 'http://127.0.0.1:8000/api/openai/api/v1';

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
    const response = await fetch(`${BASE_API_URL}/files/`, {
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
    console.error('Error uploading file:', error);
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
    const response = await fetch(`${BASE_API_URL}/knowledge/${knowledgeId}/file/add`, {
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
    console.error('Error adding file to knowledge:', error);
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
    const response = await fetch(`${BASE_API_URL}/knowledge/`, {
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
    console.error('Error listing knowledge collections:', error);
    throw error;
  }
};