import { ChatWidget } from './components/ChatWidget'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold mb-4">OpenAI Chat Widget Demo</h1>
        <p className="text-lg text-gray-600 mb-8">
          This is a demo of the OpenAI Chat Widget. Click the chat button in the bottom right corner to start a conversation.
        </p>
      </div>
      
      <ChatWidget 
        apiKey="your-openai-api-key"
        position="bottom-right"
        primaryColor="#0066cc"
        welcomeMessage="👋 Hi there! How can I assist you today?"
      />
    </div>
  )
}

export default App
