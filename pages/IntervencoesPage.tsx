
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
    MOCK_CLIENTES, 
    MOCK_EQUIPA, 
    MOCK_VIATURAS, 
    MOCK_EQUIPAMENTO 
} from '../constants';
import { Status, Intervencao } from '../types';
import { 
    PencilIcon, 
    TrashIcon, 
    ChevronUpIcon, 
    ChevronDownIcon, 
    SelectorIcon,
    PlusIcon,
    XIcon,
    EyeIcon,
    CheckCircleIcon,
    PaperPlaneIcon,
    DownloadIcon,
    MapPinIcon,
    UsersIcon,
    ExternalLinkIcon
} from '../components/Icons';
import { TableActions, ExportColumn } from '../components/TableActions';
import { StatusBadge } from '../components/DataTable';
import { ImportCsvModal, ImportableColumn } from '../components/ImportCsvModal';

type ToastType = 'success' | 'error' | 'info';

interface IntervencoesPageProps {
  setToast: (toast: { message: string, type: ToastType } | null) => void;
  intervencoes: Intervencao[];
  onSave: (data: Omit<Intervencao, 'id' | 'viatura' | 'responsavel'> & {id?: number}) => void;
  onDelete: (id: number) => void;
  action: string | null;
  setAction: (action: string | null) => void;
}


