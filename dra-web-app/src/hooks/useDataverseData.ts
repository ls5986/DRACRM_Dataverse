import { useState, useEffect } from 'react';
import { clientService, debtAccountService, clientNoteService, dealService, creditPullService } from '../services/dataverseService';
import { Client, DebtAccount, ClientNote, Deal, CreditPull } from '../types/entities';

// Hook for fetching clients
export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAll();
      setClients(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch clients');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientData: Partial<Client>) => {
    try {
      setLoading(true);
      const newClient = await clientService.create(clientData);
      setClients(prev => [...prev, newClient]);
      setError(null);
      return newClient;
    } catch (err) {
      setError('Failed to create client');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateClient = async (id: string, clientData: Partial<Client>) => {
    try {
      setLoading(true);
      const updatedClient = await clientService.update(id, clientData);
      setClients(prev => prev.map(client => client.dra_clientid === id ? updatedClient : client));
      setError(null);
      return updatedClient;
    } catch (err) {
      setError('Failed to update client');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (id: string) => {
    try {
      setLoading(true);
      await clientService.delete(id);
      setClients(prev => prev.filter(client => client.dra_clientid !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete client');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return { clients, loading, error, refetch: fetchClients, createClient, updateClient, deleteClient };
};

// Hook for fetching debt accounts
export const useDebtAccounts = () => {
  const [debtAccounts, setDebtAccounts] = useState<DebtAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDebtAccounts = async () => {
    try {
      setLoading(true);
      const data = await debtAccountService.getAll();
      setDebtAccounts(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch debt accounts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebtAccounts();
  }, []);

  return { debtAccounts, loading, error, refetch: fetchDebtAccounts };
};

// Hook for fetching client notes
export const useClientNotes = (clientId?: string) => {
  const [clientNotes, setClientNotes] = useState<ClientNote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientNotes = async () => {
      try {
        setLoading(true);
        const data = await clientNoteService.getAll();
        // Filter by client ID if provided
        const filteredData = clientId 
          ? data.filter((note: ClientNote) => note.dra_clientid === clientId)
          : data;
        setClientNotes(filteredData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch client notes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientNotes();
  }, [clientId]);

  return { clientNotes, loading, error };
};

// Hook for fetching deals
export const useDeals = (clientId?: string) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const data = await dealService.getAll();
        // Filter by client ID if provided
        const filteredData = clientId 
          ? data.filter((deal: Deal) => deal.dra_clientid === clientId)
          : data;
        setDeals(filteredData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch deals');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, [clientId]);

  return { deals, loading, error };
};

// Hook for fetching credit pulls
export const useCreditPulls = (clientId?: string) => {
  const [creditPulls, setCreditPulls] = useState<CreditPull[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCreditPulls = async () => {
      try {
        setLoading(true);
        const data = await creditPullService.getAll();
        // Filter by client ID if provided
        const filteredData = clientId 
          ? data.filter((pull: CreditPull) => pull.dra_clientid === clientId)
          : data;
        setCreditPulls(filteredData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch credit pulls');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCreditPulls();
  }, [clientId]);

  return { creditPulls, loading, error };
}; 