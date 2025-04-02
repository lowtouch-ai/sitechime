import React from 'react';
import { ChatTheme } from '../types';
import { useChatContext } from '../ChatContext';

interface MessageContentProps {
  content: string;
  role: 'user' | 'assistant';
  theme: ChatTheme;
  onImageClick: (url: string, title?: string) => void;
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
    
    // Transform both markdown image syntax and plain image URLs
    return html.replace(
      /(!\[.*?\]\()?(\/?static\/.*?\.(png|jpg|jpeg|gif|svg|webp))(\))?/gi, 
      (match, mdPrefix, url, ext, mdSuffix) => {

        match
        ext
        // Clean the URL (remove leading slash if present)
        const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
        const fullUrl = `${apiHost}/api/openai/${cleanUrl}`;
        
        // If this was markdown syntax, maintain it
        if (mdPrefix && mdSuffix) {
          return `${mdPrefix}${fullUrl}${mdSuffix}`;
        }
        
        // Otherwise just return the transformed URL
        return fullUrl;
      }
    );
  };

  // Function to render content with images as clickable elements
  const renderContentWithImages = (content: string): React.ReactNode => {
    if (!content) return null;
    
    // Preprocess the content to handle markdown image syntax
    const parts: React.ReactNode[] = [];
    let processedContent = content;

    processedContent
    
    // Process markdown image tags: ![title](url)
    const mdImageRegex = /!\[(.*?)\]\((\/static\/.*?\.(png|jpg|jpeg|gif|svg|webp))\)/gi;
    let lastIndex = 0;
    let match;
    
    while ((match = mdImageRegex.exec(content)) !== null) {
      // Add text before the image
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      
      const [fullMatch, title, url] = match;
      const imageUrl = transformImageUrls(url);
      const imageTitle = title.trim() || "Image";
      
      // Add a figure with the image and caption
      parts.push(
        <figure key={`img-${match.index}`} className="my-4 text-center">
          <img
            src={imageUrl}
            alt={imageTitle}
            className="max-w-full rounded-md cursor-pointer hover:opacity-90 transition-opacity mx-auto"
            onClick={() => onImageClick(imageUrl, imageTitle)}
            style={{ maxHeight: '300px' }}
            title="Click to view full size"
          />
          <figcaption className="mt-2 text-sm text-gray-600">
            {imageTitle}
          </figcaption>
        </figure>
      );
      
      lastIndex = match.index + fullMatch.length;
    }
    
    // Add the remaining text after the last image
    if (lastIndex < content.length) {
      // Process any direct static URLs in the remaining content
      const remainingContent = content.slice(lastIndex);
      const plainUrlRegex = /(\/?static\/.*?\.(png|jpg|jpeg|gif|svg|webp))/gi;
      
      let plainUrlMatch;
      let plainUrlLastIndex = 0;
      let plainUrlParts: React.ReactNode[] = [];
      
      while ((plainUrlMatch = plainUrlRegex.exec(remainingContent)) !== null) {
        // Add text before the URL
        if (plainUrlMatch.index > plainUrlLastIndex) {
          plainUrlParts.push(remainingContent.slice(plainUrlLastIndex, plainUrlMatch.index));
        }
        
        const imageUrl = transformImageUrls(plainUrlMatch[0]);
        
        // Add the image
        plainUrlParts.push(
          <div key={`plain-img-${plainUrlMatch.index}`} className="my-2 inline-block">
            <img
              src={imageUrl}
              alt="Image"
              className="max-w-full rounded-md cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => onImageClick(imageUrl)}
              style={{ maxHeight: '300px' }}
              title="Click to view full size"
            />
          </div>
        );
        
        plainUrlLastIndex = plainUrlMatch.index + plainUrlMatch[0].length;
      }
      
      // Add remaining text
      if (plainUrlLastIndex < remainingContent.length) {
        plainUrlParts.push(remainingContent.slice(plainUrlLastIndex));
      }
      
      parts.push(...plainUrlParts);
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