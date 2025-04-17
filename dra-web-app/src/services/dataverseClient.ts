import axios, { AxiosError, AxiosInstance } from 'axios';
import { protectedResources, initializeMsal } from '../config/authConfig';

// Create axios instance with base URL
const api: AxiosInstance = axios.create({
  baseURL: protectedResources.dataverseApi.endpoint,
  headers: {
    'Content-Type': 'application/json',
    'OData-MaxVersion': '4.0',
    'OData-Version': '4.0',
    'Accept': 'application/json',
    'Prefer': 'odata.include-annotations="*",return=representation',
    'If-Match': '*'
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  try {
    // Initialize MSAL before making any requests
    const msal = await initializeMsal();
    let accounts = msal.getAllAccounts();
    
    if (accounts.length === 0) {
      console.log('No accounts found, initiating login...');
      await msal.loginPopup({
        scopes: protectedResources.dataverseApi.scopes
      });
      accounts = msal.getAllAccounts();
    }

    const account = accounts[0];
    msal.setActiveAccount(account);

    const request = {
      account,
      scopes: protectedResources.dataverseApi.scopes,
    };

    try {
      console.log('Attempting silent token acquisition...');
      const response = await msal.acquireTokenSilent(request);
      if (config.headers) {
        config.headers['Authorization'] = `Bearer ${response.accessToken}`;
        // Add additional required headers for Dataverse
        config.headers['OData-MaxVersion'] = '4.0';
        config.headers['OData-Version'] = '4.0';
        config.headers['Accept'] = 'application/json';
        config.headers['Content-Type'] = 'application/json';
      }
      return config;
    } catch (silentError) {
      console.warn('Silent token acquisition failed, trying popup:', silentError);
      
      const response = await msal.acquireTokenPopup({
        ...request,
        prompt: 'select_account'
      });
      
      if (config.headers) {
        config.headers['Authorization'] = `Bearer ${response.accessToken}`;
        // Add additional required headers for Dataverse
        config.headers['OData-MaxVersion'] = '4.0';
        config.headers['OData-Version'] = '4.0';
        config.headers['Accept'] = 'application/json';
        config.headers['Content-Type'] = 'application/json';
      }
      return config;
    }
  } catch (error: any) {
    console.error('Error in request interceptor:', error);
    if (error.errorCode) {
      console.error('MSAL Error Code:', error.errorCode);
    }
    if (error.errorMessage) {
      console.error('MSAL Error Message:', error.errorMessage);
    }
    throw error;
  }
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    console.error('API Error:', error);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Headers:', error.response.headers);
      console.error('Response Data:', error.response.data);
    }
    if (error.config) {
      console.error('Request URL:', error.config.url);
      console.error('Request Method:', error.config.method);
      console.error('Request Headers:', error.config.headers);
      console.error('Request Data:', error.config.data);
    }

    if (error.response?.status === 401) {
      // Token might be expired, try to get a new one
      try {
        const msal = await initializeMsal();
        const accounts = msal.getAllAccounts();
        if (accounts.length > 0) {
          const account = accounts[0];
          const response = await msal.acquireTokenPopup({
            account,
            scopes: protectedResources.dataverseApi.scopes,
            prompt: 'select_account'
          });
          
          // Retry the original request with new token
          if (error.config) {
            error.config.headers['Authorization'] = `Bearer ${response.accessToken}`;
            return api(error.config);
          }
        }
      } catch (tokenError) {
        console.error('Error refreshing token:', tokenError);
      }
    }
    return Promise.reject(error);
  }
);

