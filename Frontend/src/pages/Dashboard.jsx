import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip 
} from 'recharts';
import { 
  LayoutDashboard, Wallet, ChevronLeft, ChevronRight, 
  Search, PlusCircle, ArrowUpRight, ArrowDownRight, X,
  Activity, Zap
} from 'lucide-react';

/**
 * Dashboard Component: Centraliza os indicadores de saúde financeira.
 * Implementa Taxa de Retenção, Burn Rate, MoM e Comprometimento de Renda.
 */
export function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({ income: 0, outcome: 0, balance: 0 });
  const [prevMonthSummary, setPrevMonthSummary] = useState({ income: 0, outcome: 0 });
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newTx, setNewTx] = useState({
    description: '', valueCents: '', type: 'outcome', 
    date: new Date().toISOString().split('T')[0], 
    isPaid: true, categoryId: '', paymentMethod: 'DEBIT'
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [currentMonth, currentYear]);

  /**
   * Busca dados do mês atual e do mês anterior para comparativos.
   */
  async function fetchData() {
    setIsLoading(true);
    try {
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      const [transRes, catRes, prevRes] = await Promise.all([
        api.get(`/transactions/dashboard?month=${currentMonth}&year=${currentYear}`),
        api.get('/categories'),
        api.get(`/transactions/dashboard?month=${prevMonth}&year=${prevYear}`)
      ]);
      
      setSummary({
        income: transRes.data.incomeCents,
        outcome: transRes.data.outcomeCents,
        balance: transRes.data.balanceCents
      });
      setPrevMonthSummary({
        income: prevRes.data.incomeCents,
        outcome: prevRes.data.outcomeCents
      });
      setTransactions(transRes.data.transactions.content);
      setCategories(catRes.data);
    } catch (error) {
      if (error.response?.status === 403) navigate('/login');
    } finally {
      setIsLoading(false);
    }
  }

  // Envia os dados para a API (convertendo para centavos)
  async function handleCreateTransaction(e) {
    e.preventDefault();
    try {
      const payload = {
        ...newTx,
        date: newTx.date + "T12:00:00", // Formatar para LocalDateTime
        valueCents: Math.round(parseFloat(newTx.valueCents.replace(',', '.')) * 100)
      };
      await api.post('/transactions', payload);
      setIsModalOpen(false);
      
      // Reseta o formulário
      setNewTx({
        description: '', valueCents: '', type: 'outcome', 
        date: new Date().toISOString().split('T')[0], 
        isPaid: true, categoryId: '', paymentMethod: 'DEBIT'
      });
      fetchData(); 
    } catch (error) {
      alert(error.response?.data?.message || "Erro ao criar transação.");
    }
  }

  // --- CÁLCULOS DE SAÚDE FINANCEIRA ---

  const healthMetrics = useMemo(() => {
    const today = new Date();
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const daysElapsed = currentMonth === today.getMonth() + 1 ? today.getDate() : daysInMonth;

    // 1. Taxa de Retenção (A Regra de Ouro)
    const retention = summary.income > 0 
      ? Math.max(0, ((summary.income - summary.outcome) / summary.income) * 100) 
      : 0;

    // 2. Ritmo de Gasto Diário (Burn Rate)
    const burnRate = summary.outcome / daysElapsed;

    // 3. Comparativo MoM (%)
    const calculateMoM = (current, prev) => {
      if (prev === 0) return 0;
      return ((current - prev) / prev) * 100;
    };

    // 4. Comprometimento (Ex: Categorias fixas como Moradia, Luz)
    const fixedExpenses = transactions
      .filter(t => t.type === 'outcome' && /moradia|aluguel|luz|água|internet/i.test(t.categoryName))
      .reduce((acc, t) => acc + t.valueCents, 0);
    const commitment = summary.income > 0 ? (fixedExpenses / summary.income) * 100 : 0;

    return { retention, burnRate, incomeMoM: calculateMoM(summary.income, prevMonthSummary.income), outcomeMoM: calculateMoM(summary.outcome, prevMonthSummary.outcome), commitment };
  }, [summary, prevMonthSummary, transactions, currentMonth, currentYear]);

  // --- CÁLCULO DE CATEGORIAS PARA O GRÁFICO ---
  const expensesByCategory = useMemo(() => {
    return transactions
      .filter(t => t.type === 'outcome')
      .reduce((acc, t) => {
        const existing = acc.find(item => item.name === t.categoryName);
        if (existing) {
          existing.value += (t.valueCents / 100);
        } else {
          const cat = categories.find(c => c.name === t.categoryName);
          acc.push({
            name: t.categoryName, value: (t.valueCents / 100), color: cat ? cat.color : '#94A3B8'
          });
        }
        return acc;
      }, []).sort((a, b) => b.value - a.value);
  }, [transactions, categories]);

  const totalExpenses = expensesByCategory.reduce((sum, item) => sum + item.value, 0);

  const formatCurrency = (cents) => 
    (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (isLoading) return <div className="flex h-full items-center justify-center text-slate-500 font-medium">Analisando sua saúde financeira...</div>;

  return (
    <>
      {/* CABEÇALHO PADRONIZADO */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Painel de Saúde</h1>
          <p className="text-slate-500 text-sm">Visualize o seu progresso e ritmo financeiro.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center bg-white rounded-xl shadow-sm border border-slate-200 p-1">
            <button onClick={() => setCurrentMonth(m => m === 1 ? 12 : m - 1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"><ChevronLeft size={16}/></button>
            <span className="px-4 text-[10px] font-black text-slate-700 min-w-[130px] text-center uppercase tracking-widest">
              {new Date(currentYear, currentMonth - 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => setCurrentMonth(m => m === 12 ? 1 : m + 1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"><ChevronRight size={16}/></button>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all">
            <PlusCircle size={18} /> Novo Lançamento
          </button>
        </div>
      </header>

      {/* GRID DE INDICADORES PRINCIPAIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Entradas com MoM */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Entradas</p>
          <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(summary.income)}</h3>
          <div className={`flex items-center gap-1 mt-2 text-[10px] font-bold ${healthMetrics.incomeMoM >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {healthMetrics.incomeMoM >= 0 ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
            {Math.abs(healthMetrics.incomeMoM).toFixed(1)}% vs mês passado
          </div>
        </div>

        {/* Saídas com MoM */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Saídas</p>
          <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(summary.outcome)}</h3>
          <div className={`flex items-center gap-1 mt-2 text-[10px] font-bold ${healthMetrics.outcomeMoM <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {healthMetrics.outcomeMoM <= 0 ? <ArrowDownRight size={12}/> : <ArrowUpRight size={12}/>}
            {Math.abs(healthMetrics.outcomeMoM).toFixed(1)}% vs mês passado
          </div>
        </div>

        {/* Burn Rate Diário */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Ritmo de Gasto</p>
          <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(healthMetrics.burnRate)}<span className="text-xs font-medium text-slate-400"> /dia</span></h3>
          <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
            <Activity size={12} className="text-blue-500" />
            Ritmo baseado em {new Date().getDate()} dias
          </p>
        </div>

        {/* Taxa de Retenção (A Regra de Ouro) */}
        <div className={`bg-white p-6 rounded-3xl border-2 shadow-sm flex items-center justify-between ${healthMetrics.retention >= 10 ? 'border-emerald-100 bg-emerald-50/10' : 'border-rose-100 bg-rose-50/10'}`}>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Retenção</p>
            <h3 className={`text-2xl font-bold ${healthMetrics.retention >= 10 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {healthMetrics.retention.toFixed(0)}%
            </h3>
          </div>
          <div className="w-12 h-12">
            <ResponsiveContainer>
              <PieChart>
                <Pie 
                  data={[{v: healthMetrics.retention}, {v: 100 - healthMetrics.retention}]} 
                  innerRadius={15} outerRadius={22} stroke="none" dataKey="v" startAngle={90} endAngle={-270}
                >
                  <Cell fill={healthMetrics.retention >= 10 ? '#10b981' : '#f43f5e'} />
                  <Cell fill="#f1f5f9" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LADO ESQUERDO: Layout Principal */}
        <div className="lg:col-span-2 space-y-8">
          {/* Gráfico de Comprometimento de Renda */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-slate-800">Comprometimento de Renda</h3>
                <p className="text-xs text-slate-500 italic">Peso das despesas essenciais sobre o ganho total</p>
              </div>
              <span className={`text-sm font-bold ${healthMetrics.commitment > 50 ? 'text-amber-500' : 'text-emerald-600'}`}>
                {healthMetrics.commitment.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${healthMetrics.commitment > 50 ? 'bg-amber-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(100, healthMetrics.commitment)}%` }}
              />
            </div>
            <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>0% (Ideal)</span>
              <span>50% (Atenção)</span>
              <span>100% (Crítico)</span>
            </div>
          </div>

          {/* Listagem de Transações Simplificada */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Últimos Lançamentos</h3>
              <Search size={16} className="text-slate-300" />
            </div>
            <ul className="divide-y divide-slate-50">
              {transactions.slice(0, 5).map((t) => (
                <li key={t.id} className="p-5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${t.isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {t.isPaid ? '✅' : '⏳'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{t.description}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{t.categoryName}</p>
                    </div>
                  </div>
                  <span className={`font-bold text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.valueCents)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* LADO DIREITO: Gráficos e Insights (A área circulada) */}
        <div className="space-y-6">
          
          {/* Distribuição por Categoria */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 text-sm">Distribuição de Gastos</h3>
            {expensesByCategory.length > 0 ? (
              <>
                <div className="h-48 w-full mb-6">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={expensesByCategory} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {expensesByCategory.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value * 100)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {expensesByCategory.slice(0, 4).map((cat, i) => (
                    <div key={i} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-600">
                        <span>{cat.name}</span>
                        <span>{formatCurrency(cat.value * 100)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{width: `${(cat.value / totalExpenses) * 100}%`, backgroundColor: cat.color}} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-center text-slate-400 italic py-8">Nenhuma despesa registrada.</p>
            )}
          </div>

          {/* Insights Inteligentes */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 text-sm flex items-center gap-2">
              <Zap size={16} className="text-amber-500" /> Insights do MyFinn
            </h3>
            <div className="space-y-4">
              {healthMetrics.retention >= 10 ? (
                <p className="text-xs text-slate-600 leading-relaxed">
                  🌟 **Excelente!** Você está retendo mais de 10% da sua renda. Este é o caminho para a liberdade financeira.
                </p>
              ) : (
                <p className="text-xs text-slate-600 leading-relaxed">
                  ⚠️ **Atenção:** Sua taxa de retenção está abaixo de 10%. Tente reduzir gastos variáveis para "pagar a si mesmo" primeiro.
                </p>
              )}
              {healthMetrics.commitment > 50 && (
                <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-50 pt-4">
                  🏠 Suas contas fixas estão pesando muito no orçamento. Considere renegociar contratos ou reduzir custos recorrentes.
                </p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* MODAL NOVA TRANSAÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative border border-slate-100">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition-colors bg-slate-50 p-2 rounded-full">
              <X size={18} />
            </button>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-8">Nova Transação</h2>
            
            <form onSubmit={handleCreateTransaction} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Tipo</label>
                  <select value={newTx.type} onChange={e => setNewTx({...newTx, type: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                    <option value="outcome">Despesa</option>
                    <option value="income">Receita</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Valor (R$)</label>
                  <input type="number" step="0.01" required value={newTx.valueCents} onChange={e => setNewTx({...newTx, valueCents: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold" placeholder="0.00" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Descrição</label>
                <input type="text" required value={newTx.description} onChange={e => setNewTx({...newTx, description: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Ex: Conta de Luz, Salário..." />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Data</label>
                  <input type="date" required value={newTx.date} onChange={e => setNewTx({...newTx, date: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Categoria</label>
                  <select required value={newTx.categoryId} onChange={e => setNewTx({...newTx, categoryId: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                    <option value="">Selecione...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Método</label>
                  <select value={newTx.paymentMethod} onChange={e => setNewTx({...newTx, paymentMethod: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                    <option value="DEBIT">Débito</option>
                    <option value="CREDIT">Crédito</option>
                    <option value="CASH">Dinheiro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                  <select value={newTx.isPaid} onChange={e => setNewTx({...newTx, isPaid: e.target.value === 'true'})} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                    <option value="true">Já Pago</option>
                    <option value="false">Pendente</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl mt-6 transition-all shadow-md shadow-blue-600/20">
                Salvar Transação
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}