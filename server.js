const https = require('https');
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
  
  // Only enforce HTTPS in production and not on Vercel
  // Vercel handles HTTPS automatically, so we skip it there
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    server.use(expressSSLify.HTTPS({ trustProtoHeader: true }));
  }

  // Handle all Next.js routes
  server.all('*', (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // HTTPS configuration
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'cert', 'server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'cert', 'server.cert'))
  };

  // Function to check if port is in use and kill the process if needed
  const checkAndKillPort = (port) => {
    return new Promise((resolve) => {
      if (process.platform === 'win32') {
        // Windows command to find and kill process on port
        require('child_process').exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
          if (stdout) {
            const lines = stdout.split('\n');
            for (let line of lines) {
              const parts = line.trim().split(/\s+/);
              if (parts.length >= 5 && parts[1] === `TCP` && parts[3] === `LISTENING`) {
                const pid = parts[4];
                console.log(`Killing process ${pid} on port ${port}`);
                require('child_process').exec(`taskkill /PID ${pid} /F`, (killError) => {
                  if (killError) {
                    console.log(`Failed to kill process ${pid}:`, killError.message);
                  }
                });
              }
            }
          }
          // Give some time for the process to be killed
          setTimeout(() => resolve(), 1000);
        });
      } else {
        // Unix/Linux/Mac command to find and kill process on port
        require('child_process').exec(`lsof -ti:${port} | xargs kill -9`, () => {
          setTimeout(() => resolve(), 1000);
        });
      }
    });
  };

  // Start server on port 3000 with HTTPS
  const port = 3000;
  
  checkAndKillPort(port).then(() => {
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
  });
})