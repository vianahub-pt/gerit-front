import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { MOCK_VIATURAS, MOCK_INTERVENCOES } from '../constants';
import { Viatura, ViaturaStatus, Status } from '../types';
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

const formatDate = (isoString: string) => new Date(isoString).toLocaleDateString('pt-PT');

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

// --- Validation Functions ---

const validateMatricula = (matricula: string) => {
    if (!matricula) return false;
    const upperMatricula = matricula.toUpperCase().replace(/-/g, '');
    const ptRegex = /^(?:[A-Z]{2}\d{2}[A-Z]{2}|\d{2}[A-Z]{2}\d{2}|[A-Z]{2}\d{2}\d{2}|\d{2}\d{2}[A-Z]{2})$/;
    return ptRegex.test(upperMatricula);
};
const validateAno = (ano?: number) => {
    if (ano === undefined || ano === null || String(ano).trim() === '') return true; // Optional field
    const currentYear = new Date().getFullYear();
    return ano >= 1980 && ano <= currentYear + 1;
}

// --- Page-Specific Components ---

// --- Add/Edit Modal Component ---
interface ViaturaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (viatura: Omit<Viatura, 'id' | 'criadoEm'> & { id?: number }) => void;
    viatura: Viatura | null;
    setToast: (toast: Toast | null) => void;
}

