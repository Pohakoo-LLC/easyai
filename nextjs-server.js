const next = require('next');
const http = require('http');

const port = 3000;
const app = next({ dev: false });  // Ensure we're in production mode
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http.createServer((req, res) => {
    handle(req, res);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Next.js server ready on http://localhost:${port}`);
  });
});
