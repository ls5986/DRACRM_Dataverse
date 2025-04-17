import axios from 'axios';
import { protectedResources } from '../config/authConfig';
import { msalInstance } from '../config/authConfig';
import { Client } from '../types/entities';
import { dataverseClient } from './dataverseClient';

// Create axios instance with base URL
const dataverseApi = axios.create({
  baseURL: `${import.meta.env.VITE_DATAVERSE_URL}/api/data/v9.2`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'OData-MaxVersion': '4.0',
    'OData-Version': '4.0',
  },
});

// Add request interceptor to add auth token
dataverseApi.interceptors.request.use(async (config) => {
  try {
    console.log('Getting accounts...');
    const accounts = msalInstance.getAllAccounts();
    console.log('Accounts:', accounts);

    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    console.log('Acquiring token silently...');
    const request = {
      account: accounts[0],
      scopes: protectedResources.dataverseApi.scopes,
    };

    const response = await msalInstance.acquireTokenSilent(request);
    console.log('Token acquired successfully');

    if (config.headers) {
      config.headers['Authorization'] = `Bearer ${response.accessToken}`;
    }
    return config;
  } catch (error: any) {
    console.error('Error in request interceptor:', error);
    if (error.errorCode) {
      console.error('MSAL Error Code:', error.errorCode);
    }
    if (error.errorMessage) {
      console.error('MSAL Error Message:', error.errorMessage);
    }
    
    // Try interactive sign in
    try {
      console.log('Attempting interactive sign in...');
      const response = await msalInstance.acquireTokenPopup({
        scopes: protectedResources.dataverseApi.scopes
      });
      console.log('Interactive sign in successful');
      
      if (config.headers) {
        config.headers['Authorization'] = `Bearer ${response.accessToken}`;
      }
      return config;
    } catch (interactiveError: any) {
      console.error('Error during interactive sign in:', interactiveError);
      if (interactiveError.errorCode) {
        console.error('MSAL Interactive Error Code:', interactiveError.errorCode);
      }
      if (interactiveError.errorMessage) {
        console.error('MSAL Interactive Error Message:', interactiveError.errorMessage);
      }
      return Promise.reject(interactiveError);
    }
  }
});

// Add response interceptor for error handling
dataverseApi.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    if (error.response) {
      console.error('Response Data:', error.response.data);
      console.error('Response Status:', error.response.status);
      console.error('Response Headers:', error.response.headers);
    }
    return Promise.reject(error);
  }
);

// Update the entity name to match the correct case in Dataverse
const ENTITY_NAME = 'dra_Clients';

