import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import App from './App';
import { Helmet, HelmetProvider } from "react-helmet-async";

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>   
  <AuthProvider>      
    <BrowserRouter>  
      <HelmetProvider>  
        <App />         
      </HelmetProvider>
    </BrowserRouter>
  </AuthProvider>
// </React.StrictMode>

);