'use strict';
const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const projectRoot = path.resolve(__dirname, '..');
const types = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json'};

function createServer({root = projectRoot, prefix = '/'} = {}) {
  root = fs.realpathSync(root);
  if (!prefix.startsWith('/') || !prefix.endsWith('/')) throw new Error('Prefix must start and end with /');
  return http.createServer((req, res) => {
    let file;
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (!pathname.startsWith(prefix)) {res.writeHead(404); return res.end('Not found');}
      file = path.resolve(root, pathname.slice(prefix.length) || 'index.html');
      if (!file.startsWith(root + path.sep)) {res.writeHead(403); return res.end();}
    } catch {res.writeHead(400); return res.end();}
    fs.realpath(file, (error, resolved) => {
      if (error) {res.writeHead(404); return res.end('Not found');}
      if (!resolved.startsWith(root + path.sep)) {res.writeHead(403); return res.end();}
      fs.readFile(resolved, (error, data) => {
        if (error) {res.writeHead(404); return res.end('Not found');}
        res.setHeader('Content-Type', types[path.extname(resolved)] || 'application/octet-stream');
        res.setHeader('Cache-Control', 'no-store');
        res.end(data);
      });
    });
  });
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const prefixIndex = args.indexOf('--prefix');
  const prefix = prefixIndex < 0 ? '/' : args[prefixIndex + 1];
  createServer({root: args.includes('--site') ? path.join(projectRoot, '_site') : projectRoot, prefix})
    .listen(8765, '127.0.0.1', () => console.log('http://127.0.0.1:8765' + prefix));
}
module.exports = {createServer};
