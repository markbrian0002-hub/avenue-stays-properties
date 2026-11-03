import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
// @ts-ignore CSS imports are handled by the bundler, not TypeScript.
import './index.css'; // Crucial: Loads Tailwind CSS styles

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);