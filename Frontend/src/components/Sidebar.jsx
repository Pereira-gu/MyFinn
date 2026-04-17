import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Target, TrendingUp, BookOpen, UserCircle, LogOut 
} from 'lucide-react';

/**
 * Componente de navegação lateral.
 * Centraliza os links e a lógica de logout.
 */
export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('@MyFinn:token');
    navigate('/login');
  };

  // Função auxiliar para verificar se a rota está ativa
  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/transactions', label: 'Extrato', icon: <FileText size={18} /> },
    { path: '/goals', label: 'Metas', icon: <Target size={18} /> },
    { path: '/investments', label: 'Investimentos', icon: <TrendingUp size={18} /> },
    { path: '/academy', label: 'Aprender', icon: <BookOpen size={18} /> },
  ];

  return (
    <aside className="w-64 bg-[#1E1E1E] text-slate-400 hidden lg:flex flex-col border-r border-white/5 h-screen sticky top-0">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/20">
            M
          </div>
          <span className="text-white text-xl font-bold tracking-tight">MyFinn</span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${
                isActive(item.path)
                  ? 'bg-blue-600/10 text-blue-500'
                  : 'hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-8 space-y-2 border-t border-white/5">
        <Link
          to="/profile"
          className={`flex items-center gap-3 p-3 rounded-xl transition-all font-medium mb-4 ${
            isActive('/profile')
              ? 'bg-blue-600/10 text-blue-500'
              : 'hover:text-white text-sm'
          }`}
        >
          <UserCircle size={18} /> Perfil
        </Link>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 w-full text-left text-sm hover:text-rose-500 transition-colors"
        >
          <LogOut size={18} /> Sair
        </button>
      </div>
    </aside>
  );
}