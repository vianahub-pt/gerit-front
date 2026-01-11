import React, { useState, useEffect } from 'react';
import { Toast } from '../App';

interface LoginPageProps {
  onLogin: (email: string, pass: string, remember: boolean) => Promise<boolean>;
  setToast: (toast: Toast | null) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, setToast }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            const activeElement = document.activeElement as HTMLInputElement;
            if (activeElement && (activeElement.id === 'email' || activeElement.id === 'password')) {
                activeElement.value = '';
                if(activeElement.id === 'email') setEmail('');
                if(activeElement.id === 'password') setPassword('');
            }
        }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setError('Por favor, insira um email válido.');
        return;
    }
    setError('');
    setIsLoading(true);
    const success = await onLogin(email, password, rememberMe);
    if (!success) {
      setError('Email ou palavra-passe incorretos.');
      setToast({ message: 'Email ou palavra-passe incorretos.', type: 'error' });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white p-8 rounded-xl shadow-md animate-fade-in" style={{boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
          <h1 className="text-2xl font-bold text-blue-600 text-center">GeritApp</h1>
          <p className="text-center text-sm text-gray-600 mt-2 mb-6">Aceda à sua conta para continuar.</p>
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex: nome@empresa.pt"
                aria-label="Campo de email"
                className="mt-1 w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password"className="block text-sm font-medium text-gray-700">Palavra-passe</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="Campo de palavra-passe"
                className="mt-1 w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            {error && <p className="text-sm text-red-600 text-center mb-4">{error}</p>}
            <div className="flex items-center justify-between mb-6">
              <label htmlFor="remember-me" className="flex items-center text-sm text-gray-600 cursor-pointer select-none">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="appearance-none h-4 w-4 bg-white border border-gray-300 rounded focus:ring-blue-500 checked:bg-blue-600 checked:border-transparent"
                />
                <span className="ml-2">Manter sessão iniciada</span>
              </label>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              aria-label="Botão de iniciar sessão"
              className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150 disabled:opacity-50"
            >
              {isLoading ? 'A entrar...' : 'Entrar'}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-gray-500 mt-8">© {new Date().getFullYear()} GeritApp – Todos os direitos reservados.</p>
      </div>
      <style>{`
        body { background-color: #F9FAFB; }
        .animate-fade-in {
          animation: fadeIn 200ms ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input[type="checkbox"]#remember-me:checked {
          background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
          background-size: 100% 100%;
          background-position: center;
          background-repeat: no-repeat;
        }
      `}</style>
    </div>
  );
};