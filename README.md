# OpenAI Chat Widget

A React TypeScript component that provides a chat widget interface for OpenAI's API, similar to tawk.to. This widget appears as a floating button in the bottom corner of your website and expands into a chat interface when clicked.

## Features

- 🎨 Modern UI with Tailwind CSS
- 💬 Real-time chat interface
- 🔄 Loading states and animations
- 📱 Responsive design
- 🎨 Customizable colors and positions
- 🤖 OpenAI API integration
- 🧩 Shadow DOM isolation (no CSS conflicts with host page)

## Installation

```bash
npm install openai-chat-widget
```

## Usage

### Option A: HTML embed (UMD)

```html
<!-- Container -->
<div id="chat-widget"></div>

<!-- React UMD (required) -->
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

<!-- Chat widget UMD (build step required, can be referenced from different locations) -->
<script src="/data/chat-widget.umd.js"></script>

<script>
  const { mountChatWidget } = SiteChimeWidget;

  // Optional: Provide external headers (e.g., from your IdP session)
  // These headers will be forwarded by the widget to your backend.
  const externalHeaders = {
    'X-LTAI-EXT-APEXAIQ-API-TOKEN': 'your-access-token',
    'X-LTAI-EXT-CLIENT-ID': 'your-tenant-or-client-id',
    'X-LTAI-EXT-SESSION-CONTEXT': JSON.stringify({ email: 'user@example.com' })
  };

  // Minimal config; colors are optional. CSS is auto-injected into Shadow DOM.
  const config = {
    apiKey: 'your-config-id-or-api-key',
    configUrl: '/data/widget-config.json',
    position: 'bottom-right',
    theme: {
      primary: '#0b5fff',
      secondary: '#ffffff',
      text: '#000000',
      surface: '#ffffff',
      border: '#e5e7eb'
    },
    externalHeaders // optional
  };

  mountChatWidget('chat-widget', config);
</script>
```

Notes:
- The widget uses Shadow DOM and injects its own CSS; you do not need to add a stylesheet.
- If you set `window.__LTAI_EXT_HEADERS__ = { ... }`, the widget will use those headers by default.

### Option B: React component (app integration)

```tsx
import { ChatWidget } from 'openai-chat-widget'

export default function App() {
  return (
    <ChatWidget
      apiKey="your-config-id-or-api-key"
      configUrl="/data/widget-config.json"
      position="bottom-right"
      theme={{ primary: '#0b5fff' }}
      welcomeMessage="👋 Hi there! How can I assist you today?"
      externalHeaders={{ 'X-LTAI-EXT-CLIENT-ID': 'example' }}
    />
  )
}
```

## Props

Supported props for both integrations:

```ts
// UMD mount API
type ChatWidgetConfig = {
  apiKey: string;
  configUrl: string;
  position?: 'bottom-right' | 'bottom-left';
  theme?: Partial<{
    primary: string;
    secondary: string;
    text: string;
    textSecondary: string;
    surface: string;
    background: string;
    border: string;
    icons: {
      primary: string;
      secondary: string;
      neutral: string;
      destructive: string;
      toggle: string;
    };
  }>;
  externalHeaders?: Record<string, string>; // optional forwarded headers
}

// React component props (superset)
type ChatWidgetProps = ChatWidgetConfig & {
  welcomeMessage?: string;
}
```

### External headers

If your backend expects propagated identity/context, pass them via `externalHeaders` (UMD) or `externalHeaders` prop (React):

```ts
{
  'X-LTAI-EXT-APEXAIQ-API-TOKEN': '<access token>',
  'X-LTAI-EXT-CLIENT-ID': '<client id>',
  'X-LTAI-EXT-SESSION-CONTEXT': '{"email":"user@example.com","name":"Jane"}'
}
```

Alternatively, set a page-global:

```js
window.__LTAI_EXT_HEADERS__ = { /* same shape as above */ }
```

### Loading headers from sessionStorage (OIDC)

If your site stores an OIDC session in `sessionStorage`, you can derive `externalHeaders` automatically and pass them to the widget.

