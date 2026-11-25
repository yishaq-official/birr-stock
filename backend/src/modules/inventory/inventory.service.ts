export interface InventoryItemStock {
  sku: string;
  variantId: string;
  onHand: number;
  reserved: number;
  availableToPromise: number;
  warehouseId: string;
}

export class InventoryService {
  /**
   * Calculates Available-To-Promise (ATP) based on on-hand, reserved, and safety buffer.
   */
  calculateATP(onHand: number, reserved: number, safetyBuffer = 0): number {
    const rawAtp = onHand - reserved - safetyBuffer;
    return Math.max(0, rawAtp);
  }

  /**
   * Calculates Virtual Bundle ATP from its component stock levels.
   * Formula: Min(Floor(Component_ATP / Multiplier))
   */
  calculateBundleATP(components: { componentSku: string; atp: number; multiplier: number }[]): number {
    if (!components.length) return 0;
    const possibleBundles = components.map(c => Math.floor(c.atp / c.multiplier));
    return Math.min(...possibleBundles);
  }
}
