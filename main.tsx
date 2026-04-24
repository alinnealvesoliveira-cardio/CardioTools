import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error("Elemento 'root' não encontrado no DOM.");
}

const root = createRoot(container);

// Mantemos o StrictMode, mas removemos os provedores redundantes
// pois eles já estão configurados dentro do seu App.tsx
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);