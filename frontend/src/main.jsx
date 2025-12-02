import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';
import './styles/theme.css';
import './pages/styles/Assessment.css';
import './pages/styles/Upgrade.css';

import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'; // <--- IMPORTED HERE

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider> {/* <--- WRAPPED APP HERE */}
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)