const http = require('http');

const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>Panas Dashboard</h1><p>Status: OK</p>');
});

const port = process.env.PORT ? Number(process.env.PORT) : 3001;
server.listen(port, () => {
  console.log(`Dashboard listening on http://localhost:${port}`);
});
