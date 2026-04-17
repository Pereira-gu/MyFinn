import { TrendingUp, Rocket } from 'lucide-react';

/**
 * Página de Investimentos (Em Construção)
 * Segue o padrão do Layout Global, sem sidebar interna.
 */
export function Investments() {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Investimentos</h1>
        <p className="text-slate-500 text-sm">Acompanhe e rentabilize o seu património a longo prazo.</p>
      </header>

      <div className="bg-white p-16 rounded-3xl border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-600">
          <TrendingUp size={40} />
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-2xl font-bold text-slate-800">Módulo em Desenvolvimento</h2>
          <Rocket size={24} className="text-blue-500 animate-bounce" />
        </div>

        <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
          Estamos a trabalhar na integração com APIs de mercado financeiro para que possa 
          gerir as suas ações, fundos e criptoativos diretamente aqui. Fique atento às atualizações!
        </p>
      </div>
    </>
  );
}