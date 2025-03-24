import React from 'react';
import { useChatContext } from './ChatContext';

export const TermsAndConditions: React.FC = () => {
  const { acceptTerms, declineTerms, theme } = useChatContext();

  return (
    <div className="terms-and-conditions flex-1 overflow-y-auto p-4 flex flex-col">
      <h3 className="text-lg font-semibold mb-3" style={{ color: theme.text }}>
        Terms and Conditions
      </h3>
      
      <div 
        className="terms-content flex-1 overflow-y-auto mb-4 text-sm p-3 rounded border"
        style={{ 
          borderColor: theme.border,
          backgroundColor: theme.surface,
          color: theme.text
        }}
      >
        <p className="mb-2">
          By using this chat service, you agree to the following terms and conditions:
        </p>
        
        <ol className="list-decimal pl-5 space-y-2">
          <li>All conversations may be recorded for quality assurance and training purposes.</li>
          <li>Do not share sensitive personal information such as credit card details or passwords.</li>
          <li>This service is provided "as is" without any warranties.</li>
          <li>We reserve the right to terminate access for violations of these terms.</li>
          <li>Information provided by the AI assistant should not be considered professional advice.</li>
        </ol>
        
        <p className="mt-4">
          By clicking "Accept", you confirm that you have read, understood, and agree to these terms.
        </p>
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
          Decline
        </button>
        
        <button
          onClick={acceptTerms}
          className="py-2 px-4 rounded text-sm"
          style={{ 
            backgroundColor: theme.primary, 
            color: theme.secondary
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
};