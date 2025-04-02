import React from 'react';
import { ChatTheme } from '../types';
import { useChatContext } from '../ChatContext';

interface MessageContentProps {
  content: string;
  role: 'user' | 'assistant';
  theme: ChatTheme;
  onImageClick: (url: string) => void;
}

export const MessageContent: React.FC<MessageContentProps> = ({
  content,
  role,
  onImageClick
}) => {
  const { config } = useChatContext();
  
  // Function to transform image URLs from relative to absolute
  const transformImageUrls = (html: string): string => {
    if (!config || !config.security.api.host) return html;
    
    const apiHost = config.security.api.host;
    
    // Replace image tags with transformed URLs
    return html.replace(
      /(!\[.*?\]\()(\/?static\/.*?)(\))/g, 
      (match, prefix, url, suffix) => {
        // Remove leading slash if present
        const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
        return `${prefix}${apiHost}/api/openai/${cleanUrl}${suffix}`;
      }
    );
  };

  // Function to render markdown-style images as HTML with click functionality
  const renderContentWithImages = (content: string): React.ReactNode => {
    if (!content) return null;
    
    // Transform image URLs first
    const transformedContent = transformImageUrls(content);
    
    // Match markdown image syntax: ![alt text](/path/to/image.png)
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const regex = /!\[(.*?)\]\((.*?)\)/g;
    
    let match;
    while ((match = regex.exec(transformedContent)) !== null) {
      // Add the text before the image
      if (match.index > lastIndex) {
        parts.push(transformedContent.slice(lastIndex, match.index));
      }
      
      const [fullMatch, altText, imageUrl] = match;
      
      // Add the image with click handler
      parts.push(
        <img
          key={`img-${match.index}`}
          src={imageUrl}
          alt={altText || 'Image'}
          className="max-w-full rounded-md my-2 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => onImageClick(imageUrl)}
          style={{ maxHeight: '300px' }}
        />
      );
      
      lastIndex = match.index + fullMatch.length;
    }
    
    // Add the remaining text after the last image
    if (lastIndex < transformedContent.length) {
      parts.push(transformedContent.slice(lastIndex));
    }
    
    return parts;
  };

  return (
    <div 
      className={`whitespace-pre-wrap text-sm ${role === 'user' ? 'text-right' : 'text-left'}`}
      data-testid="message-content"
    >
      {role === 'user' ? content : renderContentWithImages(content)}
    </div>
  );
};