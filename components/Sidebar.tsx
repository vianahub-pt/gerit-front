
import React from 'react';
import { HomeIcon, ClipboardListIcon, UsersIcon, UserCogIcon, CarIcon, WrenchIcon, ShieldIcon } from './Icons';

type View = 'Home' | 'Intervenções' | 'Clientes' | 'Equipa' | 'Viaturas' | 'Equipamento' | 'Admin' | 'Login';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navItems = [
  { name: 'Home' as View, icon: HomeIcon },
  { name: 'Intervenções' as View, icon: ClipboardListIcon },
  { name: 'Clientes' as View, icon: UsersIcon },
  { name: 'Equipa' as View, icon: UserCogIcon },
  { name: 'Viaturas' as View, icon: CarIcon },
  { name: 'Equipamento' as View, icon: WrenchIcon },
  { name: 'Admin' as View, icon: ShieldIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, setIsOpen }) => {
  return (
    <>
    {/* Backdrop for mobile */}
    {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black bg-opacity-30 z-20 lg:hidden" />}

    <aside className={`sidebar fixed top-0 left-0 h-full bg-white text-gray-900 w-60 transform transition-transform duration-300 ease-in-out z-30 
                     lg:static lg:translate-x-0 lg:h-screen lg:border-r lg:border-gray-200
                     ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 hidden lg:block">
        <h1 className="text-2xl font-bold text-blue-600">GeritApp</h1>
      </div>
      <div className="p-6 lg:hidden">
        <h1 className="text-2xl font-bold text-blue-600">Menu</h1>
      </div>
      <nav className="mt-6">
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="px-4">
              <button
                onClick={() => setView(item.name)}
                className={`w-full flex items-center p-3 my-1 rounded-lg transition-colors duration-150 ${
                  currentView === item.name
                    ? 'bg-sky-100 text-blue-600 font-semibold'
                    : 'text-gray-500 hover:bg-blue-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
    </>
  );
};