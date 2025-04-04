import React from 'react';
import { ChatTheme } from '../types';
import { useChatContext } from '../ChatContext';
import ReactShowdown from 'react-showdown';

// Add CSS for table and list styling
const markdownStyles = `
  /* Modern Table styles */
  .markdown-content table {
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;
    margin: 1rem 0;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .markdown-content thead {
    background-color: #f9fafb;
  }
  
  .markdown-content th {
    color: #4b5563;
    font-weight: 600;
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 2px solid #e5e7eb;
    font-size: 0.875rem;
    text-transform: uppercase;
  }
  
  .markdown-content td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e5e7eb;
    color: #1f2937;
    background-color: white;
  }
  
  .markdown-content tr:last-child td {
    border-bottom: none;
  }
  
  .markdown-content tr:nth-child(even) td {
    background-color: #f9fafb;
  }
  
  .markdown-content tr:hover td {
    background-color: #f3f4f6;
  }
  
  /* Make tables responsive */
  .markdown-content .table-container {
    overflow-x: auto;
    display: block;
    width: 100%;
    margin-bottom: 1rem;
    border-radius: 0.5rem;
  }
  
  /* List styles */
  .markdown-content ul {
    list-style-type: disc;
    padding-left: 1.5rem;
    margin: 0.2rem 0;
    line-height: 1.2;
  }
  
  .markdown-content ol {
    list-style-type: decimal;
    padding-left: 1.5rem;
    margin: 0.2rem 0;
    line-height: 1.2;
  }
  
  .markdown-content li {
    margin: 0.1rem 0;
    padding: 0;
    line-height: 1.2;
  }
  
  /* Reduce space between ul/ol and first li */
  .markdown-content ul > li:first-child,
  .markdown-content ol > li:first-child {
    margin-top: -0.2rem;
  }
  
  /* Nested list styles - make them more compact */
  .markdown-content li > ul,
  .markdown-content li > ol {
    margin: 0;
    padding-left: 1.2rem;
    line-height: 0.9;
  }
  
  .markdown-content li > ul > li,
  .markdown-content li > ol > li {
    margin: 0;
    padding: 0;
    line-height: 0.9;
  }
  
  /* Add space between consecutive top-level lists */
  .markdown-content > ul + ul,
  .markdown-content > ol + ol,
  .markdown-content > ul + ol,
  .markdown-content > ol + ul {
    margin-top: 2rem;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }
  
  /* Fix spacing between headers and lists */
  .markdown-content h1 + ul,
  .markdown-content h2 + ul,
  .markdown-content h3 + ul,
  .markdown-content h4 + ul,
  .markdown-content h1 + ol,
  .markdown-content h2 + ol,
  .markdown-content h3 + ol,
  .markdown-content h4 + ol {
    margin-top: 0;
  }

  /* Make paragraphs in list items more compact */
  .markdown-content li p {
    margin: 0;
    padding: 0;
  }
`;

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
      (match, mdPrefix, url, _ext, mdSuffix) => {
        // Check if this URL has already been transformed
        if (url.includes(apiHost)) return match;
        
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
    // and aren't already transformed
    return content.replace(
      /(?<!![\w\s]*\]\()(\/?static\/[^\s)]+\.(png|jpg|jpeg|gif|svg|webp))(?!\))/gi,
      (match) => {
        // Just wrap it in markdown syntax without transforming
        return `![Image](${match})`;
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

  // Custom components and options for markdown rendering
  const components = {
    img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
      if (!src) return null;
      
      // Only transform the URL if it's a static URL and hasn't been transformed yet
      const imageUrl = (src.startsWith('/static/') || src.startsWith('static/')) && 
                       !src.includes(config?.security.api.host || '')
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
    table: ({ children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
      <div className="table-container">
        <table {...props}>{children}</table>
      </div>
    ),
    ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
      <ul {...props}>{children}</ul>
    ),
    ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
      <ol {...props}>{children}</ol>
    ),
    li: ({ children, ...props }: React.LiHTMLAttributes<HTMLLIElement>) => (
      <li {...props}>{children}</li>
    )
  };

  // Showdown options
  const options = {
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true,
    ghCodeBlocks: true,
    emoji: true
  };

  return (
    <>
      <style>{markdownStyles}</style>
      <div 
        className="markdown-content text-sm text-left"
        data-testid="message-content"
      >
        <ReactShowdown 
          markdown={processedContent}
          components={components}
          options={options}
          flavor="github"
        />
      </div>
    </>
  );
}