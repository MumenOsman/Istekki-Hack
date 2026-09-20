import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4'
};

const ROUTE_ALIASES = {
  '/': '/index.html',
  '/landing': '/index.html',
  '/hub': '/index.html',
  '/mother': '/mother.html',
  '/midwife': '/midwife.html',
  '/ed': '/ed.html'
};

// Security headers applied to all responses
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "frame-ancestors 'self'",
  'Permissions-Policy': 'camera=*, microphone=*, geolocation=*'
};

const server = http.createServer((req, res) => {
  // 1. Safe URL parsing with unhandled exception protection
  let pathname = '/';
  try {
    const host = req.headers.host || 'localhost';
    const parsedUrl = new URL(req.url, `http://${host}`);
    pathname = decodeURIComponent(parsedUrl.pathname);
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8', ...SECURITY_HEADERS });
    res.end('400 Bad Request');
    return;
  }

  // 2. Route Alias resolution
  if (ROUTE_ALIASES[pathname]) {
    pathname = ROUTE_ALIASES[pathname];
  }

  // 3. Strict Path Traversal Defense
  const safePath = path.resolve(__dirname, '.' + pathname);
  const isWithinDir = safePath === __dirname || safePath.startsWith(__dirname + path.sep);

  if (!isWithinDir) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8', ...SECURITY_HEADERS });
    res.end('403 Forbidden');
    return;
  }

  // 4. File existence and stat validation
  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', ...SECURITY_HEADERS });
      res.end(`404 Not Found: ${pathname}`);
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      ...SECURITY_HEADERS
    });
    fs.createReadStream(safePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running securely at http://localhost:${PORT}`);
  console.log(`- Landing Page: http://localhost:${PORT}/ (or /landing)`);
  console.log(`- Mother App:   http://localhost:${PORT}/mother (or /index.html, /mother.html)`);
  console.log(`- Midwife App:  http://localhost:${PORT}/midwife (or /midwife.html)`);
  console.log(`- ED Console:   http://localhost:${PORT}/ed (or /ed.html)`);
});
