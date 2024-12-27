import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { Connect, ServerOptions } from 'vite';
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Base configuration
  const config: {
    server: ServerOptions;
    plugins: any[];
    resolve: {
      alias: {
        [key: string]: string;
      };
    };
  } = {
    server: {
      host: "::",
      port: 8080,
      // Add middleware to handle SPA routing
      middlewareMode: false,
      proxy: undefined,
      fs: {
        strict: true
      },
      preTransformRequests: true
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
  };

  // Add HTTPS configuration only in development mode
  if (mode === 'development') {
    try {
      config.server.https = {
        key: fs.readFileSync('./.certificates/key.pem'),
        cert: fs.readFileSync('./.certificates/cert.pem'),
      };
    } catch (error) {
      console.warn('SSL certificates not found, running without HTTPS');
    }
  }

  return config;
});