import { useState, useEffect } from 'react';
import { Client } from '../types/entities';
import { clientService } from '../services/dataverseService';

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAll();
      setClients(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch clients');
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientData: Partial<Client>) => {
    try {
      const newClient = await clientService.create(clientData);
      setClients(prev => [...prev, newClient]);
      return newClient;
    } catch (err) {
      setError('Failed to create client');
      console.error('Error creating client:', err);
      throw err;
    }
  };

  const updateClient = async (id: string, clientData: Partial<Client>) => {
    try {
      const updatedClient = await clientService.update(id, clientData);
      setClients(prev => prev.map(client => 
        client.dra_clientid === id ? updatedClient : client
      ));
      return updatedClient;
    } catch (err) {
      setError('Failed to update client');
      console.error('Error updating client:', err);
      throw err;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await clientService.delete(id);
      setClients(prev => prev.filter(client => client.dra_clientid !== id));
    } catch (err) {
      setError('Failed to delete client');
      console.error('Error deleting client:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return {
    clients,
    loading,
    error,
    createClient,
    updateClient,
    deleteClient,
    refetch: fetchClients
  };
}; 