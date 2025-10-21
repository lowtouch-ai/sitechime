import React, { useRef, KeyboardEvent, useState, ChangeEvent, useEffect } from 'react';
import { PaperAirplaneIcon, StopIcon, PaperClipIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useChatContext } from './ChatContext';
import { uploadFile } from '../../services/ragService';

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
  const sendIconColor = theme.icons.primary;
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
      console.error('Error uploading file:', error);
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
    <div className="border-t p-4" style={{ borderColor: theme.border }}>
      {/* Only show file errors when file upload is enabled */}
      {fileUploadEnabled && (fileError || uploadError) && (
        <div 
          className="text-xs text-red-500 mb-2 px-1"
          role="alert"
        >
          {fileError || uploadError}
        </div>
      )}
      
      {/* Only show file attachments when file upload is enabled */}
      {fileUploadEnabled && ragFiles.length > 0 && (
        <div className="mb-2">
          {ragFiles.map(file => (
            <div 
              key={file.id}
              className="flex items-center justify-between mb-1 px-3 py-2 bg-gray-100 rounded-lg"
              style={{ backgroundColor: theme.surface }}
            >
              <div className="flex items-center">
                <span className="text-xs text-gray-500 font-medium truncate max-w-[200px]">
                  {file.name || file.id}
                </span>
                <span className="text-xs text-gray-500 ml-1"> 
                  ({file.type})
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="bg-transparent hover:opacity-80 ml-2 rounded-full p-1"
                aria-label="Remove file"
                style={{ color: theme.icons.destructive }}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="relative flex items-center">        <textarea
          ref={textareaRef}
          className="flex-1 resize-none overflow-hidden rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2"
          style={{ 
            borderColor: theme.border,
            minHeight: '44px',
            maxHeight: '150px',
            backgroundColor: theme.surface,
            color: theme.text,
            outlineColor: theme.primary,
            opacity: isInputDisabled ? 0.6 : 1,
            paddingRight: fileUploadEnabled ? '80px' : '48px', // Increased padding to prevent text clipping into buttons
            wordWrap: 'break-word', // Ensure text wraps properly
            whiteSpace: 'pre-wrap' // Maintain line breaks but allow wrapping
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
            className="absolute right-12 p-2 rounded-full hover:opacity-80 transition-all bg-transparent"
            onClick={handleFileClick}
            disabled={isInputDisabled}
            aria-label="Attach file"
            style={{ 
              color: theme.icons.neutral,
              opacity: isInputDisabled ? 0.6 : 1
            }}
          >
            <PaperClipIcon className="h-5 w-5" />
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept={config?.features.fileUpload?.allowedTypes?.join(',') || ".txt,.pdf,application/pdf,text/plain"}
              disabled={isInputDisabled}
            />
          </button>
        )}
        
        <button
          className="absolute right-2 p-2 rounded-full hover:opacity-80 transition-all"
          style={{ 
            backgroundColor: (isLoading || canSendMessage) 
              ? theme.primary 
              : 'transparent',
            color: isLoading 
              ? theme.icons.secondary 
              : sendIconColor,
            opacity: isInputDisabled ? 0.6 : (canSendMessage ? 1 : 0.7)
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