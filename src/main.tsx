import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { UIProvider } from './state/UIProvider';
import { SessionProvider } from './state/SessionProvider';
import { App } from './App';
import './styles/global.css';

// Register service worker for PWA caching and push notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { type: 'module' }).catch(err => {
      console.warn('SW registration failed:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UIProvider>
      <SessionProvider>
        <App />
      </SessionProvider>
    </UIProvider>
  </StrictMode>
);
