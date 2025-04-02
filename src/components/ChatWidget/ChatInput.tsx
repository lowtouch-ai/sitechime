import React, { useRef, KeyboardEvent, useState, ChangeEvent } from 'react';
import { PaperAirplaneIcon, StopIcon, PaperClipIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useChatContext } from './ChatContext';
import { FileAttachment } from '../../types/chat';

export const ChatInput: React.FC = () => {
  const { 
    sendMessage, 
    inputValue, 
    setInputValue, 
    theme, 
    isLoading, 
    abortStreaming,
    termsAccepted,
    showTerms,
    config,
    fileAttachment,
    setFileAttachment
  } = useChatContext();
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleSend = () => {
    if (isLoading) {
      abortStreaming(); // Just abort the stream without clearing messages
      return;
    }

    if ((inputValue.trim() || fileAttachment) && termsAccepted) {
      sendMessage(inputValue, fileAttachment ?? undefined);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && termsAccepted) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  };

  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }
    
    const file = files[0];
    const fileUploadConfig = config?.features.fileUpload;
    
    // Check if file uploads are enabled
    if (!fileUploadConfig?.enabled) {
      setFileError("File uploads are not enabled.");
      return;
    }
    
    // Check file size (in MB)
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > (fileUploadConfig.maxSize || 2)) {
      setFileError(`File too large. Maximum size is ${fileUploadConfig.maxSize || 2}MB.`);
      return;
    }
    
    // Check file type
    const allowedTypes = fileUploadConfig.allowedTypes || ["application/pdf", "text/plain"];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    // Check by MIME type or file extension
    const isAllowed = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        // Handle wildcards like "image/*"
        const typePrefix = type.replace('/*', '');
        return file.type.startsWith(typePrefix);
      }
      
      // Check against MIME type
      if (file.type === type) {
        return true;
      }
      
      // Also check file extensions for common types
      if (fileExtension === "txt") {
        return true;
      }
      
      if (fileExtension === "pdf") {
        return true;
      }
      
      return false;
    });
    
    if (!isAllowed) {
      setFileError("File type not allowed. Supported types include PDF and text files.");
      return;
    }
    
    // Read file content
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        const fileAttachment: FileAttachment = {
          name: file.name,
          type: file.type,
          content: event.target.result as string
        };
        
        setFileAttachment(fileAttachment);
      }
    };
    
    reader.onerror = () => {
      setFileError("Error reading file.");
    };
    
    // If it's a text file or PDF, read as text
    if (file.type === "text/plain" || file.type === "application/pdf") {
      reader.readAsText(file);
    } else {
      // For other file types, just store the name (or could use readAsDataURL for images)
      setFileError("Only text and PDF files are currently supported for content extraction.");
      return;
    }
  };
  
  const removeFile = () => {
    setFileAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFileError(null);
  };

  // Determine if input should be disabled
  const isInputDisabled = isLoading || showTerms;
  
  // Message to show in the placeholder depending on terms acceptance
  const placeholderText = !termsAccepted && showTerms 
    ? "Please accept terms and conditions to chat..." 
    : "Type your message...";

  // Check if file upload is enabled in config
  const fileUploadEnabled = config?.features.fileUpload?.enabled !== false;

  return (
    <div className="border-t p-4" style={{ borderColor: theme.border }}>
      {fileError && (
        <div 
          className="text-xs text-red-500 mb-2 px-1"
          role="alert"
        >
          {fileError}
        </div>
      )}
      
      {fileAttachment && (
        <div 
          className="flex items-center justify-between mb-2 px-3 py-2 bg-gray-100 rounded-lg"
          style={{ backgroundColor: theme.surface }}
        >
          <div className="flex items-center">
            <span className="text-xs font-medium truncate max-w-[200px]">
              {fileAttachment.name}
            </span>
          </div>
          <button
            type="button"
            onClick={removeFile}
            className="text-gray-500 hover:text-gray-700 ml-2"
            aria-label="Remove file"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}
      
      <div className="relative flex items-center">
        <textarea
          ref={textareaRef}
          className="flex-1 resize-none overflow-hidden rounded-2xl border px-4 py-3 pr-12 focus:outline-none focus:ring-2"
          style={{ 
            borderColor: theme.border,
            minHeight: '44px',
            maxHeight: '150px',
            backgroundColor: theme.surface,
            color: theme.text,
            outlineColor: theme.primary,
            opacity: isInputDisabled ? 0.6 : 1
          }}
          placeholder={placeholderText}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onInput={handleTextareaInput}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isInputDisabled}
        />
        
        {fileUploadEnabled && (
          <button 
            type="button"
            className="absolute right-12 p-2 rounded-full hover:bg-gray-100 transition-all"
            onClick={handleFileClick}
            disabled={isInputDisabled}
            aria-label="Attach file"
            style={{ 
              color: theme.text,
              opacity: isInputDisabled ? 0.6 : 1
            }}
          >
            <PaperClipIcon className="h-5 w-5" />
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".txt,.pdf,application/pdf,text/plain"
              disabled={isInputDisabled}
            />
          </button>
        )}
        
        <button
          className="absolute right-2 p-2 rounded-full hover:opacity-80 transition-all"
          style={{ 
            backgroundColor: (isLoading || ((inputValue.trim() || fileAttachment) && termsAccepted)) 
              ? theme.primary 
              : 'transparent',
            color: (isLoading || ((inputValue.trim() || fileAttachment) && termsAccepted)) 
              ? theme.secondary 
              : theme.text,
            opacity: isInputDisabled ? 0.6 : 1
          }}
          onClick={handleSend}
          aria-label={isLoading ? "Stop generating" : "Send message"}
          disabled={isInputDisabled && !isLoading}
        >
          {isLoading ? (
            <StopIcon className="h-5 w-5" />
          ) : (
            <PaperAirplaneIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
};