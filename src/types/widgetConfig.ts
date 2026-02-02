export interface WidgetConfig {
  widget: {
    position: {
      placement: 'bottom-right' | 'bottom-left';
      offset: {
        horizontal: number;
        vertical: number;
      };
    };
    dimensions: {
      width: number;
      height: number;
      minHeight: number;
      maxWidth: number;
    };
    zIndex?: number;
    behavior: {
      initialState: 'minimized' | 'expanded';
      autoExpand: boolean;
      allowFullscreen: boolean;
      clearChat?: {
        enabled: boolean;
      };
    };
    terms: {
      enabled: boolean;
      title: string;
      content: string;
      acceptButtonText: string;
      declineButtonText: string;
    };
  };
  branding: {
    botName?: string;
    headerSubtitle?: string;
    logo: {
      url: string;
      width?: number;
      height?: number;
    };
    toggleButtonIcon?: {
      url: string;
      height?: number;
      width?: number;
    };
    toggleButton?: {
      backgroundColor?: string;
      size?: number;
      borderRadius?: string;
    };
    theme: {
      primaryColor: string;
      secondaryColor: string;
      fontFamily: string;
      backgroundColor?: string;
      borderColor?: string;
      textColor?: string;
      textSecondaryColor?: string;
      glassmorphism?: {
        opacity: number;
        blur: string;
        messageOpacity: number;
      };
      messageBorderRadius?: string;
    };
    icons?: {
      primary?: string;
      secondary?: string;
      neutral?: string;
      destructive?: string;
      toggle?: string;
    };
    poweredBy: {
      text: string;
      visible: boolean;
    };
    customCSS: {
      enabled: boolean;
      path: string;
    };
  };
  security: {
    apiKey: string;
    authentication: {
      maxRetries: number;
    };
    api: {
      host: string;
      timeout: number;
      model?: string;
    };
  };
  features: {
    fileUpload: {
      enabled: boolean;
      maxSize: number;
      allowedTypes: string[];
    };
    logging?: {
      console?: boolean;
    };
  };
}
