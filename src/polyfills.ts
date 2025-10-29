/**
 * Browser polyfills for Node.js modules required by Solana/Anchor
 */

import { Buffer } from 'buffer';

// Make Buffer available globally
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  (window as any).global = window;
  
  // Polyfill process
  if (!(window as any).process) {
    (window as any).process = {
      env: {},
      version: '',
      browser: true,
      nextTick: (fn: Function, ...args: any[]) => {
        setTimeout(() => fn(...args), 0);
      },
    };
  }
}

export {};

