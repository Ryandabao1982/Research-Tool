import './mocks'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './app/App'
import './index.css'

// Initialize accessibility settings on app load
const initializeAccessibility = () => {
  // Check for saved accessibility preferences
  try {
    const savedSettings = localStorage.getItem('kb-settings-storage');
    if (savedSettings) {
      const { state } = JSON.parse(savedSettings);
      
      // Apply high contrast mode
      if (state?.highContrastMode) {
        document.body.classList.add('high-contrast');
      }
      
      // Apply reduced motion
      if (state?.reducedMotion) {
        document.body.classList.add('reduced-motion');
      }
    }
  } catch (error) {
    console.warn('Could not initialize accessibility settings:', error);
  }
};

// Run initialization before rendering
initializeAccessibility();

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
