import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'

// Set global base URL for all API requests to the backend
// In local dev, it uses relative proxy, in production it uses VITE_API_URL
let apiUrl = import.meta.env.VITE_API_URL || '';
if (apiUrl.endsWith('/api')) apiUrl = apiUrl.slice(0, -4);
if (apiUrl.endsWith('/api/')) apiUrl = apiUrl.slice(0, -5);
if (apiUrl.endsWith('/')) apiUrl = apiUrl.slice(0, -1);
axios.defaults.baseURL = apiUrl;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
