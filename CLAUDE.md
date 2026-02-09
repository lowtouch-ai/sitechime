# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SiteChime is a React TypeScript chat widget that provides an embeddable AI chat interface for websites. It's built as a standalone widget with Shadow DOM isolation, designed to be embedded in any website without CSS conflicts. The widget communicates with a Django backend (in `../sitechime-bk/`) for AI chat functionality.

## Development Commands

### Frontend (this repository)
```bash
# Install dependencies
npm install

# Start development server (Vite)
npm run dev
# Runs on http://localhost:5173/

# Build for production
npm run build
# Outputs to dist/ with UMD and ES modules

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Backend (../sitechime-bk/)
```bash
# Start Django backend with Docker
cd ../sitechime-bk
docker-compose up

# Backend runs on http://127.0.0.1:8000/
```

## Architecture Overview

### Widget Mount System (Shadow DOM Isolation)

The widget uses **Shadow DOM** to achieve complete style isolation from the host page:

1. **Entry Point**: `src/components/ChatWidget/mount.tsx`
   - Exports `mountChatWidget(containerId, config)` function
   - Creates Shadow DOM and injects Tailwind CSS + custom styles
   - Renders React app inside shadow root
   - This is the UMD build entry point

2. **Shadow DOM Injection**:
   - Tailwind CSS loaded via CDN script into shadow root
   - Component CSS (`ChatWidget.css`) injected as `<style>` tag
   - Ensures zero style conflicts with host page

3. **Build Output**:
   - `dist/data/chat-widget.umd.js` - UMD bundle for script tag usage
   - `dist/data/chat-widget.es.js` - ES module for npm usage
   - React/ReactDOM are external dependencies (must be loaded by host)
   - Post-build plugin moves files to `dist/data/` and copies `example.html` to `dist/index.html`

### Configuration System (3-Tier Hierarchy)

Configuration is merged from three sources (lowest to highest precedence):

1. **Default values** - Hardcoded in components
2. **Mount config** - Props passed to `mountChatWidget()` or `<ChatWidget />`
3. **Remote config** - JSON fetched from `configUrl` (e.g., `/widget-config.json`)

**Key files**:
- `src/types/widgetConfig.ts` - Complete config schema
- `src/services/configService.ts` - Fetches and caches remote config
- `public/widget-config.json` - Example configuration

**Important config sections**:
- `widget.position.placement` - "bottom-right" or "bottom-left"
- `security.api.host` - Backend URL (e.g., http://127.0.0.1:8000)
- `security.api.model` - AI model to use (e.g., "webshop:0.5")
- `branding.theme` - Colors, fonts, glassmorphism effects
- `features.fileUpload` - File attachment configuration

### State Management (Context + Hooks)

**ChatContext** (`src/components/ChatWidget/ChatContext.tsx`):
- Central state container using React Context
- Loads remote configuration on mount
- Manages widget open/closed state, expanded state, terms acceptance
- Provides `sendMessage`, `clearMessages`, `abortStreaming` to children

**useChat Hook** (`src/hooks/useChat.ts`):
- Handles chat message logic and streaming
- Manages message history with retry/regenerate functionality
- Interfaces with `chatService.ts` for API calls

### API Communication

**Backend Communication**:
- `src/services/chatService.ts` - Main chat API service
- `src/services/ragService.ts` - File upload/RAG operations
- Endpoint: `{host}/api/openai/api/chat/completions`
- Supports streaming responses (SSE - Server-Sent Events)

**External Headers System**:
Headers prefixed with `X-LTAI-EXT-*` are forwarded to backend for authentication/context:
- `X-LTAI-EXT-API-TOKEN` - API token for agent authentication
- `X-LTAI-EXT-CLIENT-ID` - Tenant/client identifier
- `X-LTAI-EXT-SESSION-CONTEXT` - JSON with user context (email, name, etc.)

These can be set via:
1. `externalHeaders` config option
2. Global `window.__LTAI_EXT_HEADERS__`
3. OIDC session extraction (see example.html)

### Component Structure

```
ChatWidget (root container)
├── ChatToggleButton (floating button)
└── Chat Window (expandable)
    ├── ChatHeader (logo, title, minimize/expand/close)
    ├── ChatMessageList (scrollable messages)
    │   └── ChatMessage (individual message)
    │       ├── MessageAuthor (avatar + name)
    │       ├── MessageContent (markdown rendering)
    │       ├── ThinkingSection (AI reasoning, collapsible)
    │       ├── RagFilesList (attached files display)
    │       └── RetryButton (regenerate response)
    ├── ChatInput (textarea + file upload)
    └── PoweredByFooter (branding)
