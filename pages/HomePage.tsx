
import React, { useMemo, useState } from 'react';
import { StatCard } from '../components/StatCard';
import { ClipboardListIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, CircleIcon, ClockIcon, CheckCircleIcon } from '../components/Icons';
import { MOCK_INTERVENCOES } from '../constants';
import { Status, Intervencao } from '../types';

interface HomePageProps {
    handleCreateIntervention: () => void;
    intervencoes: Intervencao[];
    lastUpdate: Date;
}

const Calendar: React.FC<{ intervencoes: Intervencao[] }> = ({ intervencoes }) => {
    const [displayDate, setDisplayDate] = useState(new Date());

    const currentMonth = displayDate.getMonth();
    const currentYear = displayDate.getFullYear();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0=Sun, 1=Mon
    
    const monthName = displayDate.toLocaleString('pt-PT', { month: 'long' });

    const handlePrevMonth = () => setDisplayDate(new Date(currentYear, currentMonth - 1, 1));
    const handleNextMonth = () => setDisplayDate(new Date(currentYear, currentMonth + 1, 1));
    const handleToday = () => setDisplayDate(new Date());


    const calendarDays = useMemo(() => {
        const days = [];
        // Adjust for Sunday start
        const firstDayOfMonth = firstDayOfWeek === 0 ? 0 : firstDayOfWeek;
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-start-${i}`} className="border-r border-b border-gray-200"></div>);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const isToday = date.toDateString() === new Date().toDateString();
            
            const events = intervencoes.filter(i => {
                const eventDate = new Date(i.inicio);
                return eventDate.getFullYear() === currentYear && eventDate.getMonth() === currentMonth && eventDate.getDate() === day;
            });

            days.push(
                <div key={day} className="p-2 border-r border-b border-gray-200 min-h-[120px] flex flex-col">
                    <div className={`font-semibold text-sm ${isToday ? 'bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center' : 'text-gray-900'}`}>
                        {day}
                    </div>
                    <div className="mt-1 flex-grow overflow-y-auto">
                        {events.map(event => (
                            <div key={event.id} className="text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5 mb-1 truncate" title={event.titulo}>
                                {event.titulo}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return days;
    }, [currentMonth, currentYear, daysInMonth, firstDayOfWeek, intervencoes]);


    return (
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold capitalize">{monthName} {currentYear}</h3>
                <div className="flex items-center space-x-2">
                    <button onClick={handlePrevMonth} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"><ChevronLeftIcon className="w-5 h-5 text-gray-500" /></button>
                    <button onClick={handleToday} className="text-sm font-semibold px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">Hoje</button>
                    <button onClick={handleNextMonth} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"><ChevronRightIcon className="w-5 h-5 text-gray-500" /></button>
                </div>
            </div>
            <div className="grid grid-cols-7 text-center font-semibold text-sm text-gray-500 border-t border-l border-r border-gray-200">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className="p-2 border-r border-b border-gray-200 bg-gray-50">{day}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 border-l border-gray-200">
                {calendarDays}
            </div>
        </div>
    );
};


export const HomePage: React.FC<HomePageProps> = ({ handleCreateIntervention, intervencoes, lastUpdate }) => {
  const stats = useMemo(() => ({
    total: intervencoes.length,
    abertas: intervencoes.filter(i => i.estado === Status.Aberto).length,
    pendentes: intervencoes.filter(i => i.estado === Status.Pendente).length,
    fechadas: intervencoes.filter(i => i.estado === Status.Fechado).length,
  }), [intervencoes]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Home</h1>
          <p className="text-sm text-gray-500 mt-1">Uma visão geral do seu negócio.</p>
        </div>
        <button 
            onClick={handleCreateIntervention} 
            className="mt-4 sm:mt-0 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-150 ease-in-out flex items-center disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="w-5 h-5 mr-2 -ml-1" />
          Criar intervenção
        </button>
      </div>

      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total de Intervenções" value={stats.total} icon={<ClipboardListIcon />} color="blue" />
            <StatCard title="Intervenções Abertas" value={stats.abertas} icon={<CircleIcon />} color="gray" />
            <StatCard title="Intervenções Pendentes" value={stats.pendentes} icon={<ClockIcon />} color="amber" />
            <StatCard title="Intervenções Fechadas" value={stats.fechadas} icon={<CheckCircleIcon />} color="green" />
        </div>
        <p className="text-xs text-gray-400 text-right mt-2">
            Atualizado às {lastUpdate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      <Calendar intervencoes={intervencoes} />
    </div>
  );
};
