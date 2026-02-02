import React from 'react';
import { useChatContext } from './ChatContext';

export const PoweredByFooter: React.FC = () => {
  const { config, theme } = useChatContext();
  
  if (!config?.branding.poweredBy.visible) {
    return null;
  }
  
  return (
    <div 
      className="powered-by"
      style={{ 
        borderColor: 'rgba(255, 255, 255, 0.2)',
        color: theme.text,
        backgroundColor: `rgba(255, 255, 255, ${theme.glassmorphism.opacity * 0.9})`
      }}
    >
      {config.branding.poweredBy.text}
    </div>
  );
};