// Helper to format date
const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year}, ${hours}:${minutes}`;
};

const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value);
};


// --- Sub-components defined in this file ---

type SortDirection = 'asc' | 'desc';
type SortKey = keyof Intervencao;

const ROWS_PER_PAGE = 10;
const defaultFilters = { estado: 'Todos', inicio: '', fim: '' };

// --- Main Page Component ---

export const IntervencoesPage: React.FC<IntervencoesPageProps> = ({ setToast, intervencoes, onSave, onDelete, action, setAction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const [activeFilters, setActiveFilters] = useState(defaultFilters);
  const [tempFilters, setTempFilters] = useState(defaultFilters);

  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>({ key: 'inicio', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIntervencao, setEditingIntervencao] = useState<Intervencao | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingIntervencao, setViewingIntervencao] = useState<Intervencao | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  
  const handleCreate = useCallback(() => {
    setEditingIntervencao(null);
    setIsModalOpen(true);
  }, []);

  useEffect(() => {
    if (action === 'create-intervention') {
      handleCreate();
      setAction(null); // Consume the action
    }
  }, [action, setAction, handleCreate]);


  const handleApplyFilters = () => {
    setActiveFilters(tempFilters);
    setToast({ message: 'Filtros atualizados.', type: 'info' });
  };

  const handleClearFilters = () => {
    setActiveFilters(defaultFilters);
    setTempFilters(defaultFilters);
    setToast({ message: 'Filtros limpos.', type: 'info' });
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setTempFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const filteredData = useMemo(() => {
    return intervencoes.filter(item => {
      // Search term filter
      const lowercasedTerm = searchTerm.toLowerCase();
      const searchMatch = !searchTerm ||
        item.titulo.toLowerCase().includes(lowercasedTerm) ||
        item.responsavel.toLowerCase().includes(lowercasedTerm);

      // Status filter
      const statusMatch = activeFilters.estado === 'Todos' || item.estado === activeFilters.estado;

      // Date filter
      const itemStart = new Date(item.inicio);
      const itemEnd = new Date(item.fim);
      let dateMatch = true;
      if (activeFilters.inicio) {
          const filterStart = new Date(activeFilters.inicio);
          filterStart.setHours(0, 0, 0, 0);
          if (itemEnd < filterStart) dateMatch = false;
      }
      if (activeFilters.fim) {
          const filterEnd = new Date(activeFilters.fim);
          filterEnd.setHours(23, 59, 59, 999);
          if (itemStart > filterEnd) dateMatch = false;
      }
      
      return searchMatch && statusMatch && dateMatch;
    });
  }, [intervencoes, searchTerm, activeFilters]);


  const handleSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        // Handle undefined values
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    return sortedData.slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(sortedData.length / ROWS_PER_PAGE);
  
  useEffect(() => {
      if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
      }
  }, [currentPage, totalPages]);
  
  const handleEdit = (intervencao: Intervencao) => {
    setEditingIntervencao(intervencao);
    setIsModalOpen(true);
  };

  const handleView = (intervencao: Intervencao) => {
    setViewingIntervencao(intervencao);
    setIsViewModalOpen(true);
  };
  
  const handleDeleteRequest = (id: number) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingId) {
        setIsDeleting(true);
        // Simulate network delay for better UX
        setTimeout(() => {
            try {
                // Check if deleting the last item on a page to adjust pagination
                if (paginatedData.length === 1 && currentPage > 1) {
                    setCurrentPage(p => p - 1);
                }
                onDelete(deletingId);
            } catch (error) {
                setToast({ message: 'Erro ao eliminar a intervenção.', type: 'error' });
            } finally {
                setIsDeleting(false);
                setIsConfirmOpen(false);
                setDeletingId(null);
            }
        }, 500);
    }
  };
  
  const handleSave = (intervencao: Omit<Intervencao, 'id' | 'viatura' | 'responsavel'> & {id?: number}) => {
      try {
        onSave(intervencao);
        setIsModalOpen(false);
      } catch (error) {
        setToast({ message: 'Não foi possível guardar. Tente novamente.', type: 'error' });
      }
  };

  const handleStatusUpdate = (id: number, newStatus: Status) => {
      const original = intervencoes.find(i => i.id === id);
      if (original) {
          const { id: _, viatura: __, responsavel: ___, ...rest } = original;
          onSave({ ...rest, id, estado: newStatus });
          // Update the local viewing state if open
          if (viewingIntervencao && viewingIntervencao.id === id) {
              setViewingIntervencao({ ...original, estado: newStatus });
          }
      }
  };

  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
        return <SelectorIcon className="w-4 h-4 ml-1.5 text-gray-400" />;
    }
    if (sortConfig.direction === 'asc') {
        return <ChevronUpIcon className="w-4 h-4 ml-1.5 text-gray-900" />;
    }
    return <ChevronDownIcon className="w-4 h-4 ml-1.5 text-gray-900" />;
  };

  const handleImportData = (importedData: Partial<Intervencao>[]) => {
      let created = 0, updated = 0, skipped = 0;
      const newIntervencoes = [...intervencoes];

      importedData.forEach((item, index) => {
          if (!item.titulo || !item.inicio || !item.fim) {
              skipped++;
              return;
          }
          // Note: update logic is complex for interventions without a clear unique key in the CSV
          // For this implementation, we will only create new interventions.
          const viatura = MOCK_VIATURAS.find(v => v.id === item.viaturaId)?.matricula || '';
          const responsavel = MOCK_EQUIPA.find(m => m.id === item.responsavelId)?.nome || '';

          const newIntervencao: Intervencao = {
              id: Date.now() + created, // simple unique id
              titulo: item.titulo,
              descricao: item.descricao,
              estado: item.estado || Status.Aberto,
              inicio: item.inicio,
              fim: item.fim,
              viatura: viatura,
              responsavel: responsavel,
              viaturaId: item.viaturaId,
              responsavelId: item.responsavelId,
              clienteId: item.clienteId,
              ajudanteId: item.ajudanteId,
              equipamentos: item.equipamentos,
              morada: item.morada,
              valorOrcamento: item.valorOrcamento,
          };
          // Directly call onSave to add it, which will eventually update the parent state
          onSave(newIntervencao); 
          created++;
      });
      return { created, updated, skipped };
  };

  const importableColumns: ImportableColumn<Intervencao>[] = [
      { key: 'titulo', label: 'Título', required: true },
      { key: 'descricao', label: 'Descrição' },
      { key: 'estado', label: 'Estado' },
      { key: 'inicio', label: 'Início', required: true },
      { key: 'fim', label: 'Fim', required: true },
      { key: 'viaturaId', label: 'ID Viatura' },
      { key: 'responsavelId', label: 'ID Responsável' },
      { key: 'ajudanteId', label: 'ID Ajudante' },
      { key: 'clienteId', label: 'ID Cliente' },
      { key: 'morada', label: 'Morada' },
      { key: 'valorOrcamento', label: 'Valor Orçamento' },
  ];

  const columns: { header: string; accessor: SortKey; sortable: boolean; }[] = [
    { header: 'Título', accessor: 'titulo', sortable: true },
    { header: 'Estado', accessor: 'estado', sortable: true },
    { header: 'Início', accessor: 'inicio', sortable: true },
    { header: 'Fim', accessor: 'fim', sortable: true },
    { header: 'Viatura', accessor: 'viatura', sortable: true },
    { header: 'Responsável', accessor: 'responsavel', sortable: true },
  ];

  const exportColumns: ExportColumn<Intervencao>[] = [
    { header: 'ID', accessor: item => item.id },
    { header: 'Título', accessor: item => item.titulo },
    { header: 'Descrição', accessor: item => item.descricao || '' },
    { header: 'Estado', accessor: item => item.estado },
    { header: 'Início', accessor: item => formatDate(item.inicio) },
    { header: 'Fim', accessor: item => formatDate(item.fim) },
    { header: 'Viatura', accessor: item => item.viatura },
    { header: 'Responsável', accessor: item => item.responsavel },
    { header: 'Ajudante', accessor: item => MOCK_EQUIPA.find(m => m.id === item.ajudanteId)?.nome || '' },
    { header: 'Cliente', accessor: item => MOCK_CLIENTES.find(c => c.id === item.clienteId)?.nome || '' },
    { header: 'Morada', accessor: item => item.morada || '' },
    { header: 'Valor Orçamento', accessor: item => formatCurrency(item.valorOrcamento) },
    { header: 'Equipamentos', accessor: item => (item.equipamentos || []).map(id => MOCK_EQUIPAMENTO.find(e => e.id === id)?.nome).filter(Boolean).join(', ') },
  ];

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Intervenções</h1>
                <p className="text-sm text-gray-500 mt-1">Gira e agenda todas as tuas tarefas e intervenções.</p>
            </div>
            <div className="flex items-center gap-2 mt-4 sm:mt-0 self-start sm:self-center">
              <TableActions
                data={sortedData}
                columns={exportColumns}
                entityName="Intervenções"
                setToast={setToast}
                onImportClick={() => setImportModalOpen(true)}
              />
              <button 
                  onClick={handleCreate}
                  className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-150 ease-in-out flex items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 h-9"
              >
                  <PlusIcon className="w-5 h-5 mr-2 -ml-1" />
                  Criar intervenção
              </button>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div className="lg:col-span-1">
                    <label className="text-sm font-medium text-gray-700">Estado</label>
                    <select name="estado" value={tempFilters.estado} onChange={handleFilterChange} className="mt-1 h-10 w-full bg-white text-gray-900 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600">
                        <option>Todos</option>
                        <option>Aberto</option>
                        <option>Pendente</option>
                        <option>Fechado</option>
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">De</label>
                    <input type="date" name="inicio" value={tempFilters.inicio} onChange={handleFilterChange} className="mt-1 h-10 w-full bg-white text-gray-900 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" style={{colorScheme: 'light'}}/>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Até</label>
                    <input type="date" name="fim" value={tempFilters.fim} onChange={handleFilterChange} className="mt-1 h-10 w-full bg-white text-gray-900 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" style={{colorScheme: 'light'}} />
                </div>
                <div className="flex space-x-2 lg:col-span-2">
                    <button onClick={handleClearFilters} className="h-10 w-full px-4 py-2 text-sm font-semibold bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors whitespace-nowrap">Limpar</button>
                    <button onClick={handleApplyFilters} className="h-10 w-full px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">Aplicar Filtros</button>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-end mb-6">
                <div className="relative w-full sm:w-72">
                    <input
                        type="text"
                        placeholder="Pesquisar intervenções..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-10 w-full pl-4 pr-4 py-2 bg-white text-gray-900 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none placeholder-gray-400 transition-colors duration-150"
                    />
                </div>
            </div>
            {sortedData.length > 0 ? (
            <>
            <div className="overflow-x-auto">
                <table className="w-full text-left table-auto">
                    <thead>
                        <tr className="border-b border-gray-200">
                            {columns.map(col => (
                                <th key={col.accessor} className="p-4 text-sm font-semibold text-gray-500 uppercase bg-white" onClick={() => col.sortable && handleSort(col.accessor)}>
                                    <div className={`flex items-center ${col.sortable ? 'cursor-pointer select-none' : ''}`}>
                                        {col.header}
                                        {col.sortable && getSortIcon(col.accessor)}
                                    </div>
                                </th>
                            ))}
                            <th className="p-4 text-sm font-semibold text-gray-500 uppercase text-right bg-white">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item, index) => (
                        <tr key={item.id} className={`transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-gray-100`}>
                            <td className="p-4 text-sm text-gray-900 max-w-xs border-b border-gray-200">
                                <p className="truncate" title={item.titulo}>{item.titulo}</p>
                            </td>
                            <td className="p-4 text-sm text-gray-900 border-b border-gray-200"><StatusBadge status={item.estado} /></td>
                            <td className="p-4 text-sm text-gray-900 whitespace-nowrap border-b border-gray-200">{formatDate(item.inicio)}</td>
                            <td className="p-4 text-sm text-gray-900 whitespace-nowrap border-b border-gray-200">{formatDate(item.fim)}</td>
                            <td className="p-4 text-sm text-gray-900 max-w-[120px] border-b border-gray-200"><p className="truncate" title={item.viatura}>{item.viatura}</p></td>
                            <td className="p-4 text-sm text-gray-900 max-w-[120px] border-b border-gray-200"><p className="truncate" title={item.responsavel}>{item.responsavel}</p></td>
                            <td className="p-4 border-b border-gray-200">
                                <div className="flex space-x-3 justify-end">
                                    <button onClick={() => handleView(item)} className="text-gray-500 hover:text-blue-600 transition-colors" aria-label={`Ver detalhes ${item.titulo}`}><EyeIcon className="w-[18px] h-[18px]"/></button>
                                    <button onClick={() => handleEdit(item)} className="text-gray-500 hover:text-gray-900 transition-colors" aria-label={`Editar intervenção ${item.titulo}`}><PencilIcon className="w-[18px] h-[18px]"/></button>
                                    <button onClick={() => handleDeleteRequest(item.id)} className="text-gray-500 hover:text-red-600 transition-colors" aria-label={`Eliminar intervenção ${item.titulo}`}><TrashIcon className="w-[18px] h-[18px]"/></button>
                                </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="flex justify-end items-center mt-6">
                <span className="text-sm text-gray-500 mr-4">Página {currentPage} de {totalPages}</span>
                <div className="flex space-x-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="px-3 py-1.5 text-sm font-medium bg-white border border-gray-200 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        Anterior
                    </button>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1.5 text-sm font-medium bg-white border border-gray-200 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        Próxima
                    </button>
                </div>
            </div>
            </>
            ) : (
                <div className="text-center p-12 border-2 border-dashed border-gray-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900">Nenhum resultado encontrado</h3>
                    <p className="text-sm text-gray-500 mt-1">Tente ajustar os seus filtros ou crie uma nova intervenção.</p>
                    <button onClick={handleCreate} className="mt-4 bg-transparent text-blue-600 font-semibold py-2 px-4 rounded-lg border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center mx-auto">
                        <PlusIcon className="w-5 h-5 mr-2 -ml-1" />
                        Criar intervenção
                    </button>
                </div>
            )}
        </div>
        
        {isModalOpen && (
            <IntervencaoModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSave}
                intervention={editingIntervencao}
                setToast={setToast}
            />
        )}

        {isViewModalOpen && (
            <IntervencaoDetailModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                intervention={viewingIntervencao}
                onStatusChange={handleStatusUpdate}
                setToast={setToast}
            />
        )}

        {isConfirmOpen && (
            <ConfirmationDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Intervenção"
                message="Tem a certeza que deseja eliminar esta intervenção? Esta ação não pode ser anulada."
                isDeleting={isDeleting}
            />
        )}
        
        <ImportCsvModal 
            isOpen={isImportModalOpen}
            onClose={() => setImportModalOpen(false)}
            entityName="Intervenções"
            importableColumns={importableColumns}
            existingData={intervencoes}
            onImport={handleImportData}
            setToast={setToast}
            uniqueKey="id"
        />
    </div>
  );
};


// --- Themed Form Components ---
const inputClasses = (hasError: boolean) =>
  `h-10 bg-white text-gray-900 placeholder-gray-400 mt-1 block w-full border ${
    hasError ? 'border-red-500' : 'border-gray-200'
  } rounded-lg shadow-sm p-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors duration-150`;

const FormField: React.FC<{ label: string; error?: string; children: React.ReactNode, className?: string }> = ({ label, error, children, className }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-900">{label}</label>
    {children}
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }> = ({ hasError = false, ...props }) => (
  <input {...props} className={`${inputClasses(hasError)} ${props.className || ''}`} />
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { hasError?: boolean }> = ({ hasError = false, ...props }) => (
  <textarea {...props} className={`${inputClasses(hasError)} ${props.className || ''}`} />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean }> = ({ hasError = false, children, ...props }) => (
  <select {...props} className={`${inputClasses(hasError)} ${props.className || ''}`}>{children}</select>
);


// --- Modal and Dialog Components ---
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    intervention: Intervencao | null;
    setToast: (toast: { message: string, type: ToastType } | null) => void;
}

const EquipamentoMultiSelect: React.FC<{
    selectedIds: number[];
    onChange: (id: number) => void;
}> = ({ selectedIds, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const listRef = useRef<HTMLUListElement>(null);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);
    
    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;
        const listEl = listRef.current;
        if (!listEl) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const options = Array.from(listEl.querySelectorAll('[role="option"]')) as HTMLLIElement[];
            if (!options.length) return;

            if (e.key === 'Escape') {
                setIsOpen(false);
                (wrapperRef.current?.querySelector('button') as HTMLButtonElement)?.focus();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextIndex = (focusedIndex + 1) % options.length;
                setFocusedIndex(nextIndex);
                options[nextIndex]?.focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const nextIndex = (focusedIndex - 1 + options.length) % options.length;
                setFocusedIndex(nextIndex);
                options[nextIndex]?.focus();
            } else if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                if (focusedIndex >= 0) {
                    onChange(MOCK_EQUIPAMENTO[focusedIndex].id);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);

    }, [isOpen, focusedIndex, onChange]);

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                type="button"
                className={`${inputClasses(false)} w-full text-left flex justify-between items-center`}
                onClick={() => { setIsOpen(!isOpen); setFocusedIndex(-1); }}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className="truncate">
                    {selectedIds.length === 0 ? "Nenhum" : `${selectedIds.length} selecionado(s)`}
                </span>
                <SelectorIcon className="w-4 h-4 text-gray-400" />
            </button>
            {isOpen && (
                <div className="absolute z-[10002] mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-[280px] overflow-y-auto">
                    <ul role="listbox" ref={listRef}>
                        {MOCK_EQUIPAMENTO.map((eq, index) => (
                            <li
                                key={eq.id}
                                id={`equip-option-${index}`}
                                className={`flex items-center space-x-3 p-3 cursor-pointer transition-colors duration-100 ${focusedIndex === index ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
                                onClick={() => onChange(eq.id)}
                                onMouseEnter={() => setFocusedIndex(index)}
                                role="option"
                                aria-selected={selectedIds.includes(eq.id)}
                                tabIndex={-1}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(eq.id)}
                                    readOnly
                                    className="h-4 w-4 rounded bg-white border-gray-300 text-blue-600 focus:ring-blue-600 pointer-events-none"
                                    style={{colorScheme: 'light'}}
                                />
                                <span className="text-sm text-gray-900">{eq.nome}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


