import '../styles/fonts.css';
import '../styles/index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Terminal } from './Terminal';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <main className="h-screen">
    <Terminal />
  </main>
);
