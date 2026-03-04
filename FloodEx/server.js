/**
 * FloodEx LLC - Static File Server
 * Run with: node server.js
 * Then open: http://localhost:3000
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT    = 3000;
const WEBROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
};

const server = http.createServer((req, res) => {
  // Sanitize URL — strip query strings and decode
  let urlPath = decodeURIComponent(req.url.split('?')[0]);

  // Default to index.html
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(WEBROOT, urlPath);

  // Security: ensure the resolved path stays inside WEBROOT
  if (!filePath.startsWith(WEBROOT)) {
    res.writeHead(403);
    res.end('403 Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h2>404 — Page Not Found</h2><p><a href="/">Go Home</a></p>');
      } else {
        res.writeHead(500);
        res.end('500 Internal Server Error');
      }
      return;
    }

    const ext      = path.extname(filePath).toLowerCase();
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);

    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${urlPath}`);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();

  console.log('\n========================================');
  console.log('  FloodEx LLC — Server Running');
  console.log('========================================');
  console.log(`  Local:    http://localhost:${PORT}`);

  // Print LAN IP addresses
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`  Network:  http://${net.address}:${PORT}`);
      }
    }
  }

  console.log('========================================');
  console.log('  Press Ctrl+C to stop the server\n');
});
