import React, { useState } from 'react';
import { ChatTheme } from '../types';
import { ThinkingSection } from './ThinkingSection';
import { FileAttachment, RAGFile } from '../../../types/chat';
import { ImageModal } from './ImageModal';
import { MessageAuthor } from './MessageAuthor';
import { RagFilesList } from './RagFilesList';
import { MessageContent } from './MessageContent';
import { useChatContext } from '../ChatContext';

interface ChatMessageProps {
  content: string;
  role: 'user' | 'assistant';
  botName: string;
  botAvatarUrl?: string;
  theme: ChatTheme;
  thinkingExpanded: boolean;
  onToggleThinking: () => void;
  fileAttachment?: FileAttachment;
  ragFiles?: RAGFile[];
  isLastMessage?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  role,
  botName,
  botAvatarUrl,
  theme,
  thinkingExpanded,
  onToggleThinking,
  ragFiles,
  isLastMessage = false
}) => {
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [imageTitle, setImageTitle] = useState<string>('Image');
  const { isLoading } = useChatContext();
  
  // Helper to convert decimal opacity (0-1) to hex alpha (00-FF)
  const toHexAlpha = (opacity: number) => {
    const alpha = Math.round(opacity * 255);
    return alpha.toString(16).padStart(2, '0').toUpperCase();
  };

  // Process message content to extract thinking tokens
  const processMessageContent = (content: string) => {
    if (content.includes('<think>') && !content.includes('</think>')) {
      const parts = content.split('<think>');
      return {
        regularContent: parts[0] || '',
        thinkingContent: parts[1] || '',
        inProgressThinking: true
      };
    }
    
    const thinkingRegex = /<think>([\s\S]*?)<\/think>/g;
    let match;
    let regularContent = content;
    let thinkingContent = null;
    
    while ((match = thinkingRegex.exec(content)) !== null) {
      thinkingContent = match[1];
      regularContent = regularContent.replace(match[0], '');
    }
    
    return { 
      regularContent: regularContent.trim(),
      thinkingContent,
      inProgressThinking: false
    };
  };

  // Handler for image clicks
  const handleImageClick = (url: string, title?: string) => {
    setEnlargedImage(url);
    setImageTitle(title || 'Image');
  };

  const { regularContent, thinkingContent, inProgressThinking } = processMessageContent(content);
  
  // Show loading indicator if this is the last assistant message and we're loading
  const showLoadingIndicator = isLastMessage && role === 'assistant' && isLoading;

  return (
    <>
      <div
        className={`chat-message ${
          role === 'user' ? 'message-user' : 'message-assistant'
        } message-appear glass-effect`}
        style={{
          backgroundColor: role === 'user' 
            ? `${theme.primary}${toHexAlpha(theme.glassmorphism.messageOpacity)}` 
            : `rgba(255, 255, 255, ${theme.glassmorphism.messageOpacity})`,
          color: role === 'user' ? theme.secondary : theme.text,
          border: `1px solid ${role === 'user' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.3)'}`,
          backdropFilter: `blur(${theme.glassmorphism.blur})`,
          WebkitBackdropFilter: `blur(${theme.glassmorphism.blur})`,
          borderRadius: theme.messageBorderRadius,
        }}
      >
        <MessageAuthor 
          role={role} 
          botName={botName} 
          botAvatarUrl={botAvatarUrl} 
          theme={theme} 
        />
        
        {(thinkingContent || inProgressThinking) && role === 'assistant' && (
          <ThinkingSection
            content={thinkingContent || ''}
            isExpanded={thinkingExpanded}
            onToggle={onToggleThinking}
            theme={theme}
            inProgress={inProgressThinking}
          />
        )}
        
        <MessageContent 
          content={regularContent || ' '} 
          role={role} 
          theme={theme}
          onImageClick={handleImageClick}
          className={role === 'user' ? 'text-right' : 'text-left'}
        />
        
        {ragFiles && ragFiles.length > 0 && role === 'user' && (
          <RagFilesList 
            files={ragFiles} 
            role={role} 
            theme={theme} 
          />
        )}
        
        {/* Show loading indicator inside the message */}
        {showLoadingIndicator && (
          <div className="typing-indicator mt-2" style={{ border: `1px solid ${theme.primary}20` }}>
            <div 
              className="typing-indicator-dot"
              style={{ backgroundColor: theme.secondary }}
            ></div>
            <div 
              className="typing-indicator-dot"
              style={{ backgroundColor: theme.secondary }}
            ></div>
            <div 
              className="typing-indicator-dot"
              style={{ backgroundColor: theme.secondary }}
            ></div>
          </div>
        )}
      </div>

      {/* Image modal for enlarged view */}
      {enlargedImage && (
        <ImageModal 
          imageUrl={enlargedImage} 
          imageTitle={imageTitle}
          onClose={() => setEnlargedImage(null)} 
        />
      )}
    </>
  );
};