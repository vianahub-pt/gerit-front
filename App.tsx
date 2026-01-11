import React, { useState, useCallback, useEffect, PropsWithChildren, ErrorInfo } from 'react';
import { Sidebar } from './components/Sidebar';
import { UserMenu } from './components/UserMenu';
import { HomePage } from './pages/HomePage';
import { IntervencoesPage } from './pages/IntervencoesPage';
import { ClientesPage } from './pages/ClientesPage';
import { EquipaPage } from './pages/EquipaPage';
import { ViaturasPage } from './pages/ViaturasPage';
import { EquipamentoPage } from './pages/EquipamentoPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { MenuIcon, XIcon, SuccessIcon, ErrorIcon, InfoIcon } from './components/Icons';
import { MOCK_INTERVENCOES, MOCK_VIATURAS, MOCK_EQUIPA } from './constants';
import { Intervencao, User } from './types';


type View = 'Home' | 'Intervenções' | 'Clientes' | 'Equipa' | 'Viaturas' | 'Equipamento' | 'Admin' | 'Login';
export type ToastType = 'success' | 'error' | 'info';
export type Toast = { message: string; type: ToastType };

// Hardcoded users for demonstration
const USERS_DB: Record<string, { pass: string, user: User }> = {
    'admin@geritapp.com': { pass: 'admin123', user: { id: 1, email: 'admin@geritapp.com', name: 'Admin', initials: 'AD' } },
    'user@geritapp.com': { pass: 'user123', user: { id: 2, email: 'user@geritapp.com', name: 'Utilizador', initials: 'UT' } },
};

// --- Routing Helpers ---
const viewToHash: { [key in View]?: string } = {
    'Home': 'home',
    'Intervenções': 'intervencoes',
    'Clientes': 'clientes',
    'Equipa': 'equipa',
    'Viaturas': 'viaturas',
    'Equipamento': 'equipamento',
    'Admin': 'admin',
    'Login': 'login'
};

const hashToView: { [key: string]: View } = Object.fromEntries(
  Object.entries(viewToHash).map(([k, v]) => [v, k as View])
);

