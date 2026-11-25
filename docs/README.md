# BirrStock: Enterprise E-commerce Inventory Management System (IMS)
## System Documentation & Specification

Welcome to the technical and business specification documentation for **BirrStock**, an internal enterprise-grade Inventory Management System (IMS) tailored for multi-channel e-commerce operations.

---

## 1. System Vision & Objectives

BirrStock serves as the centralized single source of truth for stock, order routing, warehouse operations, procurement, and reverse logistics across all internal e-commerce brand storefronts and sales channels.

### Core Business Objectives
1. **Zero Overselling (100% Stock Accuracy):** Eliminate out-of-stock cancellations via atomic inventory reservation and distributed lock mechanisms across all sales channels (Shopify, Amazon, custom storefronts).
2. **Sub-2-Hour Fulfillment Cycle Time:** Streamline warehouse floor operations with wave/batch picking, touchless hardware barcode scanning, and direct thermal label generation at packing stations.
3. **Turnkey Reverse Logistics (RMA):** Minimize the time returned goods spend in receiving by instituting a standardized 3-tier inspection and grading workflow (Restock, Refurbish/Discount, Scrap).
4. **Audit-Proof Accounting:** Transition from volatile quantity overwrites to an immutable double-entry style **Inventory Transaction Ledger** for financial and operational auditing.

---

## 2. Documentation Index

The specification is divided into the following documents:

| Document | Description | Key Topics |
|---|---|---|
| **[Use Cases](./use-cases.md)** | End-to-end actor-driven functional workflows. | Inbound receiving, guided putaway, wave picking, packing verification, returns grading, cycle counting. |
| **[Functional Requirements](./functional-requirements.md)** | Detailed, testable system requirements with Acceptance Criteria. | Item master, inventory ledger, order allocation, fulfillment, RMA, channel sync, RBAC. |
| **[Architecture & Data Models](./system-architecture-spec.md)** | Technical design, schema models, state machines, and hardware integration. | PostgreSQL schema, Redis lock strategy, BullMQ workers, Zebra thermal printing, Next.js PWA. |
| **[Implementation Plan](./implementation-plan.md)** | 10-phase micro-task implementation roadmap. | Granular tasks, verification criteria, timeline, and sprint-by-sprint status tracking. |

---

## 3. System Actors & Personas

| Actor | Role / Department | Primary Responsibilities |
|---|---|---|
| **Warehouse Associate** | Operations / Floor | Inbound dock receiving, bin putaway, wave/batch item picking, physical cycle counting via handheld scanners. |
| **Pack Station Specialist** | Operations / Packing | Barcode scanning verification, cartonization, thermal shipping label printing, scale integration. |
| **Inventory Controller** | Operations / Finance | Stock reconciliation, threshold configuration, write-off approvals, ABC inventory analysis. |
| **Procurement Specialist** | Purchasing / Supply Chain | Vendor management, Purchase Order (PO) creation, landed cost allocation, supplier lead time tracking. |
| **E-commerce Ops Manager** | Commercial / Merchandising | Channel buffer configuration, safety stock policies, virtual bundle (BOM) creation, order routing overrides. |
| **System Administrator** | IT / Engineering | RBAC role definitions, API keys, webhook health monitoring, background queue performance. |

---

## 4. Key Terminology & Domain Concepts

* **SKU (Stock Keeping Unit):** Unique internal identifier for each distinct product variant.
* **On-Hand (OH):** Total physical inventory present inside warehouse facilities.
* **Allocated / Reserved:** Stock committed to existing unfulfilled sales orders.
* **Available-to-Promise (ATP):** Formula: $\text{ATP} = \text{On-Hand} - \text{Reserved} - \text{Safety Buffer} + \text{In-Transit (PO)}$.
* **Bin Location:** Hierarchical coordinate within a warehouse (e.g., `WH1-Z02-A04-R03-S02-B01` = Warehouse 1, Zone 2, Aisle 4, Rack 3, Shelf 2, Bin 1).
* **Keyboard-Wedge Scanner:** A barcode scanner that communicates as a standard HID keyboard, feeding barcode data directly into active DOM listeners.
* **Landed Cost:** Total cost of stock including purchase price, freight/shipping, customs, duties, insurance, and handling fees.
