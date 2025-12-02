import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';
import './styles/theme.css';
import './pages/styles/Assessment.css';
import './pages/styles/Upgrade.css';

import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)