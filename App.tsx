
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import ChangeDetails from './components/ChangeDetails';
import { ChangeList } from './types';

const App: React.FC = () => {
  const [selectedChange, setSelectedChange] = useState<ChangeList | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div 
                className="flex-shrink-0 flex items-center cursor-pointer" 
                onClick={() => setSelectedChange(null)}
              >
                <div className="bg-indigo-600 p-1.5 rounded-lg mr-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  GeritAI
                </span>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                <button className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Changes
                </button>
                <button className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Documentation
                </button>
                <button className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Settings
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold border border-indigo-200">
                JD
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {selectedChange ? (
          <ChangeDetails 
            change={selectedChange} 
            onBack={() => setSelectedChange(null)} 
          />
        ) : (
          <Dashboard onSelectChange={setSelectedChange} />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} GeritAI. Powered by Gemini Pro.
        </div>
      </footer>
    </div>
  );
};

export default App;
