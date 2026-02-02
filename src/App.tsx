import { ChatWidget } from './components/ChatWidget';
import './App.css';

function App() {
  const configUrl = import.meta.env.VITE_WIDGET_CONFIG_URL || '/widget-config.json';

  return (
    <div className="App">
      <ChatWidget 
        configUrl={configUrl}
      />
    </div>
  );
}

export default App;
