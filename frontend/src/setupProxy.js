const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // HTTP proxy
  app.use(
    '/posts',
    createProxyMiddleware({ target: 'http://localhost:5000', changeOrigin: true })
  );
  // WebSocket proxy
  app.use(
    '/ws',
    createProxyMiddleware({
      target: 'ws://localhost:5000',
      changeOrigin: true,
      ws: true
    })
  );
}
