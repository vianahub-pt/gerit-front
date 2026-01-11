import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { MOCK_EQUIPAMENTO, MOCK_INTERVENCOES } from '../constants';
import { Equipamento, EquipamentoStatus, Status } from '../types';
import { Toast } from '../App';
import { 
    PencilIcon,
    TrashIcon, 
    PlusIcon,
    XIcon,
    ChevronUpIcon, 
    ChevronDownIcon, 
    SelectorIcon
} from '../components/Icons';
import { TableActions, ExportColumn } from '../components/TableActions';
import { StatusBadge } from '../components/DataTable';
import { ImportCsvModal, ImportableColumn } from '../components/ImportCsvModal';


// --- Helper Functions & Hooks ---

const formatDate = (isoString: string) => new Date(isoString).toLocaleDateString('pt-PT');

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

// --- Page-Specific Components ---

// --- Add/Edit Modal Component ---
interface EquipamentoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (equipamento: Omit<Equipamento, 'id' | 'criadoEm'> & { id?: number }) => void;
    equipamento: Equipamento | null;
    setToast: (toast: Toast | null) => void;
    equipamentos: Equipamento[];
}

const EquipamentoModal: React.FC<EquipamentoModalProps> = ({ isOpen, onClose, onSave, equipamento, setToast, equipamentos }) => {
    const [formData, setFormData] = useState({
        nome: equipamento?.nome || '',
        tipo: equipamento?.tipo || '',
        numeroSerie: equipamento?.numeroSerie || '',
        estado: equipamento?.estado || EquipamentoStatus.Disponivel,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
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
        if (formData.nome.length < 2 || formData.nome.length > 120) {
            newErrors.nome = 'O nome deve ter entre 2 e 120 caracteres.';
        }
        if (formData.numeroSerie) {
            const isDuplicate = equipamentos.some(
                eq => eq.numeroSerie.toLowerCase() === formData.numeroSerie.toLowerCase() && eq.id !== equipamento?.id
            );
            if (isDuplicate) {
                newErrors.numeroSerie = 'Número de série já existente.';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, equipamentos, equipamento]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave({ id: equipamento?.id, ...formData });
        } else {
            setToast({ message: 'Corrija os campos em destaque.', type: 'error' });
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    if (!isOpen) return null;

    const inputClasses = (hasError: boolean) =>
      `h-10 bg-white text-gray-900 placeholder-gray-400 mt-1 block w-full border ${
        hasError ? 'border-red-500' : 'border-gray-200'
      } rounded-lg shadow-sm p-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors duration-150`;

    return (
        <div className={`modal-backdrop fixed inset-0 flex justify-center items-center p-4 transition-opacity duration-200 ${isExiting ? 'opacity-0' : 'opacity-100'}`} onClick={handleClose} aria-modal="true" role="dialog">
            <div className="modal w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-5 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">{equipamento ? 'Editar Equipamento' : 'Adicionar Equipamento'}</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600" aria-label="Fechar modal"><XIcon className="w-6 h-6" /></button>
                </header>
                <form onSubmit={handleSubmit} id="equipamento-form" noValidate className="overflow-y-auto flex-grow p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Nome</label>
                        <input type="text" name="nome" value={formData.nome} onChange={handleChange} className={inputClasses(!!errors.nome)} required />
                        {errors.nome && <p className="text-xs text-red-600 mt-1">{errors.nome}</p>}
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-900">Tipo</label>
                        <input type="text" name="tipo" value={formData.tipo} onChange={handleChange} className={inputClasses(!!errors.tipo)} placeholder="ex: Ferramenta Elétrica" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Nº de Série</label>
                        <input type="text" name="numeroSerie" value={formData.numeroSerie} onChange={handleChange} className={inputClasses(!!errors.numeroSerie)} />
                        {errors.numeroSerie && <p className="text-xs text-red-600 mt-1">{errors.numeroSerie}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Estado</label>
                         <select name="estado" value={formData.estado} onChange={handleChange} className={inputClasses(!!errors.estado)}>
                            {Object.values(EquipamentoStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </form>
                <footer className="flex justify-end p-5 border-t border-gray-200 bg-gray-50 rounded-b-lg sticky bottom-0">
                    <button onClick={handleClose} type="button" className="px-5 py-2 text-sm font-semibold bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors duration-150 mr-3">Cancelar</button>
                    <button type="submit" form="equipamento-form" className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-150">
                        {equipamento ? 'Guardar alterações' : 'Adicionar Equipamento'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

// --- Confirmation Dialog ---
interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    isDeleting: boolean;
}

const ConfirmationDialog: React.FC<ConfirmDialogProps> = ({isOpen, onClose, onConfirm, title, message, isDeleting}) => {
    const cancelButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        document.body.classList.add('modal-open');
        cancelButtonRef.current?.focus();
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
                <div className="flex justify-end space-x-3 bg-gray-50 px-6 py-4 rounded-b-lg">
                    <button ref={cancelButtonRef} onClick={onClose} disabled={isDeleting} className="px-4 py-2 text-sm font-semibold bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50">Cancelar</button>
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

// --- Main Page Component ---

const ROWS_PER_PAGE = 10;
type SortKey = keyof Equipamento;
type SortDirection = 'asc' | 'desc';

export const EquipamentoPage: React.FC<{ setToast: (toast: Toast | null) => void }> = ({ setToast }) => {
    const [equipamentos, setEquipamentos] = useState<Equipamento[]>(MOCK_EQUIPAMENTO);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEquipamento, setEditingEquipamento] = useState<Equipamento | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isImportModalOpen, setImportModalOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'nome', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const filteredAndSortedData = useMemo(() => {
        let filtered = [...equipamentos];
        if (debouncedSearchTerm) {
            const lowercasedTerm = debouncedSearchTerm.toLowerCase();
            filtered = filtered.filter(e => 
                e.nome.toLowerCase().includes(lowercasedTerm) ||
                e.tipo.toLowerCase().includes(lowercasedTerm) ||
                e.numeroSerie.toLowerCase().includes(lowercasedTerm)
            );
        }

        filtered.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [equipamentos, debouncedSearchTerm, sortConfig]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
        return filteredAndSortedData.slice(startIndex, startIndex + ROWS_PER_PAGE);
    }, [filteredAndSortedData, currentPage]);
    
    const totalPages = Math.ceil(filteredAndSortedData.length / ROWS_PER_PAGE);

    const handleSort = (key: SortKey) => {
        setSortConfig(prev => ({ key, direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    };

    const getSortIcon = (key: SortKey) => {
        if (sortConfig.key !== key) return <SelectorIcon className="w-4 h-4 ml-1.5 text-gray-400" />;
        return sortConfig.direction === 'asc' ? <ChevronUpIcon className="w-4 h-4 ml-1.5 text-gray-900" /> : <ChevronDownIcon className="w-4 h-4 ml-1.5 text-gray-900" />;
    };
    
    const handleAdd = () => {
        setEditingEquipamento(null);
        setIsModalOpen(true);
    };

    const handleEdit = (equipamento: Equipamento) => {
        setEditingEquipamento(equipamento);
        setIsModalOpen(true);
    };
    
    const handleDeleteRequest = (id: number) => {
        const equipamento = equipamentos.find(e => e.id === id);
        if (!equipamento) return;

        if (equipamento.estado === EquipamentoStatus.EmUso) {
            setToast({ message: "Não é possível eliminar enquanto o equipamento estiver ‘Em uso’. Altere o estado ou desassocie-o primeiro.", type: 'error' });
            return;
        }

        const isInUseInIntervention = MOCK_INTERVENCOES.some(i => 
            i.equipamentos?.includes(id) && (i.estado === Status.Aberto || i.estado === Status.Pendente)
        );

        if (isInUseInIntervention) {
            setToast({ message: "Este equipamento está associado a intervenções ativas. Remova a associação antes de eliminar.", type: 'error' });
            return;
        }

        setDeletingId(id);
        setIsConfirmOpen(true);
    };
    
    const confirmDelete = () => {
        if (!deletingId) return;
        setIsDeleting(true);
        setTimeout(() => {
             try {
                if (paginatedData.length === 1 && currentPage > 1) {
                    setCurrentPage(p => p - 1);
                }
                setEquipamentos(prev => prev.filter(e => e.id !== deletingId));
                setToast({ message: 'Equipamento eliminado com sucesso.', type: 'success' });
             } catch (error) {
                 setToast({ message: 'Não foi possível eliminar o equipamento.', type: 'error' });
             } finally {
                setIsDeleting(false);
                setIsConfirmOpen(false);
                setDeletingId(null);
             }
        }, 1000);
    }

    const handleSave = (data: Omit<Equipamento, 'id' | 'criadoEm'> & { id?: number }) => {
        if (data.id) {
            setEquipamentos(prev => prev.map(e => e.id === data.id ? { ...e, ...data } : e));
        } else {
            const newEquipamento: Equipamento = { id: Date.now(), ...data, criadoEm: new Date().toISOString() };
            setEquipamentos(prev => [newEquipamento, ...prev]);
        }
        setIsModalOpen(false);
        setToast({ message: 'Equipamento guardado com sucesso.', type: 'success' });
    };

    const handleImportData = (importedData: Partial<Equipamento>[], options: { updateExisting: boolean }) => {
        let created = 0, updated = 0, skipped = 0;
        const updatedEquipamentos = [...equipamentos];

        importedData.forEach((item, index) => {
            if (!item.nome) {
                skipped++;
                return;
            }
            if (options.updateExisting && item.numeroSerie) {
                const existingIndex = updatedEquipamentos.findIndex(eq => eq.numeroSerie && eq.numeroSerie.toLowerCase() === item.numeroSerie?.toLowerCase());
                if (existingIndex > -1) {
                    updatedEquipamentos[existingIndex] = { ...updatedEquipamentos[existingIndex], ...item };
                    updated++;
                } else {
                    const newEquipamento: Equipamento = { id: Date.now() + index, criadoEm: new Date().toISOString(), ...item } as Equipamento;
                    updatedEquipamentos.unshift(newEquipamento);
                    created++;
                }
            } else {
                 const newEquipamento: Equipamento = { id: Date.now() + index, criadoEm: new Date().toISOString(), ...item } as Equipamento;
                 updatedEquipamentos.unshift(newEquipamento);
                 created++;
            }
        });

        setEquipamentos(updatedEquipamentos);
        return { created, updated, skipped };
    };

    const importableColumns: ImportableColumn<Equipamento>[] = [
        { key: 'nome', label: 'Nome', required: true },
        { key: 'tipo', label: 'Tipo' },
        { key: 'numeroSerie', label: 'Nº de Série' },
        { key: 'estado', label: 'Estado' },
    ];

    const columns: { header: string; accessor: SortKey; sortable: boolean }[] = [
        { header: 'Nome', accessor: 'nome', sortable: true },
        { header: 'Tipo', accessor: 'tipo', sortable: true },
        { header: 'Nº de Série', accessor: 'numeroSerie', sortable: true },
        { header: 'Estado', accessor: 'estado', sortable: true },
        { header: 'Criado Em', accessor: 'criadoEm', sortable: true },
    ];

    const exportColumns: ExportColumn<Equipamento>[] = [
        { header: 'ID', accessor: item => item.id },
        { header: 'Nome', accessor: item => item.nome },
        { header: 'Tipo', accessor: item => item.tipo },
        { header: 'Nº de Série', accessor: item => item.numeroSerie },
        { header: 'Estado', accessor: item => item.estado },
        { header: 'Criado Em', accessor: item => formatDate(item.criadoEm) },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Equipamento</h1>
                    <p className="text-sm text-gray-500 mt-1">Gira todo o teu equipamento e ferramentas.</p>
                </div>
                 <div className="flex items-center gap-2 mt-4 sm:mt-0 self-start sm:self-center">
                    <TableActions
                        data={filteredAndSortedData}
                        columns={exportColumns}
                        entityName="Equipamento"
                        setToast={setToast}
                        onImportClick={() => setImportModalOpen(true)}
                    />
                    <button onClick={handleAdd} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-150 ease-in-out flex items-center h-9">
                        <PlusIcon className="w-5 h-5 mr-2 -ml-1" />
                        Adicionar Equipamento
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-end mb-6">
                    <input
                        type="text"
                        placeholder="Pesquisar equipamento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-10 w-full md:w-72 pl-4 pr-4 py-2 bg-white text-gray-900 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none placeholder-gray-400 transition-colors"
                    />
                </div>

                {filteredAndSortedData.length > 0 ? (
                <>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200">
                                {columns.map(col => (
                                    <th key={col.accessor} className="p-4 text-sm font-semibold text-gray-500 uppercase bg-white" onClick={() => col.sortable && handleSort(col.accessor)}>
                                        <div className="flex items-center cursor-pointer select-none">
                                            {col.header}
                                            {col.sortable && getSortIcon(col.accessor)}
                                        </div>
                                    </th>
                                ))}
                                <th className="p-4 text-sm font-semibold text-gray-500 uppercase text-right bg-white">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((equipamento, index) => (
                                <tr key={equipamento.id} className={`transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-gray-100`}>
                                    <td className="p-4 text-sm text-gray-900 font-medium border-b border-gray-200">{equipamento.nome}</td>
                                    <td className="p-4 text-sm text-gray-900 border-b border-gray-200">{equipamento.tipo}</td>
                                    <td className="p-4 text-sm text-gray-900 border-b border-gray-200">{equipamento.numeroSerie}</td>
                                    <td className="p-4 text-sm text-gray-900 border-b border-gray-200"><StatusBadge status={equipamento.estado} /></td>
                                    <td className="p-4 text-sm text-gray-900 border-b border-gray-200">{formatDate(equipamento.criadoEm)}</td>
                                    <td className="p-4 border-b border-gray-200">
                                        <div className="flex space-x-3 justify-end">
                                            <button onClick={() => handleEdit(equipamento)} className="text-gray-500 hover:text-gray-900 transition-colors" aria-label={`Editar ${equipamento.nome}`}><PencilIcon className="w-[18px] h-[18px]"/></button>
                                            <button onClick={() => handleDeleteRequest(equipamento.id)} className="text-gray-500 hover:text-red-700 transition-colors" aria-label={`Eliminar ${equipamento.nome}`}><TrashIcon className="w-[18px] h-[18px]"/></button>
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
                        <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="px-3 py-1.5 text-sm font-medium bg-white border border-gray-200 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Anterior</button>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="px-3 py-1.5 text-sm font-medium bg-white border border-gray-200 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Próxima</button>
                    </div>
                </div>
                </>
                ) : (
                    <div className="text-center p-12 border-2 border-dashed border-gray-200 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900">Sem equipamento ainda</h3>
                        <p className="text-sm text-gray-500 mt-1">Comece por adicionar o seu primeiro equipamento.</p>
                        <button onClick={handleAdd} className="mt-4 bg-transparent text-blue-600 font-semibold py-2 px-4 rounded-lg border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center mx-auto">
                            <PlusIcon className="w-5 h-5 mr-2 -ml-1" />
                            Adicionar Equipamento
                        </button>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <EquipamentoModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    equipamento={editingEquipamento}
                    setToast={setToast}
                    equipamentos={equipamentos}
                />
            )}
            
            <ConfirmationDialog 
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Eliminar Equipamento"
                message="Tem a certeza de que pretende eliminar este equipamento?"
                isDeleting={isDeleting}
            />
            <ImportCsvModal 
                isOpen={isImportModalOpen}
                onClose={() => setImportModalOpen(false)}
                entityName="Equipamentos"
                importableColumns={importableColumns}
                existingData={equipamentos}
                onImport={handleImportData}
                setToast={setToast}
                uniqueKey="numeroSerie"
            />
        </div>
    );
};