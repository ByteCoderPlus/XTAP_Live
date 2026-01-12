-- Create accounts table FIRST (before join table)
-- This script creates the accounts table with all required columns
-- IMPORTANT: Run this script BEFORE starting the application to avoid Hibernate ordering issues

-- Drop the join table if it exists (to recreate with proper foreign keys)
DROP TABLE IF EXISTS resource_soft_blocked_accounts;

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL
);

-- Create index on account name (after table creation)
CREATE INDEX IF NOT EXISTS idx_account_name ON accounts(name);

-- Create the join table for many-to-many relationship between resources and accounts
-- Note: This assumes the 'resources' table already exists
-- This table now includes blocked_until date and uses id as primary key
DROP TABLE IF EXISTS resource_soft_blocked_accounts;

CREATE TABLE resource_soft_blocked_accounts (
    id BIGSERIAL PRIMARY KEY,
    resource_id BIGINT NOT NULL,
    account_id BIGINT NOT NULL,
    blocked_until DATE NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    UNIQUE (resource_id, account_id),
    CONSTRAINT fk_resource_soft_blocked_accounts_resource 
        FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    CONSTRAINT fk_resource_soft_blocked_accounts_account 
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Create index on resource_id for better query performance
CREATE INDEX IF NOT EXISTS idx_resource_soft_blocked_accounts_resource_id 
    ON resource_soft_blocked_accounts(resource_id);

-- Create index on account_id for better query performance
CREATE INDEX IF NOT EXISTS idx_resource_soft_blocked_accounts_account_id 
    ON resource_soft_blocked_accounts(account_id);