```html
<script>
  const OIDC_STORAGE_PREFIX = 'oidc.user:'; // adjust if your IdP uses a different key scheme

  function findOidcStorageKey() {
    if (typeof sessionStorage === 'undefined') return null;
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(OIDC_STORAGE_PREFIX)) return key;
    }
    return null;
  }

  function loadOidcSession(storageKey) {
    if (!storageKey || typeof sessionStorage === 'undefined') return null;
    try { return JSON.parse(sessionStorage.getItem(storageKey)); } catch { return null; }
  }

  function extractClientId(storageKey, oidcSession) {
    if (storageKey) {
      const i = storageKey.lastIndexOf(':');
      if (i !== -1) return storageKey.slice(i + 1);
    }
    const profile = oidcSession?.profile;
    const candidates = [profile?.aud, oidcSession?.aud, oidcSession?.clientId];
    for (const c of candidates) {
      if (Array.isArray(c) && c.length) return c[0];
      if (typeof c === 'string' && c) return c;
    }
    return '';
  }

  const key = findOidcStorageKey();
  const oidc = loadOidcSession(key);
  const accessToken = oidc?.access_token ?? '';
  const tokenType = oidc?.token_type ?? 'Bearer';
  const profile = oidc?.profile ?? {};
  const clientId = extractClientId(key, oidc);

  const sessionContext = {
    email: profile.email,
    name: profile.name ?? profile.nickname,
    picture: profile.picture,
    sid: oidc?.sid ?? profile.sid,
    sub: oidc?.sub ?? profile.sub,
    tokenType: tokenType && tokenType !== 'Bearer' ? tokenType : undefined
  };
  const filtered = Object.fromEntries(Object.entries(sessionContext).filter(([, v]) => v != null));

  const derivedHeaders = {};
  if (accessToken) derivedHeaders['X-LTAI-EXT-APEXAIQ-API-TOKEN'] = accessToken;
  if (clientId) derivedHeaders['X-LTAI-EXT-CLIENT-ID'] = clientId;
  if (Object.keys(filtered).length) derivedHeaders['X-LTAI-EXT-SESSION-CONTEXT'] = JSON.stringify(filtered);

  const widgetConfig = {
    apiKey: accessToken, // or your config ID, depending on your backend
    configUrl: '/data/widget-config.json',
    externalHeaders: Object.keys(derivedHeaders).length ? derivedHeaders : undefined
  };

  SiteChimeWidget.mountChatWidget('chat-widget', widgetConfig);
</script>
```

Notes:
- Adjust `OIDC_STORAGE_PREFIX` to your IdP/client library if needed.
- When no OIDC session is found, you can fall back to defaults (e.g., `DEFAULT_HEADERS`) or omit `externalHeaders`.
- The widget also supports a page-global `window.__LTAI_EXT_HEADERS__` as a fallback.

## Configuration

You can customize the widget through a JSON file referenced by `configUrl`.

Example (`public/widget-config.example.json`):

```json
{
  "branding": {
    "logo": {
      "url": "https://example.com/logo.png",
      "height": 40,
      "width": 40
    },
    "toggleButtonIcon": {
      "url": "https://example.com/chat-icon.png",
      "height": 32,
      "width": 32
    },
    "theme": {
      "primaryColor": "#0b5fff",
      "secondaryColor": "#ffffff",
      "backgroundColor": "#ffffff",
      "surfaceColor": "#ffffff",
      "borderColor": "#e5e7eb",
      "textColor": "#111827",
      "textSecondaryColor": "#71717a"
    },
    "icons": {
      "primary": "#2563eb",
      "secondary": "#111827",
      "neutral": "#4b5563",
      "destructive": "#ef4444",
      "toggle": "#ffffff"
    },
    "poweredBy": { "text": "Powered by lowtouch.ai", "visible": true }
  },
  "security": {
    "api": {
      "host": "https://your-backend.example.com",
      "version": "v1",
      "timeout": 300000
    },
    "authentication": { "maxRetries": 3 }
  },
  "features": {
    "fileUpload": { "enabled": true, "maxSize": 5, "allowedTypes": ["image/*", "application/pdf"] }
  }
}
```

Notes:
- `toggleButtonIcon` is used for the chat button; `logo` is used for the bot avatar. If `toggleButtonIcon` is not provided, it falls back to `logo`.
- The widget reads `security.api.host` and will call `<host>/api/openai/api/chat/completions`.

## Development

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Security Note

Do not expose raw OpenAI API keys in client-side code. The widget is designed to call your backend (configured via `configUrl`) and forward identity/context via `externalHeaders` so your server can authenticate and call OpenAI securely.

## License

MIT
