import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LogOut, User, ShieldCheck, Settings, Layers, Camera 
} from 'lucide-react';

export function Profile() {
  const navigate = useNavigate();
  
  // Estado para armazenar os dados do utilizador logado
  const [userData, setUserData] = useState({
    name: 'Carregando...',
    email: 'carregando...',
    initials: '...'
  });

  useEffect(() => {
    // Função para extrair os dados diretamente do Token JWT salvo no login
    function loadUserData() {
      const token = localStorage.getItem('@MyFinn:token');
      
      if (token) {
        try {
          // Decodifica a parte do Payload (dados) do JWT
          const payloadBase64 = token.split('.')[1];
          const decodedPayload = JSON.parse(atob(payloadBase64));
          
          // O Spring Security normalmente guarda o login/email na propriedade "sub" (subject)
          const userEmail = decodedPayload.sub || 'usuario@myfinn.com';
          
          // Gera um nome provisório baseado no email
          const namePart = userEmail.split('@')[0];
          const userName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
          
          setUserData({
            name: userName,
            email: userEmail,
            initials: userName.substring(0, 2).toUpperCase()
          });

        } catch (error) {
          console.error("Erro ao ler dados do token:", error);
        }
      }
    }

    loadUserData();
  }, []);

  function handleLogout() {
    localStorage.removeItem('@MyFinn:token');
    navigate('/login');
  }

  return (
    <>
      {/* CABEÇALHO */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">O Meu Perfil</h1>
        <p className="text-slate-500 text-sm">Gerencie suas informações e configurações da conta.</p>
      </div>

      {/* CARTÃO DO UTILIZADOR */}
      <section className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm mb-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-8">
          
          {/* Avatar */}
          <div className="relative group">
            <div className="w-28 h-28 bg-slate-100 rounded-full flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
              <span className="text-3xl font-bold text-slate-400">{userData.initials}</span>
            </div>
            <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-sm border border-slate-200 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer">
              <Camera size={16} />
            </button>
          </div>

          {/* Informações Extraídas do Token */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">
              {userData.name}
            </h2>
            <div className="text-sm text-slate-500 space-y-1 mb-5">
              <p>Email: {userData.email}</p>
              <p>Status: Conta Ativa</p>
            </div>
            <button 
              onClick={handleLogout} 
              className="inline-flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-bold py-2.5 px-5 rounded-xl transition-colors"
            >
              <LogOut size={16} /> Sair da conta
            </button>
          </div>

        </div>
      </section>

      {/* GRID DE OPÇÕES DA CONTA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-100 transition-colors flex items-start gap-4 cursor-pointer group">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform">
            <User size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 mb-1 text-sm">Meus Dados Pessoais</h3>
            <p className="text-xs text-slate-500">Atualize o seu nome e outras informações de contacto.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-100 transition-colors flex items-start gap-4 cursor-pointer group">
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 group-hover:scale-105 transition-transform">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 mb-1 text-sm">Segurança e Acesso</h3>
            <p className="text-xs text-slate-500">Altere a sua palavra-passe e configurações de segurança.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-100 transition-colors flex items-start gap-4 cursor-pointer group">
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 group-hover:scale-105 transition-transform">
            <Settings size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 mb-1 text-sm">Preferências Gerais</h3>
            <p className="text-xs text-slate-500">Ajuste o idioma, fuso horário e notificações.</p>
          </div>
        </div>

        <Link to="/categories" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-100 transition-colors flex items-start gap-4 cursor-pointer group">
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 group-hover:scale-105 transition-transform">
            <Layers size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 mb-1 text-sm">Gerir Categorias</h3>
            <p className="text-xs text-slate-500">Personalize os ícones e nomes das tuas finanças.</p>
          </div>
        </Link>
      </div>
    </>
  );
}