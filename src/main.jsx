import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx';
import { ProjectProvider } from './context/ProjectContext.jsx';

// Restore accent color + dark mode preference BEFORE React renders (avoids flash)
const savedColor = localStorage.getItem('flowspace_color');
if (savedColor) {
  document.documentElement.style.setProperty('--primary', savedColor);
  const r = parseInt(savedColor.slice(1, 3), 16);
  const g = parseInt(savedColor.slice(3, 5), 16);
  const b = parseInt(savedColor.slice(5, 7), 16);
  document.documentElement.style.setProperty('--primary-glow', `rgba(${r},${g},${b},0.4)`);
}
if (localStorage.getItem('flowspace_darkmode') === 'false') {
  document.body.classList.add('light-mode');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProjectProvider>
          <App />
        </ProjectProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
