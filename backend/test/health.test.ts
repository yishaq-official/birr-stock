import test from 'node:test';
import assert from 'node:assert/strict';
import { HealthController } from '../src/modules/health/health.controller.ts';
import { InventoryService } from '../src/modules/inventory/inventory.service.ts';
import { OrdersService } from '../src/modules/orders/orders.service.ts';

test('HealthController returns ok status and masked URLs', () => {
  const controller = new HealthController();
  const health = controller.getHealth();

  assert.strictEqual(health.status, 'ok');
  assert.strictEqual(health.version, '0.1.0');
  assert.strictEqual(health.services.database.status, 'healthy');
  assert.match(health.services.database.url, /:\*\*\*\*@/);
});

test('InventoryService calculates Available-To-Promise (ATP) correctly', () => {
  const service = new InventoryService();
  
  // Normal calculation: 10 onHand - 3 reserved - 2 safetyBuffer = 5 ATP
  assert.strictEqual(service.calculateATP(10, 3, 2), 5);

  // Non-negative clamp test: 5 onHand - 8 reserved = 0 ATP (not -3)
  assert.strictEqual(service.calculateATP(5, 8, 0), 0);
});

test('InventoryService calculates Virtual Bundle ATP from components', () => {
  const service = new InventoryService();

  // Bundle needs 2x Component A and 1x Component B
  // If A has 10 units (5 bundles) and B has 3 units (3 bundles) -> result is 3
  const components = [
    { componentSku: 'SKU-A', atp: 10, multiplier: 2 },
    { componentSku: 'SKU-B', atp: 3, multiplier: 1 },
  ];
  assert.strictEqual(service.calculateBundleATP(components), 3);
});

test('OrdersService validates allocation payloads', () => {
  const service = new OrdersService();

  assert.strictEqual(service.validateAllocationEligibility([{ sku: 'SKU-1', quantity: 2 }]), true);
  assert.strictEqual(service.validateAllocationEligibility([{ sku: 'SKU-1', quantity: 0 }]), false);
  assert.strictEqual(service.validateAllocationEligibility([]), false);
});
