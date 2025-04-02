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
    behavior: {
      initialState: 'minimized' | 'expanded';
      autoExpand: boolean;
      allowFullscreen: boolean;
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
    logo: {
      url: string;
      height: number;
      width: number;
    };
    theme: {
      primaryColor: string;
      secondaryColor: string;
      fontFamily: string;
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
    authentication: {
      tokenRefreshInterval: number;
      maxRetries: number;
    };
    rateLimit: {
      requestsPerMinute: number;
      maxConcurrentUsers: number;
    };
    api: {
      host: string;
      version: string;
      timeout: number;
    };
  };
  features: {
    fileUpload: {
      enabled: boolean;
      maxSize: number;
      allowedTypes: string[];
    };
    logging: {
      level: 'debug' | 'info' | 'warn' | 'error';
      retention: number;
    };
    performance: {
      messageBuffer: number;
      streamingBufferSize: number;
    };
  };
}
