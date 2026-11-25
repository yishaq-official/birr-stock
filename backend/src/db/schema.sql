-- BirrStock IMS Database Schema Initialization
-- PostgreSQL 16 compatible

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Identity & Role-Based Access Control (RBAC)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(64) NOT NULL,
    last_name VARCHAR(64) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'WAREHOUSE_OPERATOR',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Product Master Data & Multi-Barcode Registry
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    sku VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    weight_grams INT DEFAULT 0,
    length_mm INT DEFAULT 0,
    width_mm INT DEFAULT 0,
    height_mm INT DEFAULT 0,
    unit_cost_cents INT NOT NULL DEFAULT 0,
    is_bundle BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_barcodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    barcode VARCHAR(64) UNIQUE NOT NULL,
    barcode_type VARCHAR(20) DEFAULT 'UPC',
    is_primary BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS product_bundle_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bundle_variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    component_variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity_multiplier INT NOT NULL DEFAULT 1,
    CONSTRAINT chk_qty_pos CHECK (quantity_multiplier > 0)
);

-- 3. Warehouse Locations & Bins
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(16) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    address JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS warehouse_bins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    zone VARCHAR(16) NOT NULL,
    aisle VARCHAR(16) NOT NULL,
    rack VARCHAR(16) NOT NULL,
    shelf VARCHAR(16) NOT NULL,
    bin_code VARCHAR(32) UNIQUE NOT NULL,
    is_pickable BOOLEAN DEFAULT TRUE,
    is_dock BOOLEAN DEFAULT FALSE,
    is_quarantine BOOLEAN DEFAULT FALSE,
    pick_priority INT DEFAULT 100
);

-- 4. Immutable Inventory Ledger & Materialized Balances
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID NOT NULL REFERENCES product_variants(id),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    source_bin_id UUID REFERENCES warehouse_bins(id),
    destination_bin_id UUID REFERENCES warehouse_bins(id),
    delta_quantity INT NOT NULL,
    reason_code VARCHAR(64) NOT NULL,
    reference_type VARCHAR(32),
    reference_id VARCHAR(64),
    performed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID NOT NULL REFERENCES product_variants(id),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    bin_id UUID NOT NULL REFERENCES warehouse_bins(id),
    quantity_on_hand INT NOT NULL DEFAULT 0,
    quantity_reserved INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_variant_bin UNIQUE(variant_id, bin_id),
    CONSTRAINT chk_balances_non_neg CHECK (quantity_on_hand >= 0 AND quantity_reserved >= 0)
);

-- 5. Sales Orders & Allocations
CREATE TABLE IF NOT EXISTS sales_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_order_id VARCHAR(128) NOT NULL,
    channel_name VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING_ALLOCATION',
    shipping_address JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES product_variants(id),
    quantity_ordered INT NOT NULL,
    unit_price_cents INT NOT NULL
);

CREATE TABLE IF NOT EXISTS order_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES sales_orders(id),
    variant_id UUID NOT NULL REFERENCES product_variants(id),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    allocated_quantity INT NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Audit Trail
CREATE TABLE IF NOT EXISTS system_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES users(id),
    action VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    diff_json JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_barcodes_lookup ON product_barcodes(barcode);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_ledger_variant ON inventory_transactions(variant_id, warehouse_id);
CREATE INDEX IF NOT EXISTS idx_balances_lookup ON inventory_balances(variant_id, warehouse_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON sales_orders(status);
