import React, { useState, useEffect } from 'react';
import { useClients } from '../hooks/useDataverseData';
import { Client } from '../types/entities';
import { Spinner } from '../components/Spinner';

export const Clients: React.FC = () => {
  const { clients, loading, error, createClient, updateClient, deleteClient, refetch } = useClients();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Client>>({
    dra_income: 0,
    dra_firstname: '',
    dra_lastname: '',
    dra_email: '',
    dra_phone: '',
    dra_address: '',
    dra_city: '',
    dra_state: '',
    dra_zip: '',
    dra_ssn: '',
    dra_dob: '',
    dra_employer: '',
    dra_enrollmentdate: '',
    statecode: 0,
    statuscode: 1
  });

  useEffect(() => {
    if (selectedClient) {
      setFormData({
        dra_firstname: selectedClient.dra_firstname || '',
        dra_lastname: selectedClient.dra_lastname || '',
        dra_email: selectedClient.dra_email || '',
        dra_phone: selectedClient.dra_phone || '',
        dra_address: selectedClient.dra_address || '',
        dra_city: selectedClient.dra_city || '',
        dra_state: selectedClient.dra_state || '',
        dra_zip: selectedClient.dra_zip || '',
        dra_ssn: selectedClient.dra_ssn || '',
        dra_dob: selectedClient.dra_dob || '',
        dra_employer: selectedClient.dra_employer || '',
        dra_income: selectedClient.dra_income || 0,
        dra_enrollmentdate: selectedClient.dra_enrollmentdate || '',
        statecode: selectedClient.statecode || 0,
        statuscode: selectedClient.statuscode || 1
      });
    } else {
      setFormData({
        dra_firstname: '',
        dra_lastname: '',
        dra_email: '',
        dra_phone: '',
        dra_address: '',
        dra_city: '',
        dra_state: '',
        dra_zip: '',
        dra_ssn: '',
        dra_dob: '',
        dra_employer: '',
        dra_income: 0,
        dra_enrollmentdate: '',
        statecode: 0,
        statuscode: 1
      });
    }
  }, [selectedClient]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const clientData = {
        ...formData,
        dra_income: formData.dra_income || undefined
      };

      if (selectedClient) {
        await updateClient(selectedClient.dra_clientid, clientData);
      } else {
        await createClient(clientData);
      }

      setIsModalOpen(false);
      refetch();
    } catch (err) {
      setSubmitError('Failed to save client');
      console.error('Error saving client:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
    setSubmitError(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteClient(id);
        await refetch();
      } catch (error: any) {
        console.error('Error deleting client:', error);
        alert('Failed to delete client');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  }

  if (error) {
    return <div className="text-red-600 p-4">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Clients</h2>
        <button
          onClick={() => {
            setSelectedClient(null);
            setIsModalOpen(true);
            setSubmitError(null);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No clients found. Add your first client to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clients.map((client: Client) => (
                <tr key={client.dra_clientid}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {client.dra_firstname} {client.dra_lastname}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{client.dra_email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{client.dra_phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {client.dra_income ? `$${client.dra_income.toLocaleString()}` : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      client.statuscode === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {client.statuscode === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(client)}
                      className="text-blue-600 hover:text-blue-800 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(client.dra_clientid)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {selectedClient ? 'Edit Client' : 'Add Client'}
            </h3>
            
            {submitError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="dra_firstname"
                    value={formData.dra_firstname}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="dra_lastname"
                    value={formData.dra_lastname}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="dra_email"
                  value={formData.dra_email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  name="dra_phone"
                  value={formData.dra_phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  name="dra_address"
                  value={formData.dra_address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    name="dra_city"
                    value={formData.dra_city}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <input
                    type="text"
                    name="dra_state"
                    value={formData.dra_state}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="dra_zip"
                  value={formData.dra_zip}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  SSN
                </label>
                <input
                  type="text"
                  name="dra_ssn"
                  value={formData.dra_ssn}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dra_dob"
                  value={formData.dra_dob}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Employer
                </label>
                <input
                  type="text"
                  name="dra_employer"
                  value={formData.dra_employer}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Income
                </label>
                <input
                  type="number"
                  name="dra_income"
                  value={formData.dra_income}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Enrollment Date
                </label>
                <input
                  type="date"
                  name="dra_enrollmentdate"
                  value={formData.dra_enrollmentdate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {submitting ? 'Saving...' : selectedClient ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}; 