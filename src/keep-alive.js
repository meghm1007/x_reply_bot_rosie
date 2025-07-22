// Keep-alive server for Replit
// This prevents Replit from sleeping your bot
const http = require('http');

function keepAlive() {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'alive',
      bot: 'Rosebud X Bot',
      timestamp: new Date().toISOString(),
      message: '🤖 Bot is running and checking for mentions!'
    }));
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`🌐 Keep-alive server running on port ${port}`);
    console.log(`📡 Visit your repl URL to see bot status`);
  });

  return server;
}

module.exports = keepAlive; 