import http from 'node:http';
import { config } from './config/index.ts';
import { HealthController } from './modules/health/health.controller.ts';
import { InventoryService } from './modules/inventory/inventory.service.ts';
import { OrdersService } from './modules/orders/orders.service.ts';

const healthController = new HealthController();
const inventoryService = new InventoryService();
const ordersService = new OrdersService();

export const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', config.corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // JSON Content-Type
  res.setHeader('Content-Type', 'application/json');

  // Router
  if (req.method === 'GET' && (pathname === '/health' || pathname === '/api/v1/health')) {
    const health = healthController.getHealth();
    res.writeHead(200);
    res.end(JSON.stringify(health, null, 2));
    return;
  }

  if (req.method === 'GET' && pathname === '/api/v1/system/info') {
    res.writeHead(200);
    res.end(JSON.stringify({
      name: 'BirrStock IMS API',
      version: '0.1.0',
      nodeVersion: process.version,
      modules: ['catalog', 'inventory', 'orders', 'receiving', 'rma', 'sync'],
      uptime: process.uptime(),
    }, null, 2));
    return;
  }

  // Fallback 404
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'NotFound', message: `Route ${req.method} ${pathname} not found` }));
});

// Run standalone when started directly
if (process.env.NODE_ENV !== 'test') {
  server.listen(config.port, () => {
    console.log(`[BirrStock Backend] Server listening on http://localhost:${config.port}`);
    console.log(`[BirrStock Backend] Healthcheck at http://localhost:${config.port}/health`);
  });
}