const ViaturaModal: React.FC<ViaturaModalProps> = ({ isOpen, onClose, onSave, viatura, setToast }) => {
    const [formData, setFormData] = useState({
        matricula: viatura?.matricula || '',
        marca: viatura?.marca || '',
        modelo: viatura?.modelo || '',
        ano: viatura?.ano || undefined,
        estado: viatura?.estado || ViaturaStatus.Ativo,
        notas: viatura?.notas || '',
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
        if (!validateMatricula(formData.matricula)) newErrors.matricula = 'Matrícula inválida. Use um formato PT válido (ex: AA-11-AA).';
        if (!validateAno(formData.ano)) newErrors.ano = `Ano inválido. Deve ser entre 1980 e ${new Date().getFullYear() + 1}.`;
        if (formData.notas.length > 1000) newErrors.notas = 'As notas não podem exceder 1000 caracteres.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave({ id: viatura?.id, ...formData, ano: formData.ano ? Number(formData.ano) : new Date().getFullYear() });
        } else {
            setToast({ message: 'Corrija os campos em destaque.', type: 'error' });
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'ano' && value ? Number(value) : value }));
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
                    <h2 className="text-xl font-bold text-gray-900">{viatura ? 'Editar Viatura' : 'Adicionar Nova Viatura'}</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600" aria-label="Fechar modal"><XIcon className="w-6 h-6" /></button>
                </header>
                <form onSubmit={handleSubmit} id="viatura-form" noValidate className="overflow-y-auto flex-grow p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Matrícula</label>
                        <input type="text" name="matricula" value={formData.matricula} onChange={handleChange} className={inputClasses(!!errors.matricula)} required />
                        {errors.matricula && <p className="text-xs text-red-600 mt-1">{errors.matricula}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Marca</label>
                        <input type="text" name="marca" value={formData.marca} onChange={handleChange} className={inputClasses(!!errors.marca)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Modelo</label>
                        <input type="text" name="modelo" value={formData.modelo} onChange={handleChange} className={inputClasses(!!errors.modelo)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Ano</label>
                        <input type="number" name="ano" value={formData.ano || ''} onChange={handleChange} className={inputClasses(!!errors.ano)} placeholder={String(new Date().getFullYear())} />
                        {errors.ano && <p className="text-xs text-red-600 mt-1">{errors.ano}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Estado</label>
                        <select name="estado" value={formData.estado} onChange={handleChange} className={inputClasses(!!errors.estado)}>
                            {Object.values(ViaturaStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Notas</label>
                        <textarea name="notas" value={formData.notas} onChange={handleChange} className={`${inputClasses(!!errors.notas)} min-h-[80px]`} maxLength={1000}></textarea>
                        {errors.notas && <p className="text-xs text-red-600 mt-1">{errors.notas}</p>}
                    </div>
                </form>
                <footer className="flex justify-end p-5 border-t border-gray-200 bg-gray-50 rounded-b-lg sticky bottom-0">
                    <button onClick={handleClose} type="button" className="px-5 py-2 text-sm font-semibold bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors duration-150 mr-3">Cancelar</button>
                    <button type="submit" form="viatura-form" className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-150">
                        {viatura ? 'Guardar alterações' : 'Adicionar Viatura'}
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
        }
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
                    <button
                        ref={cancelButtonRef}
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm font-semibold bg-white border border-gray-200 text-gray-900 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[95px]"
                    >
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
type SortKey = keyof Viatura;
type SortDirection = 'asc' | 'desc';

export const ViaturasPage: React.FC<{ setToast: (toast: Toast | null) => void }> = ({ setToast }) => {
    const [viaturas, setViaturas] = useState<Viatura[]>(MOCK_VIATURAS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingViatura, setEditingViatura] = useState<Viatura | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isImportModalOpen, setImportModalOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'matricula', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const filteredAndSortedData = useMemo(() => {
        let filtered = [...viaturas];

        if (debouncedSearchTerm) {
            const lowercasedTerm = debouncedSearchTerm.toLowerCase();
            filtered = filtered.filter(v => 
                v.matricula.toLowerCase().includes(lowercasedTerm) ||
                v.marca.toLowerCase().includes(lowercasedTerm) ||
                v.modelo.toLowerCase().includes(lowercasedTerm)
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
    }, [viaturas, debouncedSearchTerm, sortConfig]);

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
        setEditingViatura(null);
        setIsModalOpen(true);
    };

    const handleEdit = (viatura: Viatura) => {
        setEditingViatura(viatura);
        setIsModalOpen(true);
    };

    const handleDeleteRequest = (id: number) => {
        const viatura = viaturas.find(v => v.id === id);
        if (!viatura) return;

        if (viatura.estado === ViaturaStatus.EmManutencao) {
            setToast({ message: "Não é possível eliminar enquanto a viatura estiver ‘Em manutenção’.", type: 'error' });
            return;
        }

        const isInUse = MOCK_INTERVENCOES.some(i =>
            i.viaturaId === id && (i.estado === Status.Aberto || i.estado === Status.Pendente)
        );

        if (isInUse) {
            setToast({ message: "Esta viatura está associada a intervenções ativas. Remova a associação antes de eliminar.", type: 'error' });
            return;
        }

        setDeletingId(id);
        setIsConfirmOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!deletingId) return;
        setIsDeleting(true);
        setTimeout(() => {
            try {
                // Pagination check before deleting
                if (paginatedData.length === 1 && currentPage > 1) {
                    setCurrentPage(p => p - 1);
                }
                setViaturas(prev => prev.filter(v => v.id !== deletingId));
                setToast({ message: 'Viatura eliminada com sucesso.', type: 'success' });
            } catch (error) {
                setToast({ message: 'Não foi possível eliminar a viatura. Tente novamente.', type: 'error' });
            } finally {
                setIsDeleting(false);
                setIsConfirmOpen(false);
                setDeletingId(null);
            }
        }, 1000);
    };

    const handleSave = (data: Omit<Viatura, 'id' | 'criadoEm'> & { id?: number }) => {
        if (data.id) { // Editing
            setViaturas(prev => prev.map(v => v.id === data.id ? { ...v, ...data, ano: data.ano! } : v));
        } else { // Creating
            const newViatura: Viatura = {
                id: Date.now(),
                ...data,
                ano: data.ano!,
                criadoEm: new Date().toISOString(),
            };
            setViaturas(prev => [newViatura, ...prev]);
        }
        setIsModalOpen(false);
        setToast({ message: 'Viatura guardada com sucesso.', type: 'success' });
    };

    const handleImportData = (importedData: Partial<Viatura>[], options: { updateExisting: boolean }) => {
        let created = 0, updated = 0, skipped = 0;
        const updatedViaturas = [...viaturas];

        importedData.forEach((item, index) => {
            if (!item.matricula || !validateMatricula(item.matricula)) {
                skipped++;
                return;
            }
            if (options.updateExisting) {
                const existingIndex = updatedViaturas.findIndex(v => v.matricula.replace(/-/g, '') === item.matricula?.replace(/-/g, ''));
                if (existingIndex > -1) {
                    updatedViaturas[existingIndex] = { ...updatedViaturas[existingIndex], ...item };
                    updated++;
                } else {
                    const newViatura: Viatura = { id: Date.now() + index, criadoEm: new Date().toISOString(), ...item } as Viatura;
                    updatedViaturas.unshift(newViatura);
                    created++;
                }
            } else {
                 const newViatura: Viatura = { id: Date.now() + index, criadoEm: new Date().toISOString(), ...item } as Viatura;
                 updatedViaturas.unshift(newViatura);
                 created++;
            }
        });

        setViaturas(updatedViaturas);
        return { created, updated, skipped };
    };

    const importableColumns: ImportableColumn<Viatura>[] = [
        { key: 'matricula', label: 'Matrícula', required: true },
        { key: 'marca', label: 'Marca' },
        { key: 'modelo', label: 'Modelo' },
        { key: 'ano', label: 'Ano' },
        { key: 'estado', label: 'Estado' },
        { key: 'notas', label: 'Notas' },
    ];


    const columns: { header: string; accessor: SortKey; sortable: boolean }[] = [
        { header: 'Matrícula', accessor: 'matricula', sortable: true },
        { header: 'Marca', accessor: 'marca', sortable: true },
        { header: 'Modelo', accessor: 'modelo', sortable: true },
        { header: 'Estado', accessor: 'estado', sortable: true },
        { header: 'Criado em', accessor: 'criadoEm', sortable: true },
    ];

    const exportColumns: ExportColumn<Viatura>[] = [
        { header: 'ID', accessor: item => item.id },
        { header: 'Matrícula', accessor: item => item.matricula },
        { header: 'Marca', accessor: item => item.marca },
        { header: 'Modelo', accessor: item => item.modelo },
        { header: 'Ano', accessor: item => item.ano },
        { header: 'Estado', accessor: item => item.estado },
        { header: 'Notas', accessor: item => item.notas || '' },
        { header: 'Criado Em', accessor: item => formatDate(item.criadoEm) },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Viaturas</h1>
                    <p className="text-sm text-gray-500 mt-1">Gira a tua frota de viaturas.</p>
                </div>
                <div className="flex items-center gap-2 mt-4 sm:mt-0 self-start sm:self-center">
                    <TableActions
                        data={filteredAndSortedData}
                        columns={exportColumns}
                        entityName="Viaturas"
                        setToast={setToast}
                        onImportClick={() => setImportModalOpen(true)}
                    />
                    <button 
                        onClick={handleAdd} 
                        className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-150 ease-in-out flex items-center h-9"
                        aria-label="Adicionar nova viatura"
                    >
                        <PlusIcon className="w-5 h-5 mr-1.5 -ml-1" />
                        Adicionar Viatura
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-end mb-6">
                    <input
                        type="text"
                        placeholder="Pesquisar viaturas..."
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
                            {paginatedData.map((viatura, index) => (
                                <tr key={viatura.id} className={`transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-gray-100`}>
                                    <td className="p-4 text-sm text-gray-900 font-medium border-b border-gray-200">{viatura.matricula}</td>
                                    <td className="p-4 text-sm text-gray-900 border-b border-gray-200">{viatura.marca}</td>
                                    <td className="p-4 text-sm text-gray-900 border-b border-gray-200">{viatura.modelo}</td>
                                    <td className="p-4 text-sm text-gray-900 border-b border-gray-200"><StatusBadge status={viatura.estado} /></td>
                                    <td className="p-4 text-sm text-gray-900 border-b border-gray-200">{formatDate(viatura.criadoEm)}</td>
                                    <td className="p-4 border-b border-gray-200">
                                        <div className="flex space-x-3 justify-end">
                                            <button onClick={() => handleEdit(viatura)} className="text-gray-500 hover:text-gray-900 transition-colors" aria-label={`Editar viatura ${viatura.matricula}`}><PencilIcon className="w-[18px] h-[18px]"/></button>
                                            <button onClick={() => handleDeleteRequest(viatura.id)} className="text-gray-500 hover:text-red-700 transition-colors" aria-label={`Eliminar viatura ${viatura.matricula}`}><TrashIcon className="w-[18px] h-[18px]"/></button>
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
                        <h3 className="text-lg font-semibold text-gray-900">Sem viaturas ainda</h3>
                        <p className="text-sm text-gray-500 mt-1">Comece por adicionar a sua primeira viatura.</p>
                        <button onClick={handleAdd} className="mt-4 bg-transparent text-blue-600 font-semibold py-2 px-4 rounded-lg border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center mx-auto">
                            <PlusIcon className="w-5 h-5 mr-2 -ml-1" />
                            Adicionar Viatura
                        </button>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <ViaturaModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    viatura={editingViatura}
                    setToast={setToast}
                />
            )}

            <ConfirmationDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Viatura"
                message="Tem a certeza de que pretende eliminar esta viatura? Esta ação não pode ser revertida."
                isDeleting={isDeleting}
            />
             <ImportCsvModal 
                isOpen={isImportModalOpen}
                onClose={() => setImportModalOpen(false)}
                entityName="Viaturas"
                importableColumns={importableColumns}
                existingData={viaturas}
                onImport={handleImportData}
                setToast={setToast}
                uniqueKey="matricula"
            />
        </div>
    );
};