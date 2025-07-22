// Keep-alive server - useful for cloud hosting and localhost testing
const http = require('http');

function keepAlive() {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'alive',
      bot: 'Rosebud X Bot',
      timestamp: new Date().toISOString(),
      message: '🤖 Bot is running and checking for mentions!',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    }));
  });

  // Try different ports if the default is busy
  const preferredPort = process.env.PORT || 3000;
  const maxRetries = 5;
  
  function tryListen(port, retries = 0) {
    server.listen(port, () => {
      console.log(`🌐 Keep-alive server running on port ${port}`);
      if (process.env.NODE_ENV === 'production') {
        console.log(`📡 Visit your app URL to see bot status`);
      } else {
        console.log(`📡 Visit http://localhost:${port} to see bot status`);
      }
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE' && retries < maxRetries) {
        console.log(`⚠️ Port ${port} is busy, trying ${port + 1}...`);
        server.close();
        tryListen(port + 1, retries + 1);
      } else if (err.code === 'EADDRINUSE') {
        console.log(`❌ Could not find an available port after ${maxRetries} attempts`);
        console.log(`💡 Try stopping other applications or use a different PORT in .env`);
      } else {
        console.error('❌ Server error:', err.message);
      }
    });
  }

  tryListen(preferredPort);
  return server;
}

module.exports = keepAlive; 