const IntervencaoModal: React.FC<ModalProps> = ({isOpen, onClose, onSubmit, intervention, setToast}) => {
    const [formData, setFormData] = useState({
        titulo: intervention?.titulo || '',
        descricao: intervention?.descricao || '',
        estado: intervention?.estado || Status.Aberto,
        inicio: intervention?.inicio || '',
        fim: intervention?.fim || '',
        viaturaId: intervention?.viaturaId || undefined,
        responsavelId: intervention?.responsavelId || undefined,
        ajudanteId: intervention?.ajudanteId || undefined,
        clienteId: intervention?.clienteId || undefined,
        equipamentos: intervention?.equipamentos || [],
        morada: intervention?.morada || '',
        valorOrcamento: intervention?.valorOrcamento !== undefined ? String(intervention.valorOrcamento) : '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const formRef = useRef<HTMLFormElement>(null);
    
    const [isExiting, setIsExiting] = useState(false);
    
    const handleClose = useCallback(() => {
        setIsExiting(true);
        setTimeout(() => {
            onClose();
            setIsExiting(false);
        }, 200);
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;
        document.body.classList.add('modal-open');
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            document.body.classList.remove('modal-open');
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, handleClose]);

    const validate = useCallback(() => {
        const newErrors: Record<string, string> = {};
        if (!formData.titulo || formData.titulo.length < 2 || formData.titulo.length > 80) {
            newErrors.titulo = 'O título deve ter entre 2 e 80 caracteres.';
        }
        if (formData.descricao.length > 1000) {
            newErrors.descricao = 'A descrição não pode exceder 1000 caracteres.';
        }
        if (!formData.inicio) newErrors.inicio = 'A data de início é obrigatória.';
        if (!formData.fim) newErrors.fim = 'A data de fim é obrigatória.';
        if (formData.inicio && formData.fim && new Date(formData.fim) <= new Date(formData.inicio)) {
            newErrors.fim = 'A data de fim deve ser posterior à data de início.';
        }
        if (formData.valorOrcamento && Number(formData.valorOrcamento) < 0) {
            newErrors.valorOrcamento = 'O valor não pode ser negativo.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const submitData = {
                id: intervention?.id,
                ...formData,
                valorOrcamento: formData.valorOrcamento ? Number(formData.valorOrcamento) : undefined
            };
            onSubmit(submitData);
        } else {
            setToast({ message: 'Corrija os campos em destaque.', type: 'error' });
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumericId = ['viaturaId', 'responsavelId', 'ajudanteId', 'clienteId'].includes(name);
        const processedValue = isNumericId ? (value ? parseInt(value, 10) : undefined) : value;
        
        setFormData(prev => {
            const newData = { ...prev, [name]: processedValue };
            
            // Auto-fill address from client if not manually set yet (or override if user wants)
            if (name === 'clienteId') {
                const selectedClient = MOCK_CLIENTES.find(c => c.id === processedValue);
                if (selectedClient && selectedClient.morada) {
                    newData.morada = selectedClient.morada;
                }
            }

            // When start time changes, suggest an end time 2 hours later
            if (name === 'inicio' && value) {
                const startDate = new Date(value);
                if (!isNaN(startDate.getTime())) {
                    startDate.setHours(startDate.getHours() + 2);
                    // Format to 'YYYY-MM-DDTHH:mm', which is what datetime-local input expects
                    const suggestedEnd = startDate.toISOString().slice(0, 16);
                    newData.fim = suggestedEnd;
                }
            }
            
            return newData;
        });
    };

    const handleEquipamentoChange = (equipId: number) => {
        setFormData(prev => {
            const newEquipamentos = prev.equipamentos.includes(equipId)
                ? prev.equipamentos.filter(id => id !== equipId)
                : [...prev.equipamentos, equipId];
            return {...prev, equipamentos: newEquipamentos};
        });
    };

    if (!isOpen) return null;
    
    return (
        <div className={`modal-backdrop fixed inset-0 flex justify-center items-center p-4 transition-opacity duration-200 ${isExiting ? 'opacity-0' : 'opacity-100'}`} onClick={handleClose} aria-modal="true" role="dialog">
            <div className="modal w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-5 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">{intervention ? 'Editar Intervenção' : 'Criar nova Intervenção'}</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Fechar modal">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <form onSubmit={handleSubmit} id="intervention-form" ref={formRef} noValidate className="overflow-y-auto flex-grow p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                       <FormField label="Título" error={errors.titulo} className="sm:col-span-2">
                           <Input type="text" name="titulo" value={formData.titulo} onChange={handleChange} placeholder="ex: Inspeção técnica" hasError={!!errors.titulo} required />
                       </FormField>
                       <FormField label="Descrição" error={errors.descricao} className="sm:col-span-2">
                           <Textarea name="descricao" value={formData.descricao} onChange={handleChange} rows={3} placeholder="Detalhes sobre a intervenção..." hasError={!!errors.descricao} />
                       </FormField>
                       <FormField label="Estado" error={errors.estado}>
                            <Select name="estado" value={formData.estado} onChange={handleChange} hasError={!!errors.estado} required>
                                {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                            </Select>
                        </FormField>
                        <FormField label="Valor Orçamento (€)" error={errors.valorOrcamento}>
                           <Input 
                                type="number" 
                                step="0.01"
                                min="0"
                                name="valorOrcamento" 
                                value={formData.valorOrcamento} 
                                onChange={handleChange} 
                                placeholder="0.00" 
                                hasError={!!errors.valorOrcamento} 
                            />
                       </FormField>
                       
                        <FormField label="Início" error={errors.inicio}>
                           <Input type="datetime-local" name="inicio" value={formData.inicio} onChange={handleChange} hasError={!!errors.inicio} required style={{colorScheme: 'light'}} />
                       </FormField>
                       <FormField label="Fim" error={errors.fim}>
                           <Input type="datetime-local" name="fim" value={formData.fim} onChange={handleChange} hasError={!!errors.fim} min={formData.inicio} required style={{colorScheme: 'light'}} />
                       </FormField>
                       <FormField label="Cliente Associado" error={errors.clienteId}>
                           <Select name="clienteId" value={formData.clienteId || ''} onChange={handleChange} hasError={!!errors.clienteId}>
                               <option value="">Nenhum</option>
                               {MOCK_CLIENTES.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                           </Select>
                       </FormField>
                        <FormField label="Morada da Intervenção">
                           <Input 
                                type="text" 
                                name="morada" 
                                value={formData.morada} 
                                onChange={handleChange} 
                                placeholder="Morada completa" 
                            />
                       </FormField>
                       <FormField label="Viatura Associada" error={errors.viaturaId}>
                           <Select name="viaturaId" value={formData.viaturaId || ''} onChange={handleChange} hasError={!!errors.viaturaId}>
                               <option value="">Nenhuma</option>
                               {MOCK_VIATURAS.map(v => <option key={v.id} value={v.id}>{v.matricula} - {v.marca}</option>)}
                           </Select>
                       </FormField>
                       <FormField label="Atribuído a (Responsável)" error={errors.responsavelId}>
                           <Select name="responsavelId" value={formData.responsavelId || ''} onChange={handleChange} hasError={!!errors.responsavelId}>
                               <option value="">Ninguém</option>
                               {MOCK_EQUIPA.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                           </Select>
                       </FormField>
                       <FormField label="Ajudante (opcional)" error={errors.ajudanteId}>
                           <Select name="ajudanteId" value={formData.ajudanteId || ''} onChange={handleChange} hasError={!!errors.ajudanteId}>
                               <option value="">Ninguém</option>
                               {MOCK_EQUIPA.filter(m => m.id !== formData.responsavelId).map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                           </Select>
                       </FormField>
                       <div className="sm:col-span-2">
                           <FormField label="Equipamentos">
                                <EquipamentoMultiSelect 
                                    selectedIds={formData.equipamentos}
                                    onChange={handleEquipamentoChange}
                                />
                           </FormField>
                       </div>
                    </div>
                </form>
                <footer className="flex justify-end p-5 border-t border-gray-200 bg-gray-50 rounded-b-lg sticky bottom-0">
                    <button onClick={handleClose} type="button" className="px-5 py-2 text-sm font-semibold bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors duration-150 mr-3">Cancelar</button>
                    <button type="submit" form="intervention-form" className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed">
                        {intervention ? 'Guardar alterações' : 'Criar Intervenção'}
                    </button>
                </footer>
            </div>
        </div>
    )
};

// --- Send Report Modal ---
interface SendReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (email: string) => void;
    initialEmail?: string;
}

const SendReportModal: React.FC<SendReportModalProps> = ({ isOpen, onClose, onSend, initialEmail }) => {
    const [email, setEmail] = useState(initialEmail || '');
    const [selectedClientId, setSelectedClientId] = useState<number | ''>('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Auto-focus input
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
        if (initialEmail) {
            setEmail(initialEmail);
        }
    }, [isOpen, initialEmail]);

    const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const clientId = e.target.value ? parseInt(e.target.value) : '';
        setSelectedClientId(clientId);
        
        if (clientId) {
            const client = MOCK_CLIENTES.find(c => c.id === clientId);
            if (client && client.email) {
                setEmail(client.email);
            }
        }
    };

    const handleSend = () => {
        setIsLoading(true);
        // Simulate sending process
        setTimeout(() => {
            onSend(email);
            setIsLoading(false);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop fixed inset-0 flex justify-center items-center p-4 z-[10005]" onClick={onClose} aria-modal="true" role="dialog">
             <div className="modal w-full max-w-md" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Enviar Relatório</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Fechar modal"><XIcon className="w-5 h-5" /></button>
                </header>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email de Destino</label>
                        <div className="relative">
                            <input 
                                ref={inputRef}
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none bg-white text-gray-900"
                                placeholder="ex: cliente@email.com"
                            />
                             <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                <PaperPlaneIcon className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-3 text-xs text-gray-400 font-medium uppercase">OU</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Selecionar Cliente</label>
                        <div className="relative">
                             <select 
                                value={selectedClientId} 
                                onChange={handleClientChange}
                                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none appearance-none bg-white"
                            >
                                <option value="">Escolher da lista...</option>
                                {MOCK_CLIENTES.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.nome} {client.email ? `(${client.email})` : ''}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                <UsersIcon className="w-4 h-4" />
                            </div>
                        </div>
                         <p className="text-xs text-gray-500 mt-1">Ao selecionar um cliente, o email será preenchido automaticamente.</p>
                    </div>
                </div>
                 <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                    <button onClick={onClose} disabled={isLoading} className="px-4 py-2 text-sm font-semibold bg-white border border-gray-200 rounded-lg hover:bg-gray-100 mr-3 disabled:opacity-50">Cancelar</button>
                    <button 
                        onClick={handleSend} 
                        disabled={!email || isLoading} 
                        className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center min-w-[80px] justify-center"
                    >
                         {isLoading ? (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            'Enviar'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};


const DetailRow: React.FC<{ label: string; value: React.ReactNode; fullWidth?: boolean }> = ({ label, value, fullWidth }) => (
    <div className={`p-4 rounded-lg bg-gray-50 border border-gray-100 ${fullWidth ? 'sm:col-span-2' : ''}`}>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        <div className="text-gray-900 font-medium">{value}</div>
    </div>
);

const IntervencaoDetailModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    intervention: Intervencao | null;
    onStatusChange: (id: number, newStatus: Status) => void;
    setToast: (toast: { message: string, type: ToastType } | null) => void;
}> = ({ isOpen, onClose, intervention, onStatusChange, setToast }) => {
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        document.body.classList.add('modal-open');
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            document.body.classList.remove('modal-open');
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !intervention) return null;

    const getClienteName = (id?: number) => MOCK_CLIENTES.find(c => c.id === id)?.nome || '-';
    const getAjudanteName = (id?: number) => MOCK_EQUIPA.find(m => m.id === id)?.nome || '-';
    const getEquipamentosNames = (ids?: number[]) => {
        if (!ids || ids.length === 0) return 'Nenhum';
        return ids.map(id => MOCK_EQUIPAMENTO.find(e => e.id === id)?.nome).filter(Boolean).join(', ');
    };
    
    // Attempt to resolve client email for initial value
    const clientEmail = intervention.clienteId ? MOCK_CLIENTES.find(c => c.id === intervention.clienteId)?.email : undefined;

    const handleOpenEmailModal = () => {
        setIsEmailModalOpen(true);
    };

    const handleConfirmSend = (email: string) => {
        setIsEmailModalOpen(false);
        setToast({ message: `Relatório PDF enviado com sucesso para ${email}.`, type: 'success' });
    };

    const handleOpenNewPage = () => {
        const win = window.open('', '_blank');
        if (!win) return;
    
        const content = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Intervenção #${intervention.id}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <script>
                function startIntervention() {
                    const btn = document.getElementById('btn-start');
                    if(btn) {
                        if(confirm('Tem a certeza que deseja iniciar a intervenção?')) {
                            btn.innerText = 'Em Curso';
                            btn.className = 'bg-amber-500 text-white px-6 py-2 rounded-lg font-semibold cursor-default';
                            btn.disabled = true;
                            alert('Intervenção iniciada com sucesso às ' + new Date().toLocaleTimeString());
                        }
                    }
                }
              </script>
            </head>
            <body class="bg-gray-100 p-10 print:p-0 print:bg-white">
              <div class="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200 print:shadow-none print:border-none">
                <div class="border-b border-gray-200 pb-6 mb-6 flex justify-between items-start">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900 mb-2">${intervention.titulo}</h1>
                        <span class="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">#${intervention.id}</span>
                    </div>
                    <div class="text-right">
                        <span class="inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            intervention.estado === 'Aberto' ? 'bg-blue-100 text-blue-900' :
                            intervention.estado === 'Pendente' ? 'bg-amber-100 text-amber-900' :
                            'bg-gray-200 text-gray-700'
                        }">${intervention.estado}</span>
                    </div>
                </div>
    
                <div class="grid grid-cols-2 gap-6 mb-8">
                    <div class="col-span-2">
                        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Descrição</p>
                        <p class="text-gray-900">${intervention.descricao || '-'}</p>
                    </div>
                    <div>
                        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Início</p>
                        <p class="text-gray-900">${new Date(intervention.inicio).toLocaleString('pt-PT')}</p>
                    </div>
                    <div>
                        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Fim</p>
                        <p class="text-gray-900">${new Date(intervention.fim).toLocaleString('pt-PT')}</p>
                    </div>
                     <div>
                        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Cliente</p>
                        <p class="text-gray-900">${getClienteName(intervention.clienteId)}</p>
                    </div>
                    <div>
                        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Valor Orçamento</p>
                        <p class="text-gray-900">${new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(intervention.valorOrcamento || 0)}</p>
                    </div>
                     <div class="col-span-2">
                        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Morada</p>
                        <p class="text-gray-900">${intervention.morada || '-'}</p>
                    </div>
                     <div>
                        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Viatura</p>
                        <p class="text-gray-900">${intervention.viatura || '-'}</p>
                    </div>
                     <div>
                        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Responsável</p>
                        <p class="text-gray-900">${intervention.responsavel}</p>
                    </div>
                     <div>
                        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Ajudante</p>
                        <p class="text-gray-900">${getAjudanteName(intervention.ajudanteId)}</p>
                    </div>
                     <div class="col-span-2">
                        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Equipamentos</p>
                        <p class="text-gray-900">${getEquipamentosNames(intervention.equipamentos)}</p>
                    </div>
                </div>
                
                <div class="mt-8 pt-6 border-t border-gray-200 print:hidden text-center flex justify-center space-x-4">
                     <button id="btn-start" onclick="startIntervention()" class="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors">Iniciar Intervenção</button>
                     <button onclick="window.print()" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Imprimir Página</button>
                     <button onclick="window.close()" class="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Fechar</button>
                </div>
              </div>
            </body>
          </html>
        `;
        
        win.document.write(content);
        win.document.close();
    };

    return (
        <>
        <div className="modal-backdrop fixed inset-0 flex justify-center items-center p-4" onClick={onClose} aria-modal="true" role="dialog">
            <div className="modal w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-5 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Detalhes da Intervenção</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Fechar modal">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>
                <div className="overflow-y-auto flex-grow p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <DetailRow label="ID" value={`#${intervention.id}`} />
                       <DetailRow label="Estado" value={<StatusBadge status={intervention.estado} />} />
                       <DetailRow label="Título" value={intervention.titulo} fullWidth />
                       <DetailRow label="Descrição" value={intervention.descricao || '-'} fullWidth />
                       <DetailRow label="Valor Orçamento" value={formatCurrency(intervention.valorOrcamento)} />
                       <DetailRow label="Cliente" value={getClienteName(intervention.clienteId)} />
                       
                       <DetailRow label="Morada" fullWidth value={
                           intervention.morada ? (
                               <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(intervention.morada)}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center text-blue-600 hover:text-blue-800 group"
                                    title="Ver no Google Maps"
                                >
                                    <MapPinIcon className="w-4 h-4 mr-1.5 flex-shrink-0 text-gray-500 group-hover:text-blue-600 transition-colors" />
                                    <span className="truncate hover:underline">{intervention.morada}</span>
                                </a>
                           ) : (
                               <span className="text-gray-400">-</span>
                           )
                       } />

                       <DetailRow label="Início" value={formatDate(intervention.inicio)} />
                       <DetailRow label="Fim" value={formatDate(intervention.fim)} />
                       <DetailRow label="Viatura" value={intervention.viatura || '-'} />
                       <DetailRow label="Responsável" value={intervention.responsavel} />
                       <DetailRow label="Ajudante" value={getAjudanteName(intervention.ajudanteId)} />
                       <DetailRow label="Equipamentos" value={getEquipamentosNames(intervention.equipamentos)} fullWidth />
                    </div>
                </div>
                <footer className="flex justify-between items-center p-5 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                    <div className="flex space-x-3">
                         <button 
                            onClick={handleOpenEmailModal}
                            className="px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center"
                        >
                            <PaperPlaneIcon className="w-4 h-4 mr-2" />
                            Enviar Relatório
                        </button>
                    </div>
                    <div className="flex space-x-3">
                         <button 
                            onClick={handleOpenNewPage}
                            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                        >
                            <ExternalLinkIcon className="w-4 h-4 mr-2" />
                            Abrir em nova página
                        </button>
                        <button onClick={onClose} className="px-5 py-2 text-sm font-semibold bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">Fechar</button>
                    </div>
                </footer>
            </div>
        </div>
        
        {/* Render SendReportModal independently to avoid z-index nesting issues if handled via portals, but here we use simple conditional rendering with higher z-index */}
        <SendReportModal 
            isOpen={isEmailModalOpen}
            onClose={() => setIsEmailModalOpen(false)}
            onSend={handleConfirmSend}
            initialEmail={clientEmail}
        />
        </>
    );
};

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    isDeleting: boolean;
}

const ConfirmationDialog: React.FC<ConfirmDialogProps> = ({isOpen, onClose, onConfirm, title, message, isDeleting}) => {
    useEffect(() => {
        if (!isOpen) return;
        document.body.classList.add('modal-open');
        const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && !isDeleting && onClose();
        window.addEventListener('keydown', handleEsc);
        return () => {
            document.body.classList.remove('modal-open');
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose, isDeleting]);

    if(!isOpen) return null;

    return (
        <div className="modal-backdrop fixed inset-0 flex justify-center items-center p-4 transition-opacity duration-200" onClick={!isDeleting ? onClose : undefined} aria-modal="true" role="alertdialog">
            <div className="modal w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <p className="mt-2 text-sm text-gray-500">{message}</p>
                </div>
                <div className="flex justify-end space-x-3 bg-gray-50 px-6 py-4 rounded-b-lg border-t border-gray-200">
                    <button onClick={onClose} disabled={isDeleting} className="px-4 py-2 text-sm font-semibold bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">Cancelar</button>
                    <button onClick={onConfirm} disabled={isDeleting} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[95px]">
                         {isDeleting ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            'Eliminar'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
