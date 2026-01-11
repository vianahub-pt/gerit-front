import React, { useState, useEffect, useMemo, useCallback, ChangeEvent } from 'react';
import { XIcon, UploadIcon, CheckCircleIcon, InfoIcon, ErrorIcon } from './Icons';
import { Toast } from '../App';

export interface ImportableColumn<T> {
  key: keyof T;
  label: string;
  required?: boolean;
}

interface ImportCsvModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  entityName: string;
  importableColumns: ImportableColumn<T>[];
  existingData: T[];
  uniqueKey: keyof T;
  onImport: (data: Partial<T>[], options: { updateExisting: boolean }) => { created: number; updated: number; skipped: number };
  setToast: (toast: Toast | null) => void;
}

type Step = 1 | 2 | 3 | 4;
type Delimiter = ',' | ';' | '\t';
// FIX: Made the Mapping type generic to resolve "Cannot find name 'T'" error.
type Mapping<T> = { [key: number]: keyof T | 'ignore' };

const STEP_TITLES = {
  1: 'Carregar Ficheiro',
  2: 'Mapear Colunas',
  3: 'Confirmar Importação',
  4: 'Concluído'
};

const parseCsvRow = (row: string, delimiter: Delimiter): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
            if (inQuotes && row[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === delimiter && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result.map(val => val.trim().replace(/^"|"$/g, ''));
};

export function ImportCsvModal<T extends { id: number | string }>({
  isOpen, onClose, entityName, importableColumns, existingData, uniqueKey, onImport, setToast
}: ImportCsvModalProps<T>) {
  
  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [delimiter, setDelimiter] = useState<Delimiter>(';');
  const [headers, setHeaders] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<string[][]>([]);
  const [mappings, setMappings] = useState<Mapping<T>>({});
  const [importOptions, setImportOptions] = useState({ updateExisting: true });
  const [summary, setSummary] = useState({ toCreate: 0, toUpdate: 0, toSkip: 0 });
  const [finalResult, setFinalResult] = useState({ created: 0, updated: 0, skipped: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const resetState = useCallback(() => {
    setStep(1);
    setFile(null);
    setFileContent('');
    setDelimiter(';');
    setHeaders([]);
    setParsedData([]);
    setMappings({});
    setImportOptions({ updateExisting: true });
    setSummary({ toCreate: 0, toUpdate: 0, toSkip: 0 });
    setFinalResult({ created: 0, updated: 0, skipped: 0 });
    setIsLoading(false);
  }, []);
  
  const handleClose = useCallback(() => {
    onClose();
    // Delay reset to allow for closing animation
    setTimeout(resetState, 300);
  }, [onClose, resetState]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
        document.body.classList.remove('modal-open');
        window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, handleClose]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFileContent(content);
      };
      reader.readAsText(selectedFile, 'UTF-8');
    } else {
      setToast({ message: 'Por favor, selecione um ficheiro .csv', type: 'error' });
      setFile(null);
      setFileContent('');
    }
  };

  const processFile = () => {
    if (!fileContent) return;
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) {
        setToast({ message: 'O ficheiro CSV deve ter pelo menos um cabeçalho e uma linha de dados.', type: 'error' });
        return;
    }
    
    // Auto-detect delimiter
    const firstLine = lines[0];
    const delimiters: Delimiter[] = [';', ',', '\t'];
    let detectedDelimiter: Delimiter = ';';
    let maxCount = 0;
    delimiters.forEach(d => {
        const count = (firstLine.match(new RegExp(d, 'g')) || []).length;
        if(count > maxCount){
            maxCount = count;
            detectedDelimiter = d;
        }
    });
    setDelimiter(detectedDelimiter);

    const parsedHeaders = parseCsvRow(lines[0], detectedDelimiter);
    const parsedRows = lines.slice(1).map(line => parseCsvRow(line, detectedDelimiter));
    
    setHeaders(parsedHeaders);
    setParsedData(parsedRows);

    // Auto-mapping
    const newMappings: Mapping<T> = {};
    parsedHeaders.forEach((header, index) => {
        const foundColumn = importableColumns.find(col => col.label.toLowerCase() === header.toLowerCase().trim());
        if(foundColumn) {
            newMappings[index] = foundColumn.key;
        } else {
            newMappings[index] = 'ignore';
        }
    });
    setMappings(newMappings);
    
    setStep(2);
  };
  
  const handleMappingChange = (csvIndex: number, value: keyof T | 'ignore') => {
    setMappings(prev => ({...prev, [csvIndex]: value}));
  };
  
  const isMappingValid = useMemo(() => {
    const mappedKeys = Object.values(mappings);
    return importableColumns.every(col => !col.required || mappedKeys.includes(col.key));
  }, [mappings, importableColumns]);

  const mappedData = useMemo(() => {
    return parsedData.map(row => {
        const obj: Partial<T> = {};
        headers.forEach((_, index) => {
            const mappedKey = mappings[index];
            if (mappedKey && mappedKey !== 'ignore') {
                (obj as any)[mappedKey] = row[index] || '';
            }
        });
        return obj;
    });
  }, [parsedData, headers, mappings]);

  const calculateSummary = () => {
      let toCreate = 0, toUpdate = 0, toSkip = 0;
      mappedData.forEach(item => {
          const requiredFieldsMet = importableColumns.every(col => !col.required || (item[col.key] !== undefined && item[col.key] !== ''));
          if (!requiredFieldsMet) {
              toSkip++;
              return;
          }
          if (importOptions.updateExisting && item[uniqueKey]) {
              const existing = existingData.find(d => String(d[uniqueKey]).toLowerCase() === String(item[uniqueKey]).toLowerCase());
              if (existing) {
                  toUpdate++;
              } else {
                  toCreate++;
              }
          } else {
              toCreate++;
          }
      });
      setSummary({ toCreate, toUpdate, toSkip });
      setStep(3);
  };
  
  const handleFinalImport = () => {
    setIsLoading(true);
    setTimeout(() => { // Simulate async operation
        const result = onImport(mappedData, importOptions);
        setFinalResult(result);
        setIsLoading(false);
        setStep(4);
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop fixed inset-0 flex justify-center items-center p-4" onClick={handleClose} aria-modal="true" role="dialog">
      <div className="modal w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Importar {entityName} de CSV</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600"><XIcon className="w-6 h-6" /></button>
        </header>

        <div className="p-6 flex-grow overflow-y-auto">
            <div className="flex justify-between items-center mb-6 px-4">
                {[1, 2, 3].map(s => (
                    <React.Fragment key={s}>
                        <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                {s}
                            </div>
                            <span className={`ml-3 font-semibold ${step >= s ? 'text-gray-900' : 'text-gray-500'}`}>{STEP_TITLES[s as Step]}</span>
                        </div>
                        {s < 3 && <div className={`flex-1 h-0.5 mx-4 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}
                    </React.Fragment>
                ))}
            </div>

            {step === 1 && (
                <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <UploadIcon className="mx-auto w-12 h-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-semibold text-gray-900">Arraste e largue o seu ficheiro .csv</h3>
                    <p className="mt-1 text-sm text-gray-500">ou</p>
                    <input type="file" id="csv-upload" accept=".csv" onChange={handleFileChange} className="hidden" />
                    <label htmlFor="csv-upload" className="mt-2 inline-block bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg border-2 border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer">
                        Selecione um ficheiro
                    </label>
                    {file && <p className="mt-4 text-sm font-medium text-gray-700">{file.name}</p>}
                </div>
            )}
            
            {step === 2 && (
                <div className="space-y-6">
                    <div>
                        <h3 className="font-bold text-gray-900 mb-2">Mapear Colunas do Ficheiro</h3>
                        <p className="text-sm text-gray-500 mb-4">Associe cada coluna do seu ficheiro CSV a um campo correspondente em GeritApp. Campos com * são obrigatórios.</p>
                        <div className="space-y-3">
                            {headers.map((header, index) => (
                                <div key={index} className="grid grid-cols-2 gap-4 items-center">
                                    <div className="bg-gray-100 p-2 rounded-md text-sm text-gray-800 truncate">{header}</div>
                                    <select
                                        value={String(mappings[index]) || 'ignore'}
                                        onChange={(e) => handleMappingChange(index, e.target.value as keyof T)}
                                        className="h-10 bg-white text-gray-900 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                    >
                                        <option value="ignore">Ignorar esta coluna</option>
                                        {importableColumns.map(col => (
                                            <option key={String(col.key)} value={String(col.key)}>
                                                {col.label}{col.required ? ' *' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div className="mt-6 border-t pt-4">
                        <h3 className="font-bold text-gray-900 mb-2">Opções de Importação</h3>
                        <label className="flex items-center">
                            <input type="checkbox" checked={importOptions.updateExisting} onChange={e => setImportOptions({updateExisting: e.target.checked})} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <span className="ml-2 text-sm text-gray-700">Atualizar registos existentes se a chave única ({String(uniqueKey)}) corresponder</span>
                        </label>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-bold text-lg text-gray-900 mb-4">Resumo da Importação</h3>
                    <div className="space-y-3">
                        <div className="flex items-center text-green-700"><CheckCircleIcon className="w-5 h-5 mr-2" /><span>{summary.toCreate} novos registos serão criados.</span></div>
                        <div className="flex items-center text-blue-700"><InfoIcon className="w-5 h-5 mr-2" /><span>{summary.toUpdate} registos existentes serão atualizados.</span></div>
                        <div className="flex items-center text-amber-700"><ErrorIcon className="w-5 h-5 mr-2" /><span>{summary.toSkip} linhas serão ignoradas (dados em falta).</span></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-6">Clique em "Importar" para aplicar estas alterações. Esta ação não pode ser desfeita.</p>
                </div>
            )}
            
            {step === 4 && (
                <div className="text-center p-8">
                    <CheckCircleIcon className="mx-auto w-16 h-16 text-green-500" />
                    <h3 className="mt-4 text-xl font-bold text-gray-900">Importação Concluída</h3>
                    <div className="mt-4 text-gray-600 space-y-1">
                        <p>{finalResult.created} registos criados com sucesso.</p>
                        <p>{finalResult.updated} registos atualizados com sucesso.</p>
                        <p>{finalResult.skipped} linhas ignoradas.</p>
                    </div>
                </div>
            )}

        </div>
        
        <footer className="flex justify-between items-center p-5 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div>
                {step > 1 && step < 4 && (
                    <button onClick={() => setStep(prev => prev - 1 as Step)} className="px-5 py-2 text-sm font-semibold bg-white border border-gray-200 rounded-lg hover:bg-gray-100">Voltar</button>
                )}
            </div>
            <div className="flex items-center gap-3">
                <button onClick={handleClose} className="px-5 py-2 text-sm font-semibold bg-white border border-gray-200 rounded-lg hover:bg-gray-100">{step === 4 ? "Fechar" : "Cancelar"}</button>
                {step === 1 && (
                    <button onClick={processFile} disabled={!file} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">Continuar</button>
                )}
                {step === 2 && (
                    <button onClick={calculateSummary} disabled={!isMappingValid} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                        {!isMappingValid ? 'Mapeie campos *' : 'Continuar'}
                    </button>
                )}
                {step === 3 && (
                    <button onClick={handleFinalImport} disabled={isLoading} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 min-w-[100px] text-center">
                        {isLoading ? 'A importar...' : 'Importar'}
                    </button>
                )}
            </div>
        </footer>
      </div>
    </div>
  );
}