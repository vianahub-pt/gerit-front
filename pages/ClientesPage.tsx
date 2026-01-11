import React, { useEffect, useMemo, useState } from 'react';
import { Cliente, ConsentimentoStatus, Intervencao } from '../types';
import { getClientes, createCliente } from '../services/clientesApi';
import { MOCK_CLIENTES } from '../constants';
import { Toast } from '../App';
import { StatusBadge } from '../components/DataTable';
import { TableActions } from '../components/TableActions';

import {
  PencilIcon,
  PaperPlaneIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  SelectorIcon,
  MapPinIcon,
  XIcon,
} from '../components/Icons';

/* ================= MODAL ================= */

interface ClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Cliente, 'id' | 'criadoEm'>) => void;
  setToast: (toast: Toast | null) => void;
}

const ClienteModal: React.FC<ClienteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  setToast,
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    consentimento: ConsentimentoStatus.Pendente,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome) {
      setToast({ message: 'Nome é obrigatório', type: 'error' });
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Adicionar Cliente</h2>
          <button onClick={onClose}>
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border p-2 rounded"
            placeholder="Nome"
            value={formData.nome}
            onChange={e =>
              setFormData({ ...formData, nome: e.target.value })
            }
          />

          <input
            className="w-full border p-2 rounded"
            placeholder="Email"
            value={formData.email}
            onChange={e =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ================= PAGE ================= */

const ROWS_PER_PAGE = 10;
type SortKey = keyof Cliente;
type SortDirection = 'asc' | 'desc';

interface ClientesPageProps {
  setToast: (toast: Toast | null) => void;
  intervencoes: Intervencao[];
}

export const ClientesPage: React.FC<ClientesPageProps> = ({ setToast }) => {
  const useApi = import.meta.env.VITE_USE_API === 'true';

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setImportOpen] = useState(false);

  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
  }>({ key: 'nome', direction: 'asc' });

  /* ===== LOAD ===== */
  useEffect(() => {
    if (useApi) {
      getClientes()
        .then(setClientes)
        .catch(() => setClientes(MOCK_CLIENTES));
    } else {
      setClientes(MOCK_CLIENTES);
    }
  }, [useApi]);

  /* ===== FILTER / SEARCH ===== */
  const filteredClientes = useMemo(() => {
    return clientes.filter(c => {
      const matchSearch =
        c.nome.toLowerCase().includes(search.toLowerCase()) ||
        (c.email ?? '').toLowerCase().includes(search.toLowerCase());

      const matchFilter =
        filter === 'Todos' || c.consentimento === filter;

      return matchSearch && matchFilter;
    });
  }, [clientes, search, filter]);

  /* ===== SORT ===== */
  const sortedClientes = useMemo(() => {
    const data = [...filteredClientes];
    data.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (!aVal || !bVal) return 0;
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [filteredClientes, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction:
        prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  /* ===== CREATE ===== */
  const handleSave = async (data: Omit<Cliente, 'id' | 'criadoEm'>) => {
    try {
      const novo = await createCliente(data);
      setClientes(prev => [novo, ...prev]);
      setToast({ message: 'Cliente criado com sucesso', type: 'success' });
      setIsModalOpen(false);
    } catch {
      setToast({ message: 'Erro ao criar cliente', type: 'error' });
    }
  };

  /* ===== RENDER ===== */
  return (
    <div className="px-4 md:px-6 py-6 space-y-6">
    
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
  <div>
    <h1 className="text-xl font-semibold text-gray-900">Clientes</h1>
    <p className="text-sm text-gray-500 mt-1">
      Gira os teus clientes.
    </p>
  </div>

  <div className="flex items-center gap-2 mt-4 sm:mt-0">
    <button className="flex items-center px-3 py-2 text-sm border rounded-lg bg-white hover:bg-gray-50">
      Importar CSV
    </button>

    <button className="flex items-center px-3 py-2 text-sm border rounded-lg bg-gray-100 hover:bg-gray-200">
      Exportar CSV
    </button>

    <button className="flex items-center px-3 py-2 text-sm border rounded-lg bg-white hover:bg-gray-50">
      Imprimir / PDF
    </button>

    <button
      onClick={() => setIsModalOpen(true)}
      className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700"
    >
      + Adicionar Cliente
    </button>
  </div>
</div>

      {/* ACTION BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Pesquisar clientes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-10 w-64 border rounded-lg px-3"
          />

          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="h-10 border rounded-lg px-3"
          >
            <option value="Todos">Todos</option>
            <option value={ConsentimentoStatus.Pendente}>Pendente</option>
            <option value={ConsentimentoStatus.Dado}>Dado</option>
          </select>
        </div>

        <div className="flex gap-2">
          <TableActions
            data={sortedClientes}
            entityName="Clientes"
            setToast={setToast}
          />

        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead>
           <tr className="border-b">
              <th className="p-4 text-left">Nome</th>
              <th className="p-4 text-left">Morada</th>
              <th className="p-4 text-left">Consentimento</th>
              <th className="p-4 text-left">NIF</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Telefone</th>
              <th className="p-4 text-left">Criado em</th>
              <th className="p-4 text-right">Ações</th>
          </tr>

          </thead>

          <tbody>
            {sortedClientes.map(cliente => (
              <tr key={cliente.id} className="border-b">
                <td className="p-4">{cliente.nome}</td>
                <td className="p-4">{cliente.email}</td>
                <td className="p-4">
                  <StatusBadge status={cliente.consentimento} />
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-3">
                    <PaperPlaneIcon className="w-4 h-4 text-gray-500" />
                    <PencilIcon className="w-4 h-4 text-gray-500" />
                    <TrashIcon className="w-4 h-4 text-gray-500" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ClienteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          setToast={setToast}
        />
      )}
    </div>
  );
};
