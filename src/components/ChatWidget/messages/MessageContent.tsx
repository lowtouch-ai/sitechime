import React from 'react';
import { ChatTheme } from '../types';
import { useChatContext } from '../ChatContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

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
      (_match, mdPrefix, url, _ext, mdSuffix) => {
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

  // Process any direct image URLs in content
  const processDirectImageUrls = (content: string): string => {
    // Replace direct image URLs that aren't already part of markdown syntax
    return content.replace(
      /(?<!!\[\w\s]*\]\()(\/?static\/[^\s)]+\.(png|jpg|jpeg|gif|svg|webp))/gi,
      (match) => {
        const transformedUrl = transformImageUrls(match);
        return `![Image](${transformedUrl})`;
      }
    );
  };

  // Handle rendering different content for user vs assistant
  if (role === 'user') {
    return (
      <div 
        className="whitespace-pre-wrap text-sm text-right"
        data-testid="message-content"
      >
        {content}
      </div>
    );
  }

  // Process content for assistant messages
  const processedContent = transformImageUrls(processDirectImageUrls(content));

  // Custom components for markdown rendering
  const components: Components = {
    img: ({ src, alt, ...props }) => {
      if (!src) return null;
      
      const imageUrl = src.startsWith('/static/') || src.startsWith('static/') 
        ? transformImageUrls(src)
        : src;
      
      const imageTitle = alt || "Image";
      
      return (
        <figure className="my-4 text-center">
          <img
            {...props}
            src={imageUrl}
            alt={imageTitle}
            className="max-w-full rounded-md cursor-pointer hover:opacity-90 transition-opacity mx-auto"
            onClick={() => onImageClick(imageUrl, imageTitle)}
            style={{ maxHeight: '300px' }}
            title="Click to view full size"
          />
          {alt && (
            <figcaption className="mt-2 text-sm text-gray-600">
              {imageTitle}
            </figcaption>
          )}
        </figure>
      );
    },
    table: ({ ...props }) => (
      <div className="overflow-x-auto my-4">
        <table className="border-collapse w-full" {...props} />
      </div>
    ),
    th: ({ ...props }) => (
      <th 
        className="border border-gray-300 bg-gray-100 px-4 py-2 text-left font-medium" 
        {...props} 
      />
    ),
    td: ({ ...props }) => (
      <td 
        className="border border-gray-300 px-4 py-2" 
        {...props} 
      />
    ),
    tr: ({ ...props }) => (
      <tr 
        className="border-b border-gray-300" 
        {...props} 
      />
    ),
    code: ({ className, children, ...props }: any) => {
      // const match = /language-(\w+)/.exec(className || '');
      return !props.node?.position?.start.line ? (
        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      ) : (
        <code className="block bg-gray-100 p-2 rounded text-sm font-mono overflow-x-auto" {...props}>
          {children}
        </code>
      );
    },
    pre: ({ ...props }) => (
      <pre className="bg-gray-100 p-2 rounded my-2 overflow-x-auto" {...props} />
    ),
    blockquote: ({ ...props }) => (
      <blockquote 
        className="border-l-4 border-gray-300 pl-4 italic my-2" 
        {...props} 
      />
    ),
    strong: ({ ...props }) => (
      <strong className="font-bold" {...props} />
    ),
    em: ({ ...props }) => (
      <em className="italic" {...props} />
    ),
    a: ({ ...props }) => (
      <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
    ),
    ul: ({ ...props }) => (
      <ul className="list-disc pl-5 my-2" {...props} />
    ),
    ol: ({ ...props }) => (
      <ol className="list-decimal pl-5 my-2" {...props} />
    ),
    li: ({ ...props }) => (
      <li className="mb-1" {...props} />
    ),
    h1: ({ ...props }) => (
      <h1 className="text-xl font-bold mt-4 mb-2" {...props} />
    ),
    h2: ({ ...props }) => (
      <h2 className="text-lg font-bold mt-3 mb-2" {...props} />
    ),
    h3: ({ ...props }) => (
      <h3 className="text-md font-bold mt-3 mb-1" {...props} />
    ),
    hr: ({ ...props }) => (
      <hr className="my-4 border-gray-300" {...props} />
    )
  };

  return (
    <div 
      className="markdown-content text-sm text-left"
      data-testid="message-content"
    >
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        components={components}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}