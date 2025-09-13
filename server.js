const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const next = require('next');
const express = require('express');

// Import express-sslify for HTTPS redirection
const expressSSLify = require('express-sslify');

// Force HTTP for local development
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, conf: { poweredByHeader: false } });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  
  // Only enforce HTTPS in production and not on Vercel or Render
  // Vercel and Render handle HTTPS automatically, so we skip it there
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL && !process.env.RENDER) {
    server.use(expressSSLify.HTTPS({ trustProtoHeader: true }));
  }

  // Handle all Next.js routes
  server.all('*', (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Check if we're running on Render (production environment without local certs)
  const isRender = process.env.RENDER === 'true' || process.env.NODE_ENV === 'production';
  
  // Use the PORT environment variable provided by Render, or default to 3000
  const port = process.env.PORT || 3000;
  
  // For Render or other production environments, use HTTP
  if (isRender) {
    // Initialize Socket.IO with HTTP server for Render
    const httpServer = http.createServer(server);
    const { initSocketIO } = require('./src/lib/socketService');
    initSocketIO(httpServer);
    
    // Listen on the specified port
    httpServer.listen(port, (err) => {
      if (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
      } else {
        console.log(`> Ready on http://localhost:${port}`);
      }
    });
    
    // Handle the error event separately
    httpServer.on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });
  } else {
    // For local development, use HTTPS with local certificates
    try {
      const httpsOptions = {
        key: fs.readFileSync(path.join(__dirname, 'cert', 'server.key')),
        cert: fs.readFileSync(path.join(__dirname, 'cert', 'server.cert'))
      };
      
      const httpsServer = https.createServer(httpsOptions, server);
      
      // Initialize Socket.IO
      const { initSocketIO } = require('./src/lib/socketService');
      initSocketIO(httpsServer);
      
      httpsServer.listen(port, (err) => {
        if (err) {
          console.error('Failed to start server:', err);
          process.exit(1);
        } else {
          console.log(`> Ready on https://localhost:${port}`);
        }
      });
      
      // Handle the error event separately
      httpsServer.on('error', (err) => {
        console.error('Server error:', err);
        process.exit(1);
      });
    } catch (error) {
      console.error('Failed to load SSL certificates for HTTPS. Falling back to HTTP.');
      console.error('Error:', error.message);
      
      // Initialize Socket.IO with HTTP server as fallback
      const httpServer = http.createServer(server);
      const { initSocketIO } = require('./src/lib/socketService');
      initSocketIO(httpServer);
      
      httpServer.listen(port, (err) => {
        if (err) {
          console.error('Failed to start server:', err);
          process.exit(1);
        } else {
          console.log(`> Ready on http://localhost:${port} (fallback due to missing SSL certificates)`);
        }
      });
      
      // Handle the error event separately
      httpServer.on('error', (err) => {
        console.error('Server error:', err);
        process.exit(1);
      });
    }
  }
})