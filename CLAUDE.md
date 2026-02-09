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

### Test Pages Overview

The project includes specialized test pages for different aspects of widget functionality:

#### 1. **test-widget.html** - Positioning & Responsive Testing
```
http://localhost:5173/test-widget.html
```
**Features:**
- Tests widget positioning (left/right placement)
- Interactive buttons behind widget to test clickability when closed
- Click counters to verify button accessibility
- Scroll behavior testing (top/middle/bottom)
- Responsive viewport size indicator
- Mobile/tablet/desktop view simulation buttons

**Test Scenarios:**
- Widget positioned in bottom-left corner
- Green test buttons should be clickable when widget is closed
- Widget should block buttons when open
- Scroll position shouldn't affect widget placement
- Works across all screen sizes

#### 2. **color-test.html** - Theme Color Testing
```
http://localhost:5173/color-test.html
```
**Features:**
- Visual color swatch display (#0EA5E9 primary color)
- Color usage checklist
- Examples of color variations (primary, light, dark)
- Interactive test buttons using primary color
- Integrated widget for live color testing

**What to Verify:**
- Chat header uses theme colors appropriately
- User message bubbles use primary color (#0EA5E9)
- Bot messages use contrasting colors
- Hover states and interactive elements
- Icons and loading indicators

#### 3. **fullscreen-test.html** - Fullscreen & Custom CSS Testing
```
http://localhost:5173/fullscreen-test.html
```
**Features:**
- Comprehensive fullscreen mode testing
- Custom CSS enable/disable toggle
- Detailed checklists for both features
- Configuration display
- Combined feature testing scenarios

**Fullscreen Mode Tests:**
- Expand button (⤢ icon) toggles fullscreen
- Widget covers 100% width & height when expanded
- Positioned at (0, 0) in fullscreen
- ESC key exits fullscreen
- Collapse button (⤡ icon) returns to normal size
- Smooth transition animations

**Custom CSS Tests:**
- Enable via config: `"customCSS": { "enabled": true }`
- Verify CSS loads from configured path
- Check for "🎨 Custom CSS Active" debug badge
- Custom styles apply to all widget elements
- Styles persist in fullscreen mode

### Custom CSS Support

#### Configuration
In `public/widget-config.json`:
```json
{
  "branding": {
    "customCSS": {
      "enabled": true,
      "path": "http://localhost:5173/custom-widget.css"
    }
  }
}
```

**Important Notes:**
- For development, use full URL: `http://localhost:5173/custom-widget.css`
- For production, use relative path: `/custom.css` (served from backend)
- CSS is injected into Shadow DOM (no host page conflicts)
- Custom CSS file: `public/custom-widget.css`

#### Vite Configuration for CSS Serving

**Problem:** Vite dev server serves CSS files from `public/` folder with incorrect MIME type (`text/html` instead of `text/css`), causing browsers to reject the styles.

**Solution:** Custom Vite plugin in `vite.config.ts` that intercepts CSS requests and serves them correctly:

```typescript
{
  name: 'serve-public-css',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      // Intercept requests for custom CSS files
      if (req.url?.endsWith('.css') && req.url.startsWith('/custom')) {
        const cssPath = path.join(__dirname, 'public', req.url);
        if (fs.existsSync(cssPath)) {
          res.setHeader('Content-Type', 'text/css'); // Correct MIME type
          res.end(fs.readFileSync(cssPath, 'utf-8')); // Return CSS content
          return;
        }
      }
      next(); // Pass to next middleware if not a custom CSS file
    });
  }
}
```

**Why This is Needed:**
- Vite expects CSS files to be imported as ES modules (`import './styles.css'`)
- Custom CSS for Shadow DOM requires loading via `<link href="/custom.css">` (URL-based)
- Without this middleware, Vite treats `/custom.css` as a route and returns `index.html`
- This fix ensures CSS files are served with `Content-Type: text/css`

**Important Notes:**
- This middleware only affects development (Vite dev server)
- In production, CSS is served by the Django backend with correct MIME types
- The middleware specifically targets URLs starting with `/custom` to avoid interfering with other assets
- Files must exist in `public/` folder to be served

#### Custom CSS Structure

The custom CSS file (`public/custom-widget.css`) demonstrates:
- Overriding component styles with `!important`
- Targeting Shadow DOM elements by class names
- Using structural selectors (`:first-child`, `:nth-last-child`)
- Custom animations and transitions
- Responsive adjustments
- Debug indicator for CSS load verification

**Key CSS Classes:**
- `.chat-window` - Main widget container
- `.message-user` - User message bubbles
- `.message-assistant` - Bot message bubbles
- `.chat-messages` - Message list container
- `.chat-window > div:first-child` - Header
- `.chat-window > div:nth-last-child(2)` - Input area

### Example Integration
`example.html` demonstrates:
- UMD bundle usage with script tags
- OIDC session extraction from sessionStorage
- External headers configuration
- Fallback to default headers

### Testing Workflow

1. **Start Development Environment:**
   ```bash
   # Terminal 1: Start backend
   cd ../sitechime-bk && docker-compose up

   # Terminal 2: Start frontend
   npm run dev
   ```

2. **Basic Functionality Test:**
   - Open `http://localhost:5173/test-widget.html`
   - Verify widget appears in bottom-left
   - Test open/close toggle
   - Send test messages
   - Check message styling

3. **Positioning Test:**
   - Click green test buttons when widget is closed (should work)
   - Open widget (buttons should be blocked)
   - Scroll page up/down (widget stays fixed)
   - Test on different screen sizes using DevTools

4. **Theme Color Test:**
   - Open `http://localhost:5173/color-test.html`
   - Verify primary color (#0EA5E9) in user messages
   - Check header styling
   - Test interactive element colors

5. **Fullscreen & Custom CSS Test:**
   - Open `http://localhost:5173/fullscreen-test.html`
   - Enable custom CSS in config if desired
   - Test fullscreen expand/collapse
   - Press ESC to exit fullscreen
   - Verify custom styles if enabled

### Debugging Test Issues

**Widget doesn't appear:**
- Check console for errors (F12 → Console)
- Verify backend is running on port 8000
- Check `widget-config.json` is valid JSON
- Ensure Shadow DOM is supported in browser

**Custom CSS not loading:**
- Check Network tab (F12 → Network → CSS filter)
- Verify `custom-widget.css` loads with status 200
- Confirm Content-Type is `text/css` (not `text/html`)
- Check for "🎨 Custom CSS Active" debug badge
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- If Content-Type is `text/html`: Vite middleware may need adjustment
  - Check `vite.config.ts` → `serve-public-css` plugin
  - Verify URL pattern matching in middleware (line 14)
  - Ensure CSS file exists in `public/` folder
  - Restart dev server after config changes

**Fullscreen not working:**
- Verify `widget.behavior.allowFullscreen: true` in config
- Check for expand button (⤢ icon) in header
- Test ESC key functionality
- Check browser console for JavaScript errors

**Positioning issues:**
- Verify `widget.position.placement` is set correctly
- Check `widget.position.offset` values
- Inspect element to see computed styles
- Test in different browsers (Chrome, Firefox, Safari)

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

**Custom CSS Implementation:**
- CSS files are injected via `<link>` element in Shadow DOM
- For development: Use absolute URL (`http://localhost:5173/custom-widget.css`)
- For production: Use relative path that resolves to backend host
- Vite middleware serves CSS with correct MIME type (`text/css`)
- Custom styles can override inline styles using `!important`

### Widget Positioning
- Fixed positioning with configurable offsets
- `widget.position.placement`: "bottom-left" | "bottom-right"
- `widget.position.offset.horizontal/vertical`: pixels from edge
- Z-index configurable via `widget.zIndex` (default: 9999)

### Fullscreen Mode
- Enabled via `widget.behavior.allowFullscreen: true` in config
- Toggle button (⤢/⤡ icons) appears in chat header when enabled
- Fullscreen state managed by `isExpanded` in ChatContext
- When expanded: widget becomes 100% width × 100% height, positioned at (0, 0)
- When collapsed: returns to configured dimensions and position
- ESC key listener (lines 82-96 in `ChatWidget.tsx`) exits fullscreen
- Smooth CSS transitions between states
- Custom CSS class `.expanded` added for fullscreen-specific styling

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

### Adding Custom CSS Files for Shadow DOM
1. Create CSS file in `public/` folder (e.g., `custom-widget.css`)
2. If filename starts with `custom`, the Vite middleware will serve it automatically
3. For other filenames, update middleware pattern in `vite.config.ts` (line 14):
   ```typescript
   if (req.url?.endsWith('.css') && req.url.startsWith('/your-prefix')) {
   ```
4. Update config to point to CSS file:
   ```json
   {
     "branding": {
       "customCSS": {
         "enabled": true,
         "path": "http://localhost:5173/your-file.css"  // Dev
         // "path": "/your-file.css"  // Production (served by backend)
       }
     }
   }
   ```
5. Restart dev server if Vite config was changed
6. Hard refresh test page to load new CSS

### Debugging Widget Issues
1. Enable console logging: `features.logging.console: true` in config
2. Check browser DevTools → Sources → Shadow DOM tree
3. Use `Logger.log()` throughout codebase (respects logging config)
4. Test in isolated environment: open `/test-widget.html`
5. Check Network tab for failed requests or incorrect MIME types
