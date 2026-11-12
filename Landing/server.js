'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const ROOT = __dirname;
const args = process.argv.slice(2);
const argPort = args.includes('--port') ? args[args.indexOf('--port') + 1] : undefined;
const PORT = Number(argPort || process.env.PORT || 8002);
const LAN = args.includes('--lan');
const HOST = LAN ? '0.0.0.0' : '127.0.0.1';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.txt': 'text/plain; charset=utf-8',
};

// Files that live in the folder but must never be served to the browser
const HIDDEN = new Set(['server.js', 'package.json', 'package-lock.json']);

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    return send(res, 400, 'Bad request');
  }
  if (pathname.endsWith('/')) pathname += 'index.html';

  const file = path.join(ROOT, pathname);
  const rel = path.relative(ROOT, file);
  const blocked =
    rel.startsWith('..') || path.isAbsolute(rel) ||
    rel.split(path.sep).some((part) => part.startsWith('.') || part === 'node_modules') ||
    HIDDEN.has(rel);
  if (blocked) return send(res, 404, 'Not found');

  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) return send(res, 404, 'Not found');
    const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': stat.size, 'Cache-Control': 'no-store' });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try another: node server.js --port ${PORT + 1}`);
  } else if (err.code === 'EACCES') {
    console.error(`Port ${PORT} needs admin rights. Use a port above 1024, for example: node server.js --port 8002`);
  } else {
    console.error(err.message);
  }
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log('\n  ExamGoEasy is running\n');
  console.log(`  Local:    http://localhost:${PORT}`);
  if (LAN) {
    Object.values(os.networkInterfaces()).flat()
      .filter((i) => i && i.family === 'IPv4' && !i.internal)
      .forEach((i) => console.log(`  Network:  http://${i.address}:${PORT}   (open this on your phone, same Wi-Fi)`));
  }
  console.log('\n  Press Ctrl+C to stop.\n');
});
