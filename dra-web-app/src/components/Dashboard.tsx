import React from 'react';
import { useClients } from '../hooks/useDataverseData';

const Dashboard: React.FC = () => {
  const { clients, loading, error } = useClients();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  // Calculate client statistics
  const totalClients = clients.length;
  const newClientsLast7Days = clients.filter(
    client => {
      const createdDate = new Date(client.dra_createdon);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return createdDate >= sevenDaysAgo;
    }
  ).length;
  const enrolledClients = clients.filter(client => client.statecode === 0).length;

  // Mock data for backend distribution
  const backendDistribution = [
    { name: 'Cordoba', count: 1, percentage: 33 },
    { name: 'Achieve', count: 0, percentage: 0 },
    { name: 'Freedom Debt Relief', count: 0, percentage: 0 },
    { name: 'National Debt Relief', count: 0, percentage: 0 }
  ];

  // Mock data for recent activity
  const recentActivity = [
    {
      client: 'Robert Johnson',
      date: '2025-04-08',
      description: 'Client enrolled in Cordoba program, paperwork completed'
    },
    {
      client: 'John Smith',
      date: '2025-04-07',
      description: 'Initial consultation scheduled for 04/10/2025'
    },
    {
      client: 'Maria Garcia',
      date: '2025-04-06',
      description: 'Discussed Achieve program, client wants to think it over'
    },
    {
      client: 'Maria Garcia',
      date: '2025-03-28',
      description: 'Client is interested in debt consolidation options'
    },
    {
      client: 'Robert Johnson',
      date: '2025-03-22',
      description: 'Recommended Cordoba program based on debt profile'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Client Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Client Overview</h2>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Clients</span>
            <span className="font-medium">{totalClients}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">New Clients (Last 7 Days)</span>
            <span className="font-medium">{newClientsLast7Days}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Enrolled Clients</span>
            <span className="font-medium">{enrolledClients}</span>
          </div>
        </div>
      </div>

      {/* Backend Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Backend Distribution</h2>
        <div className="space-y-4">
          {backendDistribution.map(backend => (
            <div key={backend.name} className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{backend.name}</span>
                <span className="font-medium">{backend.count} ({backend.percentage}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${backend.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6 lg:col-span-1">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{activity.client}</h3>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                </div>
                <span className="text-sm text-gray-500">{activity.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 