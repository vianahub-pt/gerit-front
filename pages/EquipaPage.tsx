import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { MOCK_EQUIPA } from '../constants';
import { MembroEquipa, Intervencao } from '../types';
import { Toast } from '../App';
import { 
    PencilIcon, 
    PlusIcon,
    XIcon,
    TrashIcon,
    ChevronUpIcon, 
    ChevronDownIcon, 
    SelectorIcon
} from '../components/Icons';
import { TableActions, ExportColumn } from '../components/TableActions';
import { StatusBadge } from '../components/DataTable';
import { ImportCsvModal, ImportableColumn } from '../components/ImportCsvModal';


// --- Helper Functions & Hooks ---

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

// --- Validation Functions ---

const validateEmail = (email: string) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validateTelefone = (telefone: string) => !telefone || /^(\+351)?[ ]?\d{3}[ ]?\d{3}[ ]?\d{3}$/.test(telefone);


// --- Page-Specific Components ---

// --- Add/Edit Modal Component ---
interface PessoaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (pessoa: Omit<MembroEquipa, 'id'> & { id?: number }) => void;
    pessoa: MembroEquipa | null;
    setToast: (toast: Toast | null) => void;
}

const PessoaModal: React.FC<PessoaModalProps> = ({ isOpen, onClose, onSave, pessoa, setToast }) => {
    const [formData, setFormData] = useState({
        nome: pessoa?.nome || '',
        funcao: pessoa?.funcao || '',
        telefone: pessoa?.telefone || '',
        email: pessoa?.email || '',
        ativo: pessoa ? pessoa.ativo : true,
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
        if (formData.nome.length < 2 || formData.nome.length > 100) newErrors.nome = 'O nome deve ter entre 2 e 100 caracteres.';
        if (!validateTelefone(formData.telefone)) newErrors.telefone = 'Telefone inválido.';
        if (!validateEmail(formData.email)) newErrors.email = 'Email inválido.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave({ id: pessoa?.id, ...formData });
        } else {
            setToast({ message: 'Corrija os campos em destaque.', type: 'error' });
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleAtivoToggle = () => {
        setFormData(prev => ({ ...prev, ativo: !prev.ativo }));
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
                    <h2 className="text-xl font-bold text-gray-900">{pessoa ? 'Editar Pessoa' : 'Adicionar Nova Pessoa'}</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600" aria-label="Fechar modal"><XIcon className="w-6 h-6" /></button>
                </header>
                <form onSubmit={handleSubmit} id="pessoa-form" noValidate className="overflow-y-auto flex-grow p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Nome</label>
                        <input type="text" name="nome" value={formData.nome} onChange={handleChange} className={inputClasses(!!errors.nome)} required />
                        {errors.nome && <p className="text-xs text-red-600 mt-1">{errors.nome}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Função</label>
                        <input type="text" name="funcao" placeholder="ex: Mecânico, Gestor" value={formData.funcao} onChange={handleChange} className={inputClasses(!!errors.funcao)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Telefone</label>
                        <input type="tel" name="telefone" value={formData.telefone} onChange={handleChange} className={inputClasses(!!errors.telefone)} />
                        {errors.telefone && <p className="text-xs text-red-600 mt-1">{errors.telefone}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClasses(!!errors.email)} />
                        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Ativo</label>
                        <label htmlFor="ativo-toggle" className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input type="checkbox" id="ativo-toggle" className="sr-only" checked={formData.ativo} onChange={handleAtivoToggle} />
                                <div className="block bg-gray-200 w-14 h-8 rounded-full"></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.ativo ? 'transform translate-x-6 !bg-blue-600' : ''}`}></div>
                            </div>
                            <div className="ml-3 text-gray-900 font-medium text-sm">
                                {formData.ativo ? 'Ativo' : 'Inativo'}
                            </div>
                        </label>
                    </div>
                </form>
                <footer className="flex justify-end p-5 border-t border-gray-200 bg-gray-50 rounded-b-lg sticky bottom-0">
                    <button onClick={handleClose} type="button" className="px-5 py-2 text-sm font-semibold bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors duration-150 mr-3">Cancelar</button>
                    <button type="submit" form="pessoa-form" className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-150">
                        {pessoa ? 'Guardar alterações' : 'Adicionar Pessoa'}
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

const ConfirmationDialog: React.FC<ConfirmDialogProps> = ({ isOpen, onClose, onConfirm, title, message, isDeleting }) => {
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

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop fixed inset-0 flex justify-center items-center p-4 transition-opacity duration-200" onClick={!isDeleting ? onClose : undefined} aria-modal="true" role="alertdialog">
            <div className="modal w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <p className="mt-2 text-sm text-gray-500">{message}</p>
                </div>
                <div className="flex justify-end space-x-3 bg-gray-50 px-6 py-4 rounded-b-lg border-t border-gray-200">
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
type SortKey = keyof MembroEquipa;
type SortDirection = 'asc' | 'desc';

interface EquipaPageProps {
    setToast: (toast: Toast | null) => void;
    intervencoes: Intervencao[];
}

export const EquipaPage: React.FC<EquipaPageProps> = ({ setToast, intervencoes }) => {
    const [membros, setMembros] = useState<MembroEquipa[]>(MOCK_EQUIPA);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPessoa, setEditingPessoa] = useState<MembroEquipa | null>(null);
    const [isImportModalOpen, setImportModalOpen] = useState(false);

    // Deletion state
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'nome', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const filteredAndSortedData = useMemo(() => {
        let filtered = [...membros];

        if (debouncedSearchTerm) {
            const lowercasedTerm = debouncedSearchTerm.toLowerCase();
            filtered = filtered.filter(m => 
                m.nome.toLowerCase().includes(lowercasedTerm) ||
                m.funcao.toLowerCase().includes(lowercasedTerm) ||
                m.email.toLowerCase().includes(lowercasedTerm) ||
                m.telefone.toLowerCase().includes(lowercasedTerm)
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
    }, [membros, debouncedSearchTerm, sortConfig]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
        return filteredAndSortedData.slice(startIndex, startIndex + ROWS_PER_PAGE);
    }, [filteredAndSortedData, currentPage]);
    
    const totalPages = Math.ceil(filteredAndSortedData.length / ROWS_PER_PAGE);

    const handleSort = (key: SortKey) => {
        let direction: SortDirection = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: SortKey) => {
        if (sortConfig.key !== key) return <SelectorIcon className="w-4 h-4 ml-1.5 text-gray-400" />;
        if (sortConfig.direction === 'asc') return <ChevronUpIcon className="w-4 h-4 ml-1.5 text-gray-900" />;
        return <ChevronDownIcon className="w-4 h-4 ml-1.5 text-gray-900" />;
    };
    
    const handleAdd = () => {
        setEditingPessoa(null);
        setIsModalOpen(true);
    };

    const handleEdit = (pessoa: MembroEquipa) => {
        setEditingPessoa(pessoa);
        setIsModalOpen(true);
    };

    const handleDeleteRequest = (id: number) => {
        // Check if member is responsible or helper in any intervention
        // Added explicit check for undefined to avoid matching newly created items improperly
        const isInUse = intervencoes.some(i => 
            (i.responsavelId !== undefined && i.responsavelId === id) || 
            (i.ajudanteId !== undefined && i.ajudanteId === id)
        );
        
        if (isInUse) {
            setToast({ message: "Não é possível eliminar este membro da equipa pois tem intervenções associadas.", type: 'error' });
            return;
        }
        setDeletingId(id);
        setIsConfirmOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (deletingId) {
            setIsDeleting(true);
            setTimeout(() => {
                try {
                    if (paginatedData.length === 1 && currentPage > 1) {
                        setCurrentPage(p => p - 1);
                    }
                    setMembros(prev => prev.filter(m => m.id !== deletingId));
                    setToast({ message: 'Membro da equipa eliminado com sucesso.', type: 'success' });
                } catch (error) {
                    setToast({ message: 'Erro ao eliminar membro da equipa.', type: 'error' });
                } finally {
                    setIsDeleting(false);
                    setIsConfirmOpen(false);
                    setDeletingId(null);
                }
            }, 500);
        }
    };

    const handleSave = (data: Omit<MembroEquipa, 'id'> & { id?: number }) => {
        if (data.id) { // Editing
            setMembros(prev => prev.map(m => m.id === data.id ? { ...m, ...data } : m));
        } else { // Creating
            const newPessoa: MembroEquipa = {
                id: Date.now(),
                ...data,
            };
            setMembros(prev => [newPessoa, ...prev]);
        }
        setIsModalOpen(false);
        setToast({ message: 'Pessoa guardada com sucesso.', type: 'success' });
    };

    const handleImportData = (importedData: Partial<MembroEquipa>[], options: { updateExisting: boolean }) => {
        let created = 0, updated = 0, skipped = 0;
        const updatedMembros = [...membros];

        importedData.forEach((item, index) => {
            if (!item.nome || !item.email) {
                skipped++;
                return;
            }
            if (options.updateExisting && item.email) {
                const existingIndex = updatedMembros.findIndex(m => m.email && m.email.toLowerCase() === item.email?.toLowerCase());
                if (existingIndex > -1) {
                    updatedMembros[existingIndex] = { ...updatedMembros[existingIndex], ...item };
                    updated++;
                } else {
                    const newMembro: MembroEquipa = { id: Date.now() + index, ...item } as MembroEquipa;
                    updatedMembros.unshift(newMembro);
                    created++;
                }
            } else {
                 const newMembro: MembroEquipa = { id: Date.now() + index, ...item } as MembroEquipa;
                 updatedMembros.unshift(newMembro);
                 created++;
            }
        });

        setMembros(updatedMembros);
        return { created, updated, skipped };
    };

    const importableColumns: ImportableColumn<MembroEquipa>[] = [
        { key: 'nome', label: 'Nome', required: true },
        { key: 'funcao', label: 'Função' },
        { key: 'email', label: 'Email', required: true },
        { key: 'telefone', label: 'Telefone' },
        { key: 'ativo', label: 'Ativo (true/false)' },
    ];

    const columns: { header: string; accessor: SortKey; sortable: boolean }[] = [
        { header: 'Nome', accessor: 'nome', sortable: true },
        { header: 'Função', accessor: 'funcao', sortable: true },
        { header: 'Telefone', accessor: 'telefone', sortable: true },
        { header: 'Email', accessor: 'email', sortable: true },
        { header: 'Ativo', accessor: 'ativo', sortable: true },
    ];

    const exportColumns: ExportColumn<MembroEquipa>[] = [
        { header: 'ID', accessor: item => item.id },
        { header: 'Nome', accessor: item => item.nome },
        { header: 'Função', accessor: item => item.funcao },
        { header: 'Telefone', accessor: item => item.telefone },
        { header: 'Email', accessor: item => item.email },
        { header: 'Ativo', accessor: item => item.ativo ? 'Sim' : 'Não' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Equipa</h1>
                    <p className="text-sm text-gray-500 mt-1">Gira os membros da tua equipa e os seus contactos.</p>
                </div>
                <div className="flex items-center gap-2 mt-4 sm:mt-0 self-start sm:self-center">
                    <TableActions
                        data={filteredAndSortedData}
                        columns={exportColumns}
                        entityName="Equipa"
                        setToast={setToast}
                        onImportClick={() => setImportModalOpen(true)}
                    />
                    <button 
                        onClick={handleAdd} 
                        className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-150 ease-in-out flex items-center h-9"
                        aria-label="Adicionar novo membro da equipa"
                    >
                        <PlusIcon className="w-5 h-5 mr-2 -ml-1" />
                        Adicionar Pessoa
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-end mb-6">
                    <input
                        type="text"
                        placeholder="Pesquisar na equipa..."
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
                            {paginatedData.map((membro, index) => (
                                <tr key={membro.id} className={`transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-gray-100`}>
                                    <td className="p-4 text-sm text-gray-900 font-medium border-b border-gray-200">{membro.nome}</td>
                                    <td className="p-4 text-sm text-gray-900 border-b border-gray-200">{membro.funcao}</td>
                                    <td className="p-4 text-sm text-gray-900 border-b border-gray-200">{membro.telefone}</td>
                                    <td className="p-4 text-sm text-gray-900 border-b border-gray-200">{membro.email}</td>
                                    <td className="p-4 text-sm text-gray-900 border-b border-gray-200"><StatusBadge status={membro.ativo ? 'Ativo' : 'Inativo'} /></td>
                                    <td className="p-4 border-b border-gray-200">
                                        <div className="flex space-x-3 justify-end">
                                            <button onClick={() => handleEdit(membro)} className="text-gray-500 hover:text-gray-900 transition-colors" aria-label={`Editar ${membro.nome}`}><PencilIcon className="w-[18px] h-[18px]"/></button>
                                            <button onClick={() => handleDeleteRequest(membro.id)} className="text-gray-500 hover:text-red-700 transition-colors" aria-label={`Eliminar ${membro.nome}`}><TrashIcon className="w-[18px] h-[18px]"/></button>
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
                        <h3 className="text-lg font-semibold text-gray-900">Sem membros na equipa</h3>
                        <p className="text-sm text-gray-500 mt-1">Comece por adicionar a primeira pessoa.</p>
                        <button onClick={handleAdd} className="mt-4 bg-transparent text-blue-600 font-semibold py-2 px-4 rounded-lg border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center mx-auto">
                            <PlusIcon className="w-5 h-5 mr-2 -ml-1" />
                            Adicionar Pessoa
                        </button>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <PessoaModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    pessoa={editingPessoa}
                    setToast={setToast}
                />
            )}
            <ImportCsvModal 
                isOpen={isImportModalOpen}
                onClose={() => setImportModalOpen(false)}
                entityName="Membros da Equipa"
                importableColumns={importableColumns}
                existingData={membros}
                onImport={handleImportData}
                setToast={setToast}
                uniqueKey="email"
            />
             <ConfirmationDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Membro da Equipa"
                message="Tem a certeza de que pretende eliminar este membro da equipa? Esta ação não pode ser revertida."
                isDeleting={isDeleting}
            />
        </div>
    );
};