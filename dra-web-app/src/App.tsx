import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import { Clients } from './components/Clients';
import Sales from './components/Sales';
import Integrations from './components/Integrations';
import Admin from './components/Admin';
import { msalInstance, initializeMsal } from './config/authConfig';

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initMsal = async () => {
      try {
        await initializeMsal();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize MSAL:', error);
      }
    };

    initMsal();
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  return (
    <MsalProvider instance={msalInstance}>
      <Router>
        <UnauthenticatedTemplate>
          <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
              <div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                  Debt Resolution CRM
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  Please sign in to access the application
                </p>
              </div>
              <div>
                <button
                  onClick={() => msalInstance.loginRedirect()}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign in with Microsoft
                </button>
              </div>
            </div>
          </div>
        </UnauthenticatedTemplate>
        <AuthenticatedTemplate>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="sales" element={<Sales />} />
              <Route path="clients" element={<Clients />} />
              <Route path="integrations" element={<Integrations />} />
              <Route path="admin" element={<Admin />} />
            </Route>
          </Routes>
        </AuthenticatedTemplate>
      </Router>
    </MsalProvider>
  );
};

export default App; 