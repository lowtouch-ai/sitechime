import { ChatWidget } from './components/ChatWidget';
import './App.css';

function App() {
  const configUrl = import.meta.env.VITE_WIDGET_CONFIG_URL || '/widget-config.json';

  return (
    <div className="App">
      <ChatWidget 
        apiKey="8b4222cf-ba57-4543-9f7c-bc8134fb45d8"
        configUrl={configUrl}
        position="bottom-right"
        theme={{
          primary: "#0ea5e9",
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
