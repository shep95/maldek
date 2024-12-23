import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { Connect } from 'vite';
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    https: {
      key: fs.readFileSync('./.certificates/key.pem'),
      cert: fs.readFileSync('./.certificates/cert.pem'),
    },
    // Add middleware to handle SPA routing
    middlewares: [
      ((req: Connect.IncomingMessage, res: any, next: Connect.NextFunction) => {
        // Check if the request is for a static file
        if (!req.url?.includes('.') && !req.url?.startsWith('/api')) {
          req.url = '/';
        }
        next();
      }) as Connect.NextHandleFunction,
    ],
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));