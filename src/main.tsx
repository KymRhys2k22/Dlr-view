import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

// Auto-recover from stale deployment chunks or cache mismatches
window.addEventListener('error', (event) => {
  const msg = (event.message || '').toLowerCase();
  if (
    msg.includes('loading chunk') ||
    msg.includes('mime type') ||
    msg.includes('failed to fetch dynamically imported module')
  ) {
    const hasReloaded = sessionStorage.getItem('dlr_chunk_reloaded');
    if (!hasReloaded) {
      sessionStorage.setItem('dlr_chunk_reloaded', 'true');
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          for (const reg of regs) reg.unregister();
        });
      }
      window.location.reload();
    }
  }
});

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}
