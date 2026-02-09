import { useState } from 'react';
import { ChatWidget } from './components/ChatWidget';
import './App.css';

function App() {
  const configUrl = import.meta.env.VITE_WIDGET_CONFIG_URL || '/widget-config.json';
  const [bgType, setBgType] = useState<'animated' | 'white' | 'dark'>('animated');

  return (
    <div className={`App bg-${bgType}`}>
      <select 
        className="bg-selector"
        value={bgType}
        onChange={(e) => setBgType(e.target.value as any)}
      >
        <option value="animated">Animated Gradient</option>
        <option value="white">White Background</option>
        <option value="dark">Dark Background</option>
      </select>

      <ChatWidget 
        configUrl={configUrl}
      />
    </div>
  );
}

export default App;
