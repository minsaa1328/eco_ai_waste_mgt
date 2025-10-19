import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './App';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';
import process from "prop-types/prop-types.js";

// Read publishable key from environment
const PUBLISHABLE_KEY =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) ||
  (typeof process !== 'undefined' &&
    process.env &&
    process.env.REACT_APP_CLERK_PUBLISHABLE_KEY);

if (!PUBLISHABLE_KEY) {
  console.warn(
    'Missing Clerk publishable key. Set VITE_CLERK_PUBLISHABLE_KEY in .env or REACT_APP_CLERK_PUBLISHABLE_KEY.'
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));

// ✅ Correct: only one render, providers properly nested
root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY || ''}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
);
