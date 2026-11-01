
const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((request, response) => {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

    if (url.pathname === '/') {
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.end('Welcome to my Express Server!');
        return;
    }

    if (url.pathname === '/about') {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({
            name: 'Mokeda Shivaram',
            section: 'AIDE 313'
        }));
        return;
    }

    if (url.pathname === '/time') {
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.end(new Date().toString());
        return;
    }

    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.end('404 - Page Not Found');
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
