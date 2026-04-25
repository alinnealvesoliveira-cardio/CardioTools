import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // 1. Importe o BrowserRouter
import App from './App';
import './index.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error("Elemento 'root' não encontrado no DOM.");
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter> {/* 2. Envolva o App aqui */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);