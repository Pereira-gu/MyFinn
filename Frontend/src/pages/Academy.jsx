import { BookOpen, Construction } from 'lucide-react';

/**
 * Página Academy (Aprender)
 * Renderiza um aviso de construção seguindo o padrão do Layout Global.
 */
export function Academy() {
  return (
    <>
      {/* CABEÇALHO DA PÁGINA */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Aprender</h1>
        <p className="text-slate-500 text-sm">Educação financeira para dominar o seu capital.</p>
      </header>

      {/* CARD CENTRAL DE AVISO */}
      <div className="bg-white p-16 rounded-3xl border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-600">
          <BookOpen size={40} />
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-2xl font-bold text-slate-800">Biblioteca em Desenvolvimento</h2>
          <Construction size={24} className="text-amber-500" />
        </div>

        <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
          Estamos a preparar uma curadoria de conteúdos sobre gestão de património, 
          resumos de clássicos como "O Homem Mais Rico da Babilónia" e lições sobre 
          teoria financeira aplicada. Em breve, o seu espaço de conhecimento estará pronto!
        </p>
      </div>
    </>
  );
}