type ErrorBoundaryProps = PropsWithChildren<{
    onReset: () => void;
    setToast: React.Dispatch<React.SetStateAction<Toast | null>>;
}>;

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.props.setToast({ message: 'Falha temporária de interface. A tentar recuperar…', type: 'error' });
  }
  
  handleReset = () => {
      this.props.onReset();
      this.setState({ hasError: false });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center mt-8">
            <h2 className="text-xl font-bold text-gray-900">Ocorreu um erro a carregar esta página.</h2>
            <div className="mt-6 flex justify-center gap-4">
                <button
                    onClick={this.handleReset}
                    className="px-4 py-2 text-sm font-semibold bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                    Voltar à Home
                </button>
                <button
                    onClick={() => this.setState({ hasError: false })}
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Tentar novamente
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ToastComponent: React.FC<{ message: string; type: ToastType; onClose: () => void }> = ({ message, type, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
        setIsExiting(true);
        const closeTimer = setTimeout(onClose, 250); // Match animation duration
        return () => clearTimeout(closeTimer);
    }, 3000);
    
    return () => clearTimeout(exitTimer);
  }, [onClose]);

  const baseClasses = 'fixed top-5 right-5 z-[100] px-6 py-3 rounded-lg shadow-lg text-sm font-semibold border flex items-center transition-all duration-250 ease-in-out';
  
  const typeClasses = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  }[type];

  const Icon = {
    success: SuccessIcon,
    error: ErrorIcon,
    info: InfoIcon,
  }[type];

  return (
    <div className={`toast-container ${baseClasses} ${typeClasses} ${isExiting ? 'opacity-0 translate-y-[-20px]' : 'opacity-100 translate-y-0'}`}>
      <Icon className="w-5 h-5 mr-3" />
      <span>{message}</span>
    </div>
  );
};


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [currentView, setCurrentView] = useState<View>('Login');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const [intervencoes, setIntervencoes] = useState<Intervencao[]>(MOCK_INTERVENCOES);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [action, setAction] = useState<string | null>(null);
  
  const handleSetView = useCallback((view: View) => {
    const hash = viewToHash[view] || 'home';
    if(window.location.hash !== `#${hash}`) {
        window.location.hash = hash;
    }
    if(window.innerWidth < 1024) {
        setSidebarOpen(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('authToken');
    setCurrentUser(null);
    window.location.hash = 'login';
    setToast({ message: 'Sessão terminada.', type: 'success' });
  }, []);

  const checkAuth = useCallback(() => {
    try {
        const tokenString = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (tokenString) {
            const { user, expiry } = JSON.parse(tokenString);
            if (new Date().getTime() < expiry) {
                setCurrentUser(user);
                return user;
            } else {
                handleLogout();
                setToast({ message: 'A sua sessão expirou. Inicie novamente.', type: 'info' });
            }
        }
    } catch (error) {
        console.error("Auth check failed:", error);
    }
    setCurrentUser(null);
    return null;
  }, [handleLogout]);

  useEffect(() => {
      checkAuth();
      setIsLoadingAuth(false);
  }, [checkAuth]);
  
  const handleLogin = useCallback(async (email: string, pass: string, remember: boolean): Promise<boolean> => {
    const userRecord = USERS_DB[email.toLowerCase()];
    if (userRecord && userRecord.pass === pass) {
        const duration = (remember ? 120 : 60) * 60 * 1000;
        const expiry = new Date().getTime() + duration;
        const token = JSON.stringify({ user: userRecord.user, expiry });
        
        if (remember) {
            localStorage.setItem('authToken', token);
        } else {
            sessionStorage.setItem('authToken', token);
        }

        setCurrentUser(userRecord.user);
        setToast({ message: 'Sessão iniciada com sucesso.', type: 'success' });
        window.location.hash = 'home';
        return true;
    }
    return false;
  }, []);

  useEffect(() => {
    const getViewFromHash = () => hashToView[window.location.hash.substring(1)] || (currentUser ? 'Home' : 'Login');
    
    const handleHashChange = () => {
        const newView = getViewFromHash();
        if (currentView !== newView) {
            setCurrentView(newView);
        }
    };
    
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser, currentView]);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!currentUser) {
        if (window.location.hash !== '#login') {
            window.location.hash = 'login';
        }
    } else {
        if (window.location.hash === '#login' || window.location.hash === '') {
            window.location.hash = 'home';
        }
    }
  }, [currentUser, isLoadingAuth]);

  useEffect(() => {
    if (isSidebarOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  const handleCreateIntervention = () => {
    handleSetView('Intervenções');
    setAction('create-intervention');
  };

  const handleSaveIntervention = (intervencaoData: Omit<Intervencao, 'id' | 'viatura' | 'responsavel'> & {id?: number}) => {
      const viatura = MOCK_VIATURAS.find(v => v.id === intervencaoData.viaturaId)?.matricula || '';
      const responsavel = MOCK_EQUIPA.find(m => m.id === intervencaoData.responsavelId)?.nome || '';

      if (intervencaoData.id) {
          const originalIntervention = intervencoes.find(i => i.id === intervencaoData.id);
          if (!originalIntervention) {
              setToast({ message: 'Erro: Intervenção a editar não encontrada.', type: 'error' });
              return;
          }
          const updatedIntervencao = { ...originalIntervention, ...intervencaoData, viatura, responsavel };
          setIntervencoes(prev => prev.map(i => (i.id === intervencaoData.id ? updatedIntervencao : i)));
      } else {
          const newIntervencao: Intervencao = {
            id: Date.now(),
            ...intervencaoData,
            viatura,
            responsavel,
          };
          setIntervencoes(prev => [newIntervencao, ...prev]);
      }
      setLastUpdate(new Date());
      setToast({ message: 'Intervenção guardada com sucesso.', type: 'success' });
  };

  const handleDeleteIntervention = (id: number) => {
      setIntervencoes(prev => prev.filter(i => i.id !== id));
      setLastUpdate(new Date());
      setToast({ message: 'Intervenção eliminada com sucesso.', type: 'success' });
  };

  const commonPageProps = { setToast, handleCreateIntervention };
  
  if (isLoadingAuth) {
    return <div className="fixed inset-0 bg-slate-50" />;
  }
  
  if (!currentUser) {
      return (
          <>
              {toast && <ToastComponent message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
              <LoginPage onLogin={handleLogin} setToast={setToast} />
          </>
      );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {toast && <ToastComponent message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="flex">
        <Sidebar 
          currentView={currentView} 
          setView={handleSetView} 
          isOpen={isSidebarOpen}
          setIsOpen={setSidebarOpen}
        />
        
        <div className="flex-1 flex flex-col min-w-0">
          <header className="app-header sticky top-0 bg-white/80 backdrop-blur-sm z-20 h-16 flex items-center px-4 md:px-6 border-b border-gray-200">
             <div className="flex items-center w-full">
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden text-gray-500 mr-4" aria-label={isSidebarOpen ? "Fechar menu" : "Abrir menu"}>
                    {isSidebarOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
                </button>
                <h1 className="text-lg font-bold text-gray-900">{currentView}</h1>
                <div className="ml-auto">
                    <UserMenu user={currentUser} onLogout={handleLogout} />
                </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="max-w-7xl mx-auto">
                   <ErrorBoundary onReset={() => handleSetView('Home')} setToast={setToast}>
                       <div style={{ display: currentView === 'Home' ? 'block' : 'none' }}>
                            <HomePage {...commonPageProps} intervencoes={intervencoes} lastUpdate={lastUpdate} />
                       </div>
                       <div style={{ display: currentView === 'Intervenções' ? 'block' : 'none' }}>
                           <IntervencoesPage 
                                {...commonPageProps} 
                                intervencoes={intervencoes}
                                onSave={handleSaveIntervention}
                                onDelete={handleDeleteIntervention}
                                action={action}
                                setAction={setAction}
                            />
                       </div>
                       <div style={{ display: currentView === 'Clientes' ? 'block' : 'none' }}>
                            <ClientesPage setToast={setToast} intervencoes={intervencoes} />
                       </div>
                       <div style={{ display: currentView === 'Equipa' ? 'block' : 'none' }}>
                            <EquipaPage setToast={setToast} intervencoes={intervencoes} />
                       </div>
                       <div style={{ display: currentView === 'Viaturas' ? 'block' : 'none' }}>
                            <ViaturasPage setToast={setToast} />
                       </div>
                       <div style={{ display: currentView === 'Equipamento' ? 'block' : 'none' }}>
                           <EquipamentoPage setToast={setToast} />
                       </div>
                       <div style={{ display: currentView === 'Admin' ? 'block' : 'none' }}>
                           <AdminPage />
                       </div>
                   </ErrorBoundary>
              </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;