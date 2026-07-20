const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5173;
const ROOT = path.resolve(__dirname, '..');

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];
  let filePath = path.join(ROOT, reqUrl === '/' ? 'demo.html' : reqUrl);
  
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(ROOT, 'demo.html');
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Não Encontrado');
      } else {
        let ext = path.extname(filePath).toLowerCase();
        let contentType = 'text/html; charset=utf-8';
        if (ext === '.css') contentType = 'text/css; charset=utf-8';
        if (ext === '.js') contentType = 'application/javascript; charset=utf-8';
        if (ext === '.json') contentType = 'application/json; charset=utf-8';
        if (ext === '.png') contentType = 'image/png';
        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Servidor local da TOSB executando em http://localhost:${PORT}`);
});
