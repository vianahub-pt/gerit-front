import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { LogOutIcon, UserIcon as ProfileIcon } from './Icons';

interface UserMenuProps {
  user: User;
  onLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center space-x-2 rounded-full p-1 transition-colors hover:bg-gray-100"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
          {user.initials}
        </div>
        <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-gray-800">{user.name}</p>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 py-1">
          <div className="px-4 py-2 border-b border-gray-200">
             <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
             <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <button
            onClick={() => { setIsOpen(false); }}
            className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <ProfileIcon className="w-4 h-4" />
            Perfil
          </button>
          <button
            onClick={onLogout}
            aria-label="Botão de terminar sessão"
            className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <LogOutIcon className="w-4 h-4" />
            Terminar sessão
          </button>
        </div>
      )}
    </div>
  );
};
