-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Create enum types
CREATE TYPE client_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE deal_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
CREATE TYPE credit_bureau AS ENUM ('equifax', 'transunion', 'experian');

-- Create clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email CITEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    enrollment_date DATE,
    status client_status DEFAULT 'active',
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create debt_accounts table
CREATE TABLE debt_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    account_number TEXT NOT NULL,
    creditor_name TEXT NOT NULL,
    original_balance DECIMAL(10,2) NOT NULL,
    current_balance DECIMAL(10,2) NOT NULL,
    interest_rate DECIMAL(5,2),
    status TEXT DEFAULT 'active',
    CONSTRAINT positive_balance CHECK (original_balance >= 0 AND current_balance >= 0)
);

-- Create client_notes table
CREATE TABLE client_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    created_by TEXT NOT NULL
);

-- Create deals table
CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    debt_account_id UUID NOT NULL REFERENCES debt_accounts(id) ON DELETE CASCADE,
    settlement_amount DECIMAL(10,2) NOT NULL,
    status deal_status DEFAULT 'pending',
    settlement_date DATE,
    CONSTRAINT positive_settlement CHECK (settlement_amount >= 0)
);

-- Create credit_pulls table
CREATE TABLE credit_pulls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    credit_score INTEGER NOT NULL,
    pull_date DATE NOT NULL,
    bureau credit_bureau NOT NULL,
    CONSTRAINT valid_credit_score CHECK (credit_score >= 300 AND credit_score <= 850)
);

-- Create indexes for better query performance
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_debt_accounts_client_id ON debt_accounts(client_id);
CREATE INDEX idx_client_notes_client_id ON client_notes(client_id);
CREATE INDEX idx_deals_client_id ON deals(client_id);
CREATE INDEX idx_deals_debt_account_id ON deals(debt_account_id);
CREATE INDEX idx_credit_pulls_client_id ON credit_pulls(client_id);

-- Enable Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_pulls ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON clients
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable write access for authenticated users" ON clients
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON clients
    FOR UPDATE TO authenticated USING (true);

-- Similar policies for other tables
CREATE POLICY "Enable read access for authenticated users" ON debt_accounts
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable write access for authenticated users" ON debt_accounts
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON debt_accounts
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON client_notes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable write access for authenticated users" ON client_notes
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users" ON deals
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable write access for authenticated users" ON deals
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON deals
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON credit_pulls
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable write access for authenticated users" ON credit_pulls
    FOR INSERT TO authenticated WITH CHECK (true); 