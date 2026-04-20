// main.tsx

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; 
import { AuthProvider } from './context/AuthContext'; 
import { PatientProvider } from './context/PatientContext'; 
import App from './App'; 

// Adicione esta linha para ignorar o erro de tipagem no CSS
// @ts-ignore
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PatientProvider>
          <App />
        </PatientProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);