export const clientService = {
  getAll: async (): Promise<Client[]> => {
    try {
      console.log('Fetching all clients...');
      const clients = await dataverseClient.getAll<Client>(ENTITY_NAME);
      console.log('Successfully fetched clients:', clients);
      return clients;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Client> => {
    try {
      return await dataverseClient.getById<Client>(ENTITY_NAME, id);
    } catch (error) {
      console.error(`Error fetching client with ID ${id}:`, error);
      throw error;
    }
  },

  create: async (data: Partial<Client>): Promise<Client> => {
    try {
      // Clean the payload by removing null/undefined/empty values
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value != null && value !== '')
      );

      // Handle date fields
      if (cleanedData.dra_enrollmentdate) {
        cleanedData.dra_enrollmentdate = new Date(cleanedData.dra_enrollmentdate).toISOString();
      }
      if (cleanedData.dra_dob) {
        cleanedData.dra_dob = new Date(cleanedData.dra_dob).toISOString();
      }

      // For dra_clients, ensure we have both first and last name
      if (!cleanedData.dra_firstname || !cleanedData.dra_lastname) {
        throw new Error('Both first name and last name are required');
      }
      // Set the dra_name field by concatenating first and last name
      cleanedData.dra_name = `${cleanedData.dra_firstname} ${cleanedData.dra_lastname}`;

      console.log('Creating client with data:', cleanedData);
      return await dataverseClient.create<Client>(ENTITY_NAME, cleanedData);
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  },

  update: async (id: string, data: Partial<Client>): Promise<Client> => {
    try {
      return await dataverseClient.update<Client>(ENTITY_NAME, id, data);
    } catch (error) {
      console.error(`Error updating client with ID ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await dataverseClient.delete(ENTITY_NAME, id);
    } catch (error) {
      console.error(`Error deleting client with ID ${id}:`, error);
      throw error;
    }
  }
};

// Debt Account entity operations
export const debtAccountService = {
  // Get all debt accounts
  getAll: async () => {
    const response = await dataverseApi.get('/dra_debtaccounts');
    return response.data.value;
  },
  
  // Get debt account by ID
  getById: async (id: string) => {
    const response = await dataverseApi.get(`/dra_debtaccounts(${id})`);
    return response.data;
  },
  
  // Create new debt account
  create: async (debtAccountData: any) => {
    const response = await dataverseApi.post('/dra_debtaccounts', debtAccountData);
    return response.data;
  },
  
  // Update debt account
  update: async (id: string, debtAccountData: any) => {
    const response = await dataverseApi.patch(`/dra_debtaccounts(${id})`, debtAccountData);
    return response.data;
  },
  
  // Delete debt account
  delete: async (id: string) => {
    await dataverseApi.delete(`/dra_debtaccounts(${id})`);
  }
};

// Client Note entity operations
export const clientNoteService = {
  // Get all client notes
  getAll: async () => {
    const response = await dataverseApi.get('/dra_clientnotes');
    return response.data.value;
  },
  
  // Get client note by ID
  getById: async (id: string) => {
    const response = await dataverseApi.get(`/dra_clientnotes(${id})`);
    return response.data;
  },
  
  // Create new client note
  create: async (clientNoteData: any) => {
    const response = await dataverseApi.post('/dra_clientnotes', clientNoteData);
    return response.data;
  },
  
  // Update client note
  update: async (id: string, clientNoteData: any) => {
    const response = await dataverseApi.patch(`/dra_clientnotes(${id})`, clientNoteData);
    return response.data;
  },
  
  // Delete client note
  delete: async (id: string) => {
    await dataverseApi.delete(`/dra_clientnotes(${id})`);
  }
};

// Deal entity operations
export const dealService = {
  // Get all deals
  getAll: async () => {
    const response = await dataverseApi.get('/dra_deals');
    return response.data.value;
  },
  
  // Get deal by ID
  getById: async (id: string) => {
    const response = await dataverseApi.get(`/dra_deals(${id})`);
    return response.data;
  },
  
  // Create new deal
  create: async (dealData: any) => {
    const response = await dataverseApi.post('/dra_deals', dealData);
    return response.data;
  },
  
  // Update deal
  update: async (id: string, dealData: any) => {
    const response = await dataverseApi.patch(`/dra_deals(${id})`, dealData);
    return response.data;
  },
  
  // Delete deal
  delete: async (id: string) => {
    await dataverseApi.delete(`/dra_deals(${id})`);
  }
};

// Credit Pull entity operations
export const creditPullService = {
  // Get all credit pulls
  getAll: async () => {
    const response = await dataverseApi.get('/dra_creditpulls');
    return response.data.value;
  },
  
  // Get credit pull by ID
  getById: async (id: string) => {
    const response = await dataverseApi.get(`/dra_creditpulls(${id})`);
    return response.data;
  },
  
  // Create new credit pull
  create: async (creditPullData: any) => {
    const response = await dataverseApi.post('/dra_creditpulls', creditPullData);
    return response.data;
  },
  
  // Update credit pull
  update: async (id: string, creditPullData: any) => {
    const response = await dataverseApi.patch(`/dra_creditpulls(${id})`, creditPullData);
    return response.data;
  },
  
  // Delete credit pull
  delete: async (id: string) => {
    await dataverseApi.delete(`/dra_creditpulls(${id})`);
  }
};

export default {
  clientService,
  debtAccountService,
  clientNoteService,
  dealService,
  creditPullService
}; 