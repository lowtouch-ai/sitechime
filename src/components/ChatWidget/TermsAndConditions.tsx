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
    <div className="terms-and-conditions flex-1 overflow-y-auto p-4 flex flex-col">
      <h3 className="text-lg font-semibold mb-3" style={{ color: theme.text }}>
        {terms.title}
      </h3>
      
      <div 
        className="terms-content flex-1 overflow-y-auto mb-4 text-sm p-3 rounded border"
        style={{ 
          borderColor: theme.border,
          backgroundColor: theme.surface,
          color: theme.text
        }}
      >
        <div className="whitespace-pre-line">
          {terms.content}
        </div>
      </div>
      
      <div className="terms-actions flex space-x-3 justify-center">
        <button
          onClick={declineTerms}
          className="py-2 px-4 rounded text-sm"
          style={{ 
            backgroundColor: '#f3f4f6',
            color: theme.text,
            border: `1px solid ${theme.border}`
          }}
        >
          {terms.declineButtonText}
        </button>
        
        <button
          onClick={acceptTerms}
          className="py-2 px-4 rounded text-sm"
          style={{ 
            backgroundColor: theme.primary, 
            color: theme.secondary
          }}
        >
          {terms.acceptButtonText}
        </button>
      </div>
    </div>
  );
};