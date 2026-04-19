import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados dos Filtros (Fase 1 do Backend em ação!)
  const [filterType, setFilterType] = useState(''); // '' = Todos
  const [filterCategory, setFilterCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Estados da Paginação
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLastPage, setIsLastPage] = useState(true);

  // Busca inicial das Categorias para o Dropdown
  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data));
  }, []);

  // O Motor de Busca: Dispara sempre que um filtro ou a página muda
  useEffect(() => {
    fetchTransactions();
  }, [page, filterType, filterCategory, searchQuery]);

  async function fetchTransactions() {
    setIsLoading(true);
    try {
      // Construindo a URL dinamicamente com os filtros
      const params = new URLSearchParams({
        page: page,
        size: 10
      });
      
      if (filterType) params.append('type', filterType);
      if (filterCategory) params.append('categoryId', filterCategory);
      if (searchQuery) params.append('search', searchQuery);

      const response = await api.get(`/transactions?${params.toString()}`);
      
      // Lendo a resposta paginada do Spring Boot
      setTransactions(response.data.content);
      setTotalPages(response.data.totalPages);
      setIsLastPage(response.data.last);
    } catch (error) {
      console.error("Erro ao buscar extrato", error);
      // 👇 ADICIONE ESTA VERIFICAÇÃO
      if (error.response?.status === 403) { 
      }
    } finally {
      setIsLoading(false);
    }
  }

  function clearFilters() {
    setFilterType('');
    setFilterCategory('');
    setSearchQuery('');
    setPage(0);
  }

  const formatCurrency = (cents) => 
    (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Extrato Completo</h1>
        <p className="text-slate-500 text-sm">Audite o seu histórico financeiro.</p>
      </header>

      {/* BARRA DE FILTROS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por descrição..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-4">
          <select 
            value={filterType} 
            onChange={(e) => { setFilterType(e.target.value); setPage(0); }}
            className="p-2 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Todos os Tipos</option>
            <option value="income">Receitas</option>
            <option value="outcome">Despesas</option>
          </select>

          <select 
            value={filterCategory} 
            onChange={(e) => { setFilterCategory(e.target.value); setPage(0); }}
            className="p-2 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Todas as Categorias</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {(filterType || filterCategory || searchQuery) && (
            <button onClick={clearFilters} className="p-2 text-slate-400 hover:text-rose-500 transition-colors" title="Limpar Filtros">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* LISTA DE TRANSAÇÕES */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Carregando dados...</div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <Filter size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">Nenhuma transação encontrada.</p>
            <p className="text-slate-400 text-sm mt-1">Tente ajustar os filtros acima.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {transactions.map(t => (
              <li key={t.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                    {t.type === 'income' ? '💵' : '💸'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{t.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{t.categoryName}</span>
                      <span className="text-[10px] text-slate-400">{formatDate(t.date)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.valueCents)}
                  </p>
                  <p className={`text-[10px] font-bold uppercase mt-1 ${t.isPaid ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {t.isPaid ? '✔ Pago' : '⏳ Pendente'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* PAGINAÇÃO (Fase 3 embutida!) */}
      {!isLoading && transactions.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-slate-500">
            Página <span className="font-bold">{page + 1}</span> de <span className="font-bold">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={() => setPage(p => p + 1)}
              disabled={isLastPage}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}