// Generic CRUD operations for Dataverse entities
export const dataverseClient = {
  // Get all records
  getAll: async <T>(entityName: string): Promise<T[]> => {
    try {
      // Initialize MSAL before making any requests
      await initializeMsal();
      
      console.log(`Fetching all ${entityName} records...`);
      const response = await api.get(`/api/data/v9.2/${entityName}`);
      console.log(`Successfully fetched ${entityName} records:`, response.data);
      return response.data.value;
    } catch (error) {
      console.error(`Error fetching ${entityName}:`, error);
      throw error;
    }
  },
  
  // Get record by ID
  getById: async <T>(entityName: string, id: string): Promise<T> => {
    try {
      // Initialize MSAL before making any requests
      await initializeMsal();
      
      const response = await api.get(`/api/data/v9.2/${entityName}(${id})`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${entityName} with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Create new record
  create: async <T>(entityName: string, data: any): Promise<T> => {
    try {
      // Initialize MSAL before making any requests
      await initializeMsal();
      
      // Clean up the payload by removing null/empty values
      const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
        // Skip null, undefined, or empty strings
        if (value === null || value === undefined || value === '') {
          return acc;
        }
        
        // Handle date fields
        if (key === 'dra_enrollmentdate' || key === 'dra_dob') {
          // Only include if it's a valid date
          const date = new Date(value as string);
          if (!isNaN(date.getTime())) {
            acc[key] = date.toISOString();
          }
          return acc;
        }
        
        acc[key] = value;
        return acc;
      }, {} as Record<string, any>);

      console.log(`Creating ${entityName} with cleaned data:`, cleanData);
      
      // Make the request with proper headers
      const response = await api.post(`/api/data/v9.2/${entityName}`, cleanData, {
        headers: {
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
          'Accept': 'application/json',
          'Prefer': 'return=representation'
        }
      });
      
      console.log(`Successfully created ${entityName}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error creating ${entityName}:`, error);
      
      if (axios.isAxiosError(error)) {
        // Log detailed request information
        console.error('Request details:', {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data
        });
        
        // Log detailed response information
        if (error.response) {
          console.error('Response details:', {
            status: error.response.status,
            statusText: error.response.statusText,
            headers: error.response.headers,
            data: error.response.data
          });
          
          // If we get a 400 error, try to identify the problematic fields
          if (error.response.status === 400 && error.response.data) {
            const errorData = error.response.data;
            console.error('Validation errors:', errorData);
            
            // If there are specific field errors, log them
            if (errorData.error?.innererror?.message) {
              console.error('Field validation errors:', errorData.error.innererror.message);
            }
          }
        }
      }
      
      throw error;
    }
  },
  
  // Update record
  update: async <T>(entityName: string, id: string, data: any): Promise<T> => {
    try {
      // Initialize MSAL before making any requests
      await initializeMsal();
      
      // Clean up the payload by removing null/empty values
      const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
        // Skip null, undefined, or empty strings
        if (value === null || value === undefined || value === '') {
          return acc;
        }
        
        // Handle date fields
        if (key === 'dra_enrollmentdate' || key === 'dra_dob') {
          // Only include if it's a valid date
          const date = new Date(value as string);
          if (!isNaN(date.getTime())) {
            acc[key] = date.toISOString();
          }
          return acc;
        }
        
        acc[key] = value;
        return acc;
      }, {} as Record<string, any>);
      
      console.log(`Updating ${entityName} ${id} with data:`, cleanData);
      const response = await api.patch(`/api/data/v9.2/${entityName}(${id})`, cleanData, {
        headers: {
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
          'Accept': 'application/json',
          'Prefer': 'return=representation'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating ${entityName} with ID ${id}:`, error);
      if (axios.isAxiosError(error)) {
        console.error('Request data:', error.config?.data);
        console.error('Response data:', error.response?.data);
      }
      throw error;
    }
  },
  
  // Delete record
  delete: async (entityName: string, id: string): Promise<void> => {
    try {
      // Initialize MSAL before making any requests
      await initializeMsal();
      
      console.log(`Deleting ${entityName} with ID: ${id}`);
      await api.delete(`/api/data/v9.2/${entityName}(${id})`);
    } catch (error) {
      console.error(`Error deleting ${entityName} with ID ${id}:`, error);
      throw error;
    }
  }
};

export default api; 