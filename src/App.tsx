import { ChatWidget } from './components/ChatWidget';
import './App.css';

function App() {
  return (
    <div className="App">
      <ChatWidget 
        apiKey="8b4222cf-ba57-4543-9f7c-bc8134fb45d8"
        configUrl="/widget-config.json"
        position="bottom-right"
        theme={{
          primary: "#0066cc",
          secondary: "#ffffff",
          text: "#000000",
          surface: "#ffffff",
          border: "#e5e7eb"
        }}
        welcomeMessage="Hi! How can I help you today?"
      />
    </div>
  );
}

export default App;
