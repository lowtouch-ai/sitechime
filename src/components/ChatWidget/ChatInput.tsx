import React, { useRef, KeyboardEvent, useState, ChangeEvent, useEffect } from 'react';
import { PaperAirplaneIcon, PaperClipIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useChatContext } from './ChatContext';
import { uploadFile } from '../../services/ragService';
import { Logger } from '../../utils/logger';

export const ChatInput: React.FC = () => {  const { 
    sendMessage, 
    inputValue, 
    setInputValue, 
    theme, 
    isLoading, 
    abortStreaming,
    termsAccepted,
    showTerms,
    config,
    apiKey,
    // Remove fileAttachment in favor of ragFiles
    // fileAttachment,
    // setFileAttachment,
    ragFiles,
    addRagFile,
    removeRagFile,
    // Remove this unused variable to fix the TypeScript error
    // uploadingFile,
    uploadError
  } = useChatContext();
  
  // Track previous loading state to detect when loading finishes
  const [prevIsLoading, setPrevIsLoading] = useState(isLoading);
  
  // Effect to focus the textarea after a message finishes sending
  useEffect(() => {
    // If we were loading before and now we're not, refocus the textarea
    if (prevIsLoading && !isLoading && textareaRef.current && !showTerms && !isUploading) {
      textareaRef.current.focus();
    }
    // Update previous loading state
    setPrevIsLoading(isLoading);
  }, [isLoading, prevIsLoading, showTerms]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const canSendMessage = (inputValue.trim() || ragFiles.length > 0) && termsAccepted;

  const handleSend = () => {
    if (isLoading) { 
      abortStreaming(); // Just abort the stream without clearing messages
      return;
    }

    if (canSendMessage) {
      // Send the message with the RAG files
      sendMessage(
        inputValue, 
        ragFiles.length > 0 
          ? { 
              name: ragFiles.map(file => file.name).join(', '), 
              content: ragFiles.map(file => file.name).join('\n'), 
              type: 'file' 
            } 
          : undefined
      );
      setInputValue('');
      
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

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
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
      
      // Check specific extensions based on common patterns
      if (type === "application/pdf" && fileExtension === "pdf") {
        return true;
      }
      
      if (type === "text/plain" && fileExtension === "txt") {
        return true;
      }
      
      return false;
    });
    
    if (!isAllowed) {
      const allowedTypesMessage = allowedTypes
        .map(type => type.endsWith('/*') ? type.replace('/*', ' files') : type)
        .join(', ');
      setFileError(`File type not allowed. Supported types: ${allowedTypesMessage}`);
      return;
    }
    
    // Upload the file using RAG API
    try {
      setIsUploading(true);
      const response = await uploadFile(file, apiKey);
      
      // Add the uploaded file to the RAG files list
      addRagFile({
        id: response.id,
        type: 'file',
        name: file.name
      });
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      Logger.error('Error uploading file:', error);
      setFileError(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };
  
  const removeFile = (fileId: string) => {
    removeRagFile(fileId);
  };
  // Determine if input should be disabled (only for terms and uploading, not during loading)
  const isInputDisabled = showTerms || isUploading;
  
  // Message to show in the placeholder depending on terms acceptance
  const placeholderText = !termsAccepted && showTerms 
    ? "Please accept terms and conditions to chat..." 
    : isUploading 
      ? "Uploading file..." 
      : "Type your message...";

  // Check if file upload is enabled in config
  const fileUploadEnabled = config?.features.fileUpload?.enabled !== false;

  return (
    <div className="border-t p-2.5 relative z-10" style={{ 
      borderColor: 'rgba(255, 255, 255, 0.2)',
      backgroundColor: `rgba(255, 255, 255, ${theme.glassmorphism.opacity * 0.9})`
    }}>
      {fileUploadEnabled && (fileError || uploadError) && (
        <div 
          className="text-xs text-red-500 mb-1.5 px-1 font-medium animate-pulse"
          role="alert"
        >
          {fileError || uploadError}
        </div>
      )}
      
      {fileUploadEnabled && ragFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {ragFiles.map(file => (
            <div 
              key={file.id}
              className="flex items-center space-x-2 px-2.5 py-1 rounded-xl border shadow-sm transition-all hover:shadow-md glass-effect"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: 'rgba(255, 255, 255, 0.3)'
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              <span className="text-[10px] font-bold truncate max-w-[120px]" style={{ color: theme.text }}>
                {file.name || file.id}
              </span>
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="hover:bg-black/5 rounded-md p-0.5 transition-colors"
                aria-label="Remove file"
                style={{ color: theme.icons.destructive }}
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <div className="relative flex-1 flex items-center">
          <textarea
            ref={textareaRef}
            className="w-full resize-none overflow-hidden border px-3 py-2.5 focus:outline-none transition-all duration-300 shadow-sm group-focus-within:shadow-md group-focus-within:border-blue-400/50 text-sm"
            style={{ 
              borderColor: 'rgba(255, 255, 255, 0.4)',
              minHeight: '40px',
              maxHeight: '120px',
              backgroundColor: `rgba(255, 255, 255, ${theme.glassmorphism.messageOpacity})`,
              color: theme.text,
              opacity: isInputDisabled ? 0.6 : 1,
              paddingRight: fileUploadEnabled ? '36px' : '12px',
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              lineHeight: '1.4',
              backdropFilter: `blur(${theme.glassmorphism.blur})`,
              WebkitBackdropFilter: `blur(${theme.glassmorphism.blur})`,
              borderRadius: theme.messageBorderRadius,
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
            <div className="absolute right-1 flex items-center">
              <button  
                type="button"
                className="p-1.5 rounded-lg hover:bg-black/5 active:bg-black/10 transition-all text-gray-400 hover:text-blue-500"
                onClick={handleFileClick}
                disabled={isInputDisabled}
                aria-label="Attach file"
              >
                <PaperClipIcon className="h-5 w-5" />
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.csv,.png,.jpg,.jpeg"
                  multiple
                />
              </button>
            </div>
          )}
        </div>
        
        <button
          onClick={handleSend}
          disabled={!canSendMessage || isUploading}
          className={`transition-all duration-300 flex items-center justify-center shadow-md active:scale-95 flex-shrink-0 ${
            canSendMessage && !isUploading 
              ? 'hover:shadow-lg hover:-translate-y-0.5' 
              : 'opacity-40 cursor-not-allowed shadow-none'
          }`}
          style={{ 
            backgroundColor: canSendMessage && !isUploading ? theme.primary : theme.border,
            color: theme.secondary,
            width: '40px',
            height: '40px',
            borderRadius: theme.messageBorderRadius,
          }}
          aria-label={isLoading ? "Stop generating" : "Send message"}
        >
          {isLoading ? (
            <div className="flex space-x-1 items-center">
              <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
              <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          ) : (
            <PaperAirplaneIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
};