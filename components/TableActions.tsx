import React, { useState, useRef, useEffect } from 'react';
import { DownloadIcon, PrinterIcon, MoreHorizontalIcon, UploadIcon } from './Icons';
import { Toast } from '../App';

export interface ExportColumn<T> {
  header: string;
  accessor: (item: T) => string | number | boolean;
}

interface TableActionsProps<T> {
  data: T[];
  columns: ExportColumn<T>[];
  entityName: string;
  setToast: (toast: Toast | null) => void;
  onImportClick?: () => void;
}

export function TableActions<T extends {}>({ data, columns, entityName, setToast, onImportClick }: TableActionsProps<T>) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const isExportDisabled = data.length === 0;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const exportToCsv = () => {
        if (isExportDisabled) return;
        try {
            const headers = columns.map(c => c.header).join(';');
            const rows = data.map(item =>
                columns.map(col => {
                    const value = col.accessor(item);
                    const cleanedValue = `"${String(value).replace(/"/g, '""')}"`;
                    return cleanedValue;
                }).join(';')
            );

            const csvContent = [headers, ...rows].join('\n');
            const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
            
            const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-');
            const filename = `GeritApp_${entityName.replace(/ç/g, 'c').replace(/õ/g, 'o').replace(/ /g, '_')}_${timestamp}.csv`;

            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setToast({ message: 'Exportação concluída.', type: 'success' });
        } catch (error) {
            console.error("CSV Export Error:", error);
            setToast({ message: 'Não foi possível exportar. Tente novamente.', type: 'error' });
        }
        setIsMenuOpen(false);
    };

    const handlePrint = () => {
        if (isExportDisabled) return;
        try {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                throw new Error("Could not open print window. Please check your browser's pop-up settings.");
            }

            const tableHeaders = columns.map(c => `<th>${c.header}</th>`).join('');
            const tableRows = data.map(item => `
                <tr>
                    ${columns.map(col => `<td>${col.accessor(item)}</td>`).join('')}
                </tr>
            `).join('');

            const now = new Date();
            const printContent = `
                <html>
                    <head>
                        <title>Imprimir - GeritApp - ${entityName}</title>
                        <style>
                            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 20mm; }
                            h1 { font-size: 18px; font-weight: 600; text-align: center; margin-bottom: 8px; }
                            p { font-size: 12px; text-align: center; color: #6B7280; margin-top: 0; margin-bottom: 24px; }
                            table { width: 100%; border-collapse: collapse; }
                            th, td { border: 1px solid #E5E7EB; padding: 8px 12px; text-align: left; font-size: 12px; word-break: break-word; }
                            th { background-color: #F3F4F6; font-weight: 600; }
                            tr:nth-child(even) { background-color: #F9FAFB; }
                            @page { size: A4 portrait; margin: 20mm; }
                            @media print {
                                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                            }
                        </style>
                    </head>
                    <body>
                        <h1>GeritApp – ${entityName}</h1>
                        <p>Gerado em ${now.toLocaleDateString('pt-PT')} às ${now.toLocaleTimeString('pt-PT')}</p>
                        <table>
                            <thead><tr>${tableHeaders}</tr></thead>
                            <tbody>${tableRows}</tbody>
                        </table>
                    </body>
                </html>
            `;
            
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
            
            setToast({ message: 'Pronto para imprimir.', type: 'info' });
        } catch (error) {
             console.error("Print Error:", error);
             setToast({ message: 'Não foi possível completar a operação. Tente novamente.', type: 'error' });
        }
        setIsMenuOpen(false);
    };

    const commonButtonClasses = "h-9 px-3 rounded-lg text-sm font-semibold transition-all duration-150 ease-in-out flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none";
    const importButtonClasses = "bg-white text-gray-800 border border-gray-300 hover:enabled:bg-gray-100 hover:enabled:-translate-y-px hover:enabled:shadow-sm";
    const csvButtonClasses = "bg-gray-200 text-gray-800 hover:enabled:bg-gray-300 hover:enabled:-translate-y-px hover:enabled:shadow-sm";
    const printButtonClasses = "bg-white text-gray-800 border border-gray-300 hover:enabled:bg-gray-100 hover:enabled:-translate-y-px hover:enabled:shadow-sm";

    return (
        <>
            <div className="hidden sm:flex items-center space-x-2">
                {onImportClick && (
                    <button onClick={onImportClick} className={`${commonButtonClasses} ${importButtonClasses}`} aria-label="Importar dados de CSV">
                        <UploadIcon className="w-4 h-4" />
                        Importar CSV
                    </button>
                )}
                <button onClick={exportToCsv} disabled={isExportDisabled} className={`${commonButtonClasses} ${csvButtonClasses}`} aria-label="Exportar dados para CSV">
                    <DownloadIcon className="w-4 h-4" />
                    Exportar CSV
                </button>
                <button onClick={handlePrint} disabled={isExportDisabled} className={`${commonButtonClasses} ${printButtonClasses}`} aria-label="Imprimir ou guardar em PDF">
                    <PrinterIcon className="w-4 h-4" />
                    Imprimir / PDF
                </button>
            </div>
            
            <div className="relative sm:hidden" ref={menuRef}>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`${commonButtonClasses} ${printButtonClasses} w-9 h-9 p-0`} aria-label="Mais opções" aria-haspopup="true" aria-expanded={isMenuOpen}>
                    <MoreHorizontalIcon className="w-5 h-5" />
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                        <ul className="py-1">
                            {onImportClick && (
                                <li>
                                    <button onClick={() => { onImportClick(); setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <UploadIcon className="w-4 h-4" />
                                        Importar CSV
                                    </button>
                                </li>
                            )}
                            <li>
                                <button onClick={exportToCsv} disabled={isExportDisabled} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50">
                                    <DownloadIcon className="w-4 h-4" />
                                    Exportar CSV
                                </button>
                            </li>
                            <li>
                                <button onClick={handlePrint} disabled={isExportDisabled} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50">
                                    <PrinterIcon className="w-4 h-4" />
                                    Imprimir / PDF
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </>
    );
}