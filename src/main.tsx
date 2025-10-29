// Polyfills must be imported first
import './polyfills';

import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/scrollbar.css';

createRoot(document.getElementById('root')!).render(
  <App />
);
