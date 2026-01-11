import React from 'react';

export const AdminPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline">
          <div>
              <h1 className="text-xl font-semibold text-gray-900">Admin</h1>
              <p className="text-sm text-gray-500 mt-1">Configurações e gestão da aplicação.</p>
          </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-gray-500">
          A área de administração estará disponível em breve.
        </p>
      </div>
    </div>
  );
};