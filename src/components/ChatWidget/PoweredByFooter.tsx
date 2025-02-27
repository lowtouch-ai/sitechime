import React from 'react';
import { useChatContext } from './ChatContext';

export const PoweredByFooter: React.FC = () => {
  const { config, theme } = useChatContext();
  
  if (!config?.branding.poweredBy.visible) {
    return null;
  }
  
  return (
    <div 
      className="text-center text-xs py-2 px-4 border-t"
      style={{ 
        borderColor: theme.border,
        color: theme.text + '99' // Adding transparency to the text color
      }}
    >
      {config.branding.poweredBy.text}
    </div>
  );
};