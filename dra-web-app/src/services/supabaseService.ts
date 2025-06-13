import { supabase } from '../config/supabaseClient';
import type { Tables } from '../config/supabaseClient';

// Client operations
export const clientService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  create: async (client: Omit<Tables['clients'], 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('clients')
      .insert([client])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Partial<Tables['clients']>) => {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Debt Account operations
export const debtAccountService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('debt_accounts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  getByClientId: async (clientId: string) => {
    const { data, error } = await supabase
      .from('debt_accounts')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  create: async (debtAccount: Omit<Tables['debt_accounts'], 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('debt_accounts')
      .insert([debtAccount])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Partial<Tables['debt_accounts']>) => {
    const { data, error } = await supabase
      .from('debt_accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('debt_accounts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Client Notes operations
export const clientNoteService = {
  getByClientId: async (clientId: string) => {
    const { data, error } = await supabase
      .from('client_notes')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  create: async (note: Omit<Tables['client_notes'], 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('client_notes')
      .insert([note])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Deals operations
export const dealService = {
  getByClientId: async (clientId: string) => {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  create: async (deal: Omit<Tables['deals'], 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('deals')
      .insert([deal])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Partial<Tables['deals']>) => {
    const { data, error } = await supabase
      .from('deals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Credit Pulls operations
export const creditPullService = {
  getByClientId: async (clientId: string) => {
    const { data, error } = await supabase
      .from('credit_pulls')
      .select('*')
      .eq('client_id', clientId)
      .order('pull_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  create: async (creditPull: Omit<Tables['credit_pulls'], 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('credit_pulls')
      .insert([creditPull])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}; 