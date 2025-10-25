import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from '@/App.jsx'



if (!localStorage.getItem('access_token')) {
    localStorage.setItem('access_token', 'mock_jwt_token_development');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
