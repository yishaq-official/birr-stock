# BirrStock IMS: Specific Functional Requirements Specification

This document outlines the detailed functional requirements for the **BirrStock** Enterprise Inventory Management System.

Each requirement follows standard enterprise RFC/ISO format:
* **Requirement ID:** Hierarchical identifier.
* **Priority:** `P0` (Must-Have for Launch), `P1` (Core Enterprise Requirement), `P2` (Advanced Optimization).
* **Statement:** Formal requirement description using RFC 2119 keywords (*MUST*, *SHOULD*, *MAY*).
* **Acceptance Criteria (AC):** Testable conditions for implementation completion.

---

## 1. Product Master Data & Catalog Management (FR-100)

### FR-101: Hierarchical Item Hierarchy
* **Priority:** P0
* **Statement:** The system MUST support a hierarchical item data structure consisting of **Base Product $\rightarrow$ Product Variant (SKU) $\rightarrow$ Barcodes (UPC/EAN/QR/Internal)**.
* **Acceptance Criteria:**
  1. A Base Product can have 1 to $N$ variants (e.g., Size, Color, Flavor).
  2. Each variant MUST have a globally unique SKU string.
  3. A single variant can be associated with multiple valid barcode strings (e.g., manufacturer UPC + internal warehouse barcode).
  4. Deletion of an active SKU with historic ledger entries MUST be prevented; soft-archive only.

### FR-102: Virtual Bundling and Bill of Materials (BOM)
* **Priority:** P0
* **Statement:** The system MUST support non-physical "Virtual Bundles" assembled on-the-fly without requiring pre-packaging.
* **Acceptance Criteria:**
  1. A bundle SKU can be mapped to $N$ child component SKUs with specified multipliers (e.g., Bundle-1 = 2 × SKU-A + 1 × SKU-B).
  2. The Available-to-Promise (ATP) of a virtual bundle MUST dynamically equal:
     $$\text{ATP}_{\text{bundle}} = \min_{i \in \text{components}} \left( \left\lfloor \frac{\text{ATP}_i}{\text{Multiplier}_i} \right\rfloor \right)$$
  3. When an order for a virtual bundle is allocated, the system MUST reserve the respective quantities of the component SKUs, not the virtual bundle SKU itself.

### FR-103: Dimensional & Packaging Profiles
* **Priority:** P1
* **Statement:** The system MUST store physical dimensions (Length, Width, Height) and weight (Gross, Net) for individual items, inner cartons, and master cases.
* **Acceptance Criteria:**
  1. Support unit conversions (metric vs imperial).
  2. Allow setting Unit of Measure (UoM) conversion factors (e.g., 1 Master Case = 24 Units).
  3. Packaging dimensions must be accessible by the order packing module to calculate dimensional weight (DIM weight) for carrier rate calculations.

---

## 2. Multi-Location Inventory & Transaction Ledger (FR-200)

