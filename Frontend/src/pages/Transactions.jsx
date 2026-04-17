import { FileText, Construction } from 'lucide-react';

export function Transactions() {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Extrato</h1>
        <p className="text-slate-500 text-sm">Histórico detalhado de todas as suas movimentações.</p>
      </header>

      <div className="bg-white p-16 rounded-3xl border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 text-amber-600">
          <Construction size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Página em Obras</h2>
        <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
          O extrato completo com filtros avançados e exportação de relatórios 
          está sendo construído. Use o Dashboard para ver os lançamentos recentes por enquanto.
        </p>
      </div>
    </>
  );
}