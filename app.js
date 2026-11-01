
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Home route
app.get('/', (request, response) => {
    response.status(200).send('Welcome to my Express Server!');
});

// 2. About route
app.get('/about', (request, response) => {
    response.status(200).json({
        name: 'Mokeda Shivaram',
        section: 'AIDE 313'
    });
});

// 3. Time route
app.get('/time', (request, response) => {
    response.status(200).send(new Date().toString());
});

// 4. Explicit 404 route for the requested endpoint
app.get('/unknown', (request, response) => {
    response.status(404).send('404 - Page Not Found');
});

// 5. Catch-all fallback for any other unknown route
app.use((request, response) => {
    response.status(404).send('404 - Page Not Found');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Express server running at http://localhost:${PORT}`);
});
