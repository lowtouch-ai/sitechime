import React from 'react';
import { useChatContext } from './ChatContext';

const DEFAULT_TERMS = {
  title: "Terms and Conditions",
  content: "By using this chat service, you agree to the following terms and conditions:\n\n1. All conversations may be recorded for quality assurance and training purposes.\n2. Do not share sensitive personal information such as credit card details or passwords.\n3. This service is provided \"as is\" without any warranties.\n4. We reserve the right to terminate access for violations of these terms.\n5. Information provided by the AI assistant should not be considered professional advice.",
  acceptButtonText: "Accept",
  declineButtonText: "Decline"
};

export const TermsAndConditions: React.FC = () => {
  const { acceptTerms, declineTerms, theme, config } = useChatContext();
  
  const terms = config?.widget.terms || DEFAULT_TERMS;

  return (
    <div className="terms-and-conditions flex-1 overflow-y-auto p-6 flex flex-col">
      <div className="max-w-2xl mx-auto w-full">
        <h2 
          className="text-xl font-semibold mb-6 text-left" 
          style={{ color: theme.text }}
        >
          {terms.title}
        </h2>
        
        <div 
          className="terms-content flex-1 overflow-y-auto mb-8 text-sm rounded-lg border"
          style={{ 
            borderColor: theme.border,
            backgroundColor: theme.surface,
            color: theme.text
          }}
        >
          <div className="p-6 text-left space-y-4 whitespace-pre-line">
            <p className="mb-4 font-medium">
              Please read these terms carefully before using the chat service.
            </p>
            {terms.content}
          </div>
        </div>
        
        <div className="terms-actions flex justify-start space-x-4">
          <button
            onClick={acceptTerms}
            className="py-2.5 px-6 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
            style={{ 
              backgroundColor: theme.primary, 
              color: theme.secondary
            }}
          >
            {terms.acceptButtonText}
          </button>
          
          <button
            onClick={declineTerms}
            className="py-2.5 px-6 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-100"
            style={{ 
              backgroundColor: 'transparent',
              color: theme.text,
              border: `1px solid ${theme.border}`
            }}
          >
            {terms.declineButtonText}
          </button>
        </div>

        <p 
          className="mt-6 text-xs text-left opacity-70" 
          style={{ color: theme.text }}
        >
          By clicking "{terms.acceptButtonText}", you acknowledge that you have read and agree to these terms.
        </p>
      </div>
    </div>
  );
};