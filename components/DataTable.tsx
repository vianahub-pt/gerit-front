import React, { useState, useMemo, useEffect } from 'react';
import { SearchIcon } from './Icons';

interface StatusBadgeProps {
  status: string;
}

const statusKeyMap: { [key: string]: string } = {
  // Open
  'aberto': 'open',
  // Pending
  'pendente': 'pending',
  'em manutenção': 'pending',
  // Closed
  'fechado': 'closed',
  'concluído': 'closed',
  // Active
  'ativo': 'active',
  'disponível': 'active',
  'em uso': 'active',
  'dado': 'active',
  // Inactive
  'inativo': 'inactive',
  'desativado': 'inactive',
  'revogado': 'inactive',
};

// Based on SECTION 1 of the user's request, mapping to Tailwind classes.
// --status-open-bg: #DBEAFE;     --status-open-text: #1E3A8A;     -> bg-blue-100 text-blue-900
// --status-pending-bg: #FEF3C7;  --status-pending-text: #78350F;  -> bg-amber-100 text-amber-900
// --status-closed-bg: #E5E7EB;   --status-closed-text: #374151;  -> bg-gray-200 text-gray-700
// --status-active-bg: #DCFCE7;   --status-active-text: #065F46;  -> bg-green-100 text-green-800
// --status-inactive-bg: #F3F4F6; --status-inactive-text: #6B7280; -> bg-gray-100 text-gray-500
const statusConfigMap: { [key: string]: { classes: string } } = {
  open:     { classes: 'bg-blue-100 text-blue-900' },
  pending:  { classes: 'bg-amber-100 text-amber-900' },
  closed:   { classes: 'bg-gray-200 text-gray-700' },
  active:   { classes: 'bg-green-100 text-green-800' },
  inactive: { classes: 'bg-gray-100 text-gray-500' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const statusKey = statusKeyMap[String(status).toLowerCase().trim()] || 'inactive';
    const config = statusConfigMap[statusKey] || statusConfigMap.inactive;
    const { classes } = config;

    return (
        <span
            role="status"
            aria-label={`Estado: ${status}`}
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${classes}`}
        >
            {status}
        </span>
    );
};


interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchKeys: (keyof T)[];
  title: string;
}

// Fix: Changed to a function declaration to avoid TSX parsing ambiguity with generics.
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}


// Fix: Changed to an exported function declaration to avoid TSX parsing ambiguity with generics.
// This resolves all syntax errors and ensures the component is correctly exported.
export function DataTable<T extends { id: number }>(
  { columns, data, searchKeys, title }: DataTableProps<T>
) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm) return data;
    return data.filter(item => {
      return searchKeys.some(key => {
        const value = item[key];
        if (typeof value === 'string' || typeof value === 'number') {
          return value.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        }
        return false;
      });
    });
  }, [data, debouncedSearchTerm, searchKeys]);

  const renderCell = (item: T, column: Column<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(item);
    }
    const value = item[column.accessor] as any;
    return value;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">{title}</h2>
        <div className="relative w-full sm:w-64">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white text-gray-900 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none placeholder-gray-400"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((col) => (
                <th key={col.header} className="p-4 text-sm font-semibold text-gray-500 uppercase">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-100">
                {columns.map((col) => (
                  <td key={col.header} className="p-4 text-sm text-gray-900">
                    {renderCell(item, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && (
            <div className="text-center p-8 text-gray-500">
                Nenhum resultado encontrado.
            </div>
        )}
      </div>
    </div>
  );
}