### FR-201: Double-Entry Immutable Inventory Ledger
* **Priority:** P0
* **Statement:** The system MUST NOT overwrite a single numeric stock quantity field directly. All stock mutations MUST be recorded as an immutable append-only transaction ledger entry (`inventory_transactions`).
* **Acceptance Criteria:**
  1. Every stock change records: `transaction_id`, `sku`, `source_location_id`, `destination_location_id`, `delta_quantity`, `reason_code`, `reference_id` (PO#, SO#, RMA#), `created_by`, `timestamp`.
  2. Current on-hand quantity at a specific bin MUST be computable by summing all delta transactions for that location.
  3. Materialized snapshot tables (`inventory_balances`) MUST be maintained and updated atomically for fast indexing and querying ($O(1)$ lookup).

### FR-202: Warehouse Location Hierarchy
* **Priority:** P0
* **Statement:** The system MUST support a 6-level physical warehouse hierarchy: `Facility -> Zone -> Aisle -> Rack -> Shelf -> Bin`.
* **Acceptance Criteria:**
  1. Every pickable and storage location MUST have a human-readable barcode identifier (e.g., `B-01-04-A-2`).
  2. Locations MUST support flags: `is_pickable`, `is_dock`, `is_quarantine`, `is_damaged`, `temperature_controlled`.
  3. Prevent order allocation from bins flagged as non-pickable or quarantine.

### FR-203: Multi-State Inventory Buckets
* **Priority:** P0
* **Statement:** For any given SKU at any given facility, the system MUST segregate stock into distinct operational buckets.
* **Acceptance Criteria:**
  1. Supported buckets:
     * `ON_HAND`: Total physical units present inside the facility.
     * `ALLOCATED`: Units committed to active sales orders awaiting picking.
     * `PICKED_IN_TRANSIT`: Units picked from bins and located at packing stations.
     * `QUARANTINE_QC`: Units under inbound inspection or customer return evaluation.
     * `DAMAGED_WRITE_OFF`: Non-sellable units awaiting physical destruction or scrap disposal.
     * `AVAILABLE_TO_PROMISE (ATP)`: Calculated as $\text{ON\_HAND} - \text{ALLOCATED} - \text{QUARANTINE} - \text{DAMAGED} - \text{SAFETY\_BUFFER}$.

---

## 3. Inbound Logistics & Procurement (FR-300)

### FR-301: Purchase Order Lifecycle & Supplier Portal
* **Priority:** P0
* **Statement:** The system MUST manage the complete lifecycle of a Purchase Order: `DRAFT -> PENDING_APPROVAL -> ISSUED -> PARTIAL_RECEIVED -> FULLY_RECEIVED -> CLOSED`.
* **Acceptance Criteria:**
  1. Role-based approval required for POs exceeding a configurable dollar threshold (e.g., > \$10,000 requires Finance Manager approval).
  2. Track expected delivery date and automated vendor lead time calculation.
  3. Export PO to standard PDF and CSV formats for vendor delivery.

### FR-302: Dock Receiving & QC Workflow
* **Priority:** P0
* **Statement:** The system MUST provide an interactive barcode-driven receiving UI supporting both piece-by-piece and bulk counting.
* **Acceptance Criteria:**
  1. Scanning a SKU on an active PO automatically highlights the row and registers the count.
  2. Over-receiving tolerance: Configurable percentage (default: 0% over-receiving allowed unless approved by supervisor).
  3. Split receiving: Record partial receipts while keeping the PO open for remaining balances.
  4. Discrepancy report generated automatically upon receipt completion.

### FR-303: Landed Cost Calculation & Capitalization
* **Priority:** P1
* **Statement:** The system MUST allocate landed costs (freight, duties, customs, insurance) across received inventory lines.
* **Acceptance Criteria:**
  1. Support cost apportionment based on:
     * By Line Item Value (pro-rata by dollar value).
     * By Line Item Physical Weight (pro-rata by gross weight).
  2. Landed cost per unit MUST be stored against the specific batch/receipt to accurately reflect Cost of Goods Sold (COGS).

---

## 4. Outbound Order Fulfillment (FR-400)

### FR-401: Concurrency-Safe Order Allocation
* **Priority:** P0
* **Statement:** The order allocation engine MUST be concurrency-safe and prevent race conditions or negative available balances under high checkout traffic.
* **Acceptance Criteria:**
  1. System MUST utilize PostgreSQL `SELECT ... FOR UPDATE` or Redis Distributed Locks (`Redlock`) during stock allocation routines.
  2. Under simulated load of 500 concurrent checkout attempts for a SKU with 10 units in stock, exactly 10 allocations MUST succeed, and 490 MUST receive an out-of-stock notification without data corruption.

### FR-402: Wave & Batch Picking Path Optimization
* **Priority:** P1
* **Statement:** The system MUST group pending orders into pick waves and sort pick tasks by warehouse coordinate order to minimize associate travel time.
* **Acceptance Criteria:**
  1. Support wave creation filters: Single-item orders, expedited shipping orders, carrier cutoff times.
  2. Pick path generated must follow standard S-Shape routing through warehouse aisles.
  3. Mobile screen displays the next immediate bin, required quantity, and SKU photo.

### FR-403: Packing Station 100% Barcode Verification
* **Priority:** P0
* **Statement:** The packing station screen MUST NOT allow generating a carrier shipping label until every item in the order has been physically verified by barcode scan.
* **Acceptance Criteria:**
  1. Associate cannot manually check a box; hardware scan is mandatory.
  2. Attempting to scan an item not belonging to the active order emits an audible error tone and displays a prominent visual modal.
  3. Support multi-package split shipment for large orders (allocating specific SKUs to Box 1, Box 2, etc.).

### FR-404: Thermal Shipping Label Printing (Zero-Click)
* **Priority:** P0
* **Statement:** The system MUST interface directly with thermal label printers (Zebra, Rollo, Citizen) using ZPL/EPL raw commands or local print agent without native browser print previews.
* **Acceptance Criteria:**
  1. Label print latency from scan completion to physical print trigger MUST be under 1,200 ms.
  2. System stores carrier tracking number, label PDF/ZPL, and ship date against the order record.

---

## 5. Reverse Logistics & RMA (FR-500)

### FR-501: Return Merchandise Authorization (RMA) Processing
* **Priority:** P0
* **Statement:** The system MUST allow looking up orders by tracking number, order ID, customer email, or customer phone number to initiate an RMA.
* **Acceptance Criteria:**
  1. Display return window eligibility (e.g., within 30 days of delivery).
  2. Capture customer return reason code (Defective, Wrong Item, Changed Mind, Sizing).

### FR-502: 3-Tier Inspection Grading & Disposition
* **Priority:** P0
* **Statement:** The returns receiving screen MUST mandate selecting a quality grade before inventory is committed to stock.
* **Acceptance Criteria:**
  1. **Grade A:** Immediately moved to `AVAILABLE` stock at designated active pick bin.
  2. **Grade B:** Moved to `REFURBISHED / OUTLET` location; SKU marked with suffix or internal channel tag.
  3. **Grade C:** Moved to `DISPOSAL / SCRAP` location; write-off financial log created.
  4. Automatically trigger customer credit or refund event hook to the storefront upon Grade A/B confirmation.

---

## 6. Omnichannel Channel Synchronization (FR-600)

### FR-601: Real-time Stock Sync via Event-Driven Queues
* **Priority:** P0
* **Statement:** Any ledger transaction altering Available-to-Promise (ATP) stock MUST publish an event to sync stock levels across connected storefronts (Shopify, Amazon, custom store).
* **Acceptance Criteria:**
  1. System MUST use an asynchronous queue (BullMQ) to decouple stock transactions from external API network latency.
  2. System MUST implement **Debouncing / Rate-limiting**: Multiple stock changes within a 5-second window for the same SKU are coalesced into a single outbound API payload.
  3. Sync failures MUST automatically retry up to 5 times with exponential backoff before triggering an alert on the operations dashboard.

### FR-602: Channel Safety Buffers
* **Priority:** P1
* **Statement:** The system MUST allow configuring static and percentage-based safety buffers per sales channel.
* **Acceptance Criteria:**
  1. Example rule: If Amazon channel buffer = 5, and warehouse ATP = 12, the system sends quantity 7 to Amazon.
  2. When ATP $\le$ Buffer, system pushes 0 to the channel to prevent overselling while preserving reserve safety stock for direct channels.

---

## 7. Security, Auditing & Access Control (FR-700)

### FR-701: Role-Based Access Control (RBAC)
* **Priority:** P0
* **Statement:** System access MUST be gated by granular roles: `WAREHOUSE_OPERATOR`, `PACK_STATION`, `INVENTORY_CONTROLLER`, `PROCUREMENT`, `OPERATIONS_ADMIN`.
* **Acceptance Criteria:**
  1. WAREHOUSE_OPERATOR can only access mobile picking/receiving screens; cannot view financial landed costs or approve stock write-offs.
  2. PACK_STATION role is locked exclusively to the packing and label printing interfaces.
  3. Only INVENTORY_CONTROLLER and OPERATIONS_ADMIN can perform manual stock count overrides.

### FR-702: Immutable Audit Logging
* **Priority:** P0
* **Statement:** Every user-initiated action that creates, modifies, or deletes system entities MUST be logged in an append-only `system_audit_logs` table.
* **Acceptance Criteria:**
  1. Log entry includes: `actor_id`, `actor_email`, `action_type`, `entity_name`, `entity_id`, `previous_state` (JSON), `new_state` (JSON), `ip_address`, `user_agent`, `timestamp`.
  2. Audit logs cannot be deleted or edited via the application layer.

---

## 8. Reporting, Analytics & Reorder Intelligence (FR-800)

### FR-801: Automated ABC / FSN Inventory Classification
* **Priority:** P1
* **Statement:** The system MUST calculate automated inventory classifications based on 30/60/90-day trailing sales.
* **Acceptance Criteria:**
  1. **ABC Analysis (Revenue):**
     * Category A: Top 80% of revenue (~20% of SKUs).
     * Category B: Next 15% of revenue (~30% of SKUs).
     * Category C: Bottom 5% of revenue (~50% of SKUs).
  2. **FSN Analysis (Velocity):** Fast-moving, Slow-moving, Non-moving (Dead stock).
  3. Visual alerts for dead stock exceeding 90 days with zero sales velocity.

### FR-802: Automated Reorder Recommendations
* **Priority:** P1
* **Statement:** The system MUST calculate daily Reorder Points (ROP) and recommend PO generation.
* **Acceptance Criteria:**
  1. Formula implemented:
     $$\text{ROP} = (\text{Average Daily Consumption} \times \text{Supplier Lead Time}) + \text{Safety Stock}$$
  2. Provide a single-click "Generate Draft PO" button that aggregates all SKUs below ROP by supplier.
