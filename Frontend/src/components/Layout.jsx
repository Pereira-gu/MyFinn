import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

/**
 * Componente de Layout Global.
 * Define a estrutura base de todas as páginas autenticadas.
 */
export function Layout() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      
      {/* Área de conteúdo principal */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}