```

### File Upload (RAG) System

Files are uploaded to backend and referenced in chat messages:
1. User selects file via `ChatInput`
2. `ragService.ts` uploads to `/api/openai/api/rag/file-upload`
3. Backend returns file metadata with `id`
4. Message sent with `ragFiles` array containing file references
5. Backend attaches files to chat completion request

## Testing

### Test Page
Use `test-widget.html` for comprehensive widget testing:
- Tests positioning (left/right)
- Tests responsive behavior (mobile/tablet/desktop)
- Tests button clickability behind widget
- Tests scroll behavior
- Access at: http://localhost:5173/test-widget.html

### Example Integration
`example.html` demonstrates:
- UMD bundle usage with script tags
- OIDC session extraction from sessionStorage
- External headers configuration
- Fallback to default headers

## Environment Variables

`.env` file (create from `.env.example`):
```bash
VITE_BACKEND_API_URL=http://127.0.0.1:8000/
```

This is used as fallback but usually overridden by `widget-config.json`.

## Key Implementation Details

### Shadow DOM CSS Injection
- Component styles must be injected as raw strings into shadow root
- Import CSS as `?raw`: `import widgetCss from './ChatWidget.css?raw'`
- Tailwind loaded via CDN script tag (v3)
- Custom CSS can be loaded from `branding.customCSS.path`

### Widget Positioning
- Fixed positioning with configurable offsets
- `widget.position.placement`: "bottom-left" | "bottom-right"
- `widget.position.offset.horizontal/vertical`: pixels from edge
- Z-index configurable via `widget.zIndex` (default: 9999)

### Streaming Chat Responses
- Backend sends SSE (Server-Sent Events)
- `chatService.ts` uses `fetch()` with `ReadableStream`
- Chunks parsed line-by-line for `data: {...}` format
- UI updates in real-time as tokens arrive

### Configuration Caching
- Remote config cached in-memory after first fetch
- Prevents redundant network requests
- Use `clearConfigCache()` to force refresh
- Simultaneous fetches deduplicated via promise tracking

## Backend Integration Notes

The Django backend (`../sitechime-bk/`) expects:
- Runs on port 8000 via Docker Compose
- PostgreSQL database (port 5432)
- Redis cache (port 6379/6380)
- Configuration stored in `JsonData` model with UUID as public config ID

The frontend's `apiKey` prop maps to backend's `JsonData.uuid` field, not an actual secret key.

## Common Patterns

### Adding New Widget Config Option
1. Add to `src/types/widgetConfig.ts` interface
2. Update `public/widget-config.json` with example value
3. Access via ChatContext: `const { config } = useChatContext()`
4. Apply in relevant component

### Modifying Widget Positioning
1. Edit `public/widget-config.json`: `widget.position.placement`
2. Or pass via mount config: `{ position: 'bottom-left' }`
3. Styles applied in `ChatWidget.tsx` using inline styles

### Adding New External Header
1. Document header purpose in README
2. Pass via `externalHeaders` config option
3. Backend must handle `X-LTAI-EXT-*` prefix forwarding

### Debugging Widget Issues
1. Enable console logging: `features.logging.console: true` in config
2. Check browser DevTools → Sources → Shadow DOM tree
3. Use `Logger.log()` throughout codebase (respects logging config)
4. Test in isolated environment: open `/test-widget.html`
