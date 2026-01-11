
import React, { useState } from 'react';
import { MOCK_CHANGES } from '../constants';
import { ChangeList } from '../types';

interface DashboardProps {
  onSelectChange: (change: ChangeList) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectChange }) => {
  const [filter, setFilter] = useState('');

  const filteredChanges = MOCK_CHANGES.filter(c => 
    c.subject.toLowerCase().includes(filter.toLowerCase()) || 
    c.project.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Changes</h1>
          <p className="text-sm text-gray-500">Track and review active patch sets across projects.</p>
        </div>
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Filter changes..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white shadow rounded-xl overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project / Branch</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Size</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredChanges.map((change) => (
              <tr 
                key={change.id} 
                className="hover:bg-indigo-50 transition-colors cursor-pointer"
                onClick={() => onSelectChange(change)}
              >
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-gray-900 max-w-md truncate">
                    {change.subject}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">ID: {change.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">
                      {change.project}
                    </span>
                    <span className="text-xs text-gray-500">/ {change.branch}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold mr-2 uppercase">
                      {change.owner.charAt(0)}
                    </div>
                    <span className="text-sm text-gray-700">{change.owner}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {change.updated}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <span className="text-green-600 font-medium">+{change.insertions}</span>
                  <span className="text-red-500 font-medium ml-2">-{change.deletions}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
