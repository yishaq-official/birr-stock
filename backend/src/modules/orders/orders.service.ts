export interface OrderAllocationRequest {
  orderId: string;
  items: { sku: string; quantity: number }[];
  warehouseId: string;
}

export interface OrderAllocationResult {
  orderId: string;
  success: boolean;
  allocatedItems: { sku: string; quantity: number }[];
  reason?: string;
}

export class OrdersService {
  /**
   * Validates if all requested items are eligible for atomic allocation.
   */
  validateAllocationEligibility(items: { sku: string; quantity: number }[]): boolean {
    if (!items || items.length === 0) return false;
    return items.every(item => item.quantity > 0 && typeof item.sku === 'string' && item.sku.trim().length > 0);
  }
}
