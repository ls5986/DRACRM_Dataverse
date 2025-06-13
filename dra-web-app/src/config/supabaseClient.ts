import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for your database tables
export type Tables = {
  clients: {
    id: string;
    created_at: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    enrollment_date: string;
    status: string;
  };
  debt_accounts: {
    id: string;
    created_at: string;
    client_id: string;
    account_number: string;
    creditor_name: string;
    original_balance: number;
    current_balance: number;
    interest_rate: number;
    status: string;
  };
  client_notes: {
    id: string;
    created_at: string;
    client_id: string;
    note_text: string;
    created_by: string;
  };
  deals: {
    id: string;
    created_at: string;
    client_id: string;
    debt_account_id: string;
    settlement_amount: number;
    status: string;
    settlement_date: string;
  };
  credit_pulls: {
    id: string;
    created_at: string;
    client_id: string;
    credit_score: number;
    pull_date: string;
    bureau: string;
  };
}; 