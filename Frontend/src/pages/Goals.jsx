import { Target } from 'lucide-react';

export function Goals() {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Metas</h1>
        <p className="text-slate-500 text-sm">Planeje seus sonhos e acompanhe seu progresso.</p>
      </header>

      <div className="bg-white p-16 rounded-3xl border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 text-emerald-600">
          <Target size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Planejamento de Metas</h2>
        <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
          Esta funcionalidade permitirá que você defina orçamentos mensais e 
          objetivos de poupança. Estamos ajustando os últimos detalhes!
        </p>
      </div>
    </>
  );
}