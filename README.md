# OpenAI Chat Widget

A React TypeScript component that provides a chat widget interface for OpenAI's API, similar to tawk.to. This widget appears as a floating button in the bottom corner of your website and expands into a chat interface when clicked.

## Features

- 🎨 Modern UI with Tailwind CSS
- 💬 Real-time chat interface
- 🔄 Loading states and animations
- 📱 Responsive design
- 🎨 Customizable colors and positions
- 🤖 OpenAI API integration

## Installation

```bash
npm install openai-chat-widget
```

## Usage

```tsx
import { ChatWidget } from 'openai-chat-widget'

function App() {
  return (
    <div>
      <ChatWidget 
        apiKey="your-openai-api-key"
        position="bottom-right"
        primaryColor="#0066cc"
        welcomeMessage="👋 Hi there! How can I assist you today?"
      />
    </div>
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| apiKey | string | required | Your OpenAI API key |
| position | 'bottom-right' \| 'bottom-left' | 'bottom-right' | Position of the chat widget |
| primaryColor | string | '#0066cc' | Primary color for the widget |
| welcomeMessage | string | 'Hello! How can I help you today?' | Initial message from the assistant |

## Configuration

You can customize the widget through the `widget-config.json` file. Example configuration:

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
    }
  }
}
```

The `toggleButtonIcon` is used for the chat button, while `logo` is used for the bot avatar in chat. If `toggleButtonIcon` is not provided, it will fall back to using the `logo`.

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

Always keep your OpenAI API key secure and never expose it in client-side code. Consider implementing a backend proxy to handle API requests securely.

## License

MIT
