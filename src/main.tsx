import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Context Providers
import { PatientProvider } from './context/PatientProvider';

const container = document.getElementById('root');

if (!container) {
  throw new Error("Elemento 'root' não encontrado no DOM.");
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <PatientProvider>
      <App />
    </PatientProvider>
  </React.StrictMode>
);