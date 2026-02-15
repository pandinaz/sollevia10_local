import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Application crashed:", error);
  rootElement.innerHTML = `<div style="padding: 20px; color: red;"><h2>Application Error</h2><pre>${error instanceof Error ? error.message : String(error)}</pre></div>`;
}