import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // ESTADOS DO DASHBOARD
  const [summary, setSummary] = useState({ income: 0, outcome: 0, balance: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // TEMPO E PAGINAÇÃO
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // ESTADOS DO MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState(null); 
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [type, setType] = useState('outcome');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('DEBIT');
  const [installments, setInstallments] = useState(1);
  const [isPaid, setIsPaid] = useState(true); // NOVO: Status no formulário
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // ==========================================
  // NOVO: DADOS PARA O GRÁFICO (RAIO-X)
  // ==========================================
  const expensesByCategory = transactions
    .filter(t => t.type === 'outcome') // Pega apenas nas saídas
    .reduce((acc, t) => {
      const existing = acc.find(item => item.name === t.categoryName);
      if (existing) {
        existing.value += (t.valueCents / 100); // Soma o valor se a categoria já existir
      } else {
        // Se for uma categoria nova, procura a cor dela na nossa lista de categorias
        const cat = categories.find(c => c.name === t.categoryName);
        acc.push({
          name: t.categoryName,
          value: (t.valueCents / 100),
          color: cat ? cat.color : '#3B82F6' // Se não achar cor, põe azul
        });
      }
      return acc;
    }, [])
    .sort((a, b) => b.value - a.value); // Ordena da maior despesa para a mais pequena

  useEffect(() => {
    const token = localStorage.getItem('@MyFinn:token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchTransactions();
    fetchCategories();
  }, [navigate, currentMonth, currentYear, currentPage]); // Roda sempre que a página ou o tempo mudam

  async function fetchTransactions() {
    setIsLoading(true);
    try {
      // Agora chamamos a nossa rota especial "/dashboard" passando a página!
      const response = await api.get(`/transactions/dashboard?month=${currentMonth}&year=${currentYear}&page=${currentPage}&size=5`);
      
      // O Backend agora devolve tudo separadinho
      setSummary({
        income: response.data.incomeCents,
        outcome: response.data.outcomeCents,
        balance: response.data.balanceCents
      });
      
      setTransactions(response.data.transactions.content); // A lista real
      setTotalPages(response.data.transactions.totalPages); // O total de páginas

    } catch (error) {
      if (error.response?.status === 403) handleLogout();
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error("Erro ao buscar categorias");
    }
  }

  // ==========================================
  // O BOTÃO "JÁ PAGUEI"
  // ==========================================
  async function handleTogglePaid(transaction) {
    try {
      // Chama a rota rápida PATCH
      await api.patch(`/transactions/${transaction.id}/pay`);
      fetchTransactions(); // Atualiza a lista
    } catch (error) {
      alert("Erro ao alterar o status.");
    }
  }

  // ==========================================
  // NAVEGAÇÃO
  // ==========================================
  function handlePrevMonth() {
    setCurrentPage(0); // Volta para a pág 1 ao mudar de mês
    if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(currentYear - 1); } 
    else { setCurrentMonth(currentMonth - 1); }
  }

  function handleNextMonth() {
    setCurrentPage(0); // Volta para a pág 1 ao mudar de mês
    if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(currentYear + 1); } 
    else { setCurrentMonth(currentMonth + 1); }
  }

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  // ==========================================
  // FORMULÁRIO
  // ==========================================
  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const numericValue = parseFloat(value.replace(',', '.'));
      const valueCents = Math.round(numericValue * 100);
      const formattedDate = date.includes('T') ? date : `${date}T12:00:00`;

      const payload = { 
        description, valueCents, type, date: formattedDate, 
        categoryId, paymentMethod, installments: parseInt(installments),
        isPaid // Enviamos se foi pago ou não
      };

      if (editingTransactionId) {
        await api.put(`/transactions/${editingTransactionId}`, payload);
      } else {
        await api.post('/transactions', payload);
      }

      closeModal();
      fetchTransactions();
    } catch (error) {
      alert(error.response?.data?.message || "Erro ao salvar transação.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteTransaction(id) {
    if (!window.confirm("Tem certeza que deseja excluir esta transação?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (error) {
      alert("Erro ao excluir transação.");
    }
  }

  function openEditModal(t) {
    setEditingTransactionId(t.id);
    setDescription(t.description);
    setValue((t.valueCents / 100).toFixed(2)); 
    setType(t.type);
    setDate(t.date.split('T')[0]); 
    setCategoryId(t.categoryId);
    setPaymentMethod(t.paymentMethod || 'DEBIT');
    setInstallments(t.installments || 1);
    setIsPaid(t.isPaid); // Carrega o status
    setIsModalOpen(true);
  }

  function openNewTransactionModal() {
    setEditingTransactionId(null);
    setDescription('');
    setValue('');
    setType('outcome');
    setDate(new Date().toISOString().split('T')[0]);
    if (categories.length > 0) setCategoryId(categories[0].id);
    setPaymentMethod('DEBIT');
    setInstallments(1);
    setIsPaid(true); // Por padrão, começa como pago
    setIsModalOpen(true);
  }

  function closeModal() { setIsModalOpen(false); }
  function handleLogout() { localStorage.removeItem('@MyFinn:token'); navigate('/login'); }

  // ==========================================
  // HELPERS
  // ==========================================
  function formatCurrency(cents) {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function formatDate(dateString) { return new Date(dateString).toLocaleDateString('pt-BR'); }
  
  function getPaymentMethodLabel(method) {
    if(method === 'CREDIT') return '💳 Crédito';
    if(method === 'CASH') return '💵 Dinheiro';
    return '🏦 Débito';
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-100">Carregando...</div>;



  return (
    <div className="min-h-screen bg-gray-100 font-sans relative pb-10">
      <header className="bg-primary text-white p-6 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">MyFinn</h1>
          <div className="flex gap-4 items-center">
            <Link to="/categories" className="hover:underline text-sm font-medium">Categorias</Link>
            <button onClick={handleLogout} className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors text-sm font-medium">Sair</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 -mt-8">
        
        {/* NAVEGAÇÃO TEMPORAL */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-6">
          <button onClick={handlePrevMonth} className="text-gray-500 hover:text-primary text-2xl px-4 font-bold">‹</button>
          <div className="text-center">
            <span className="block text-lg font-bold text-gray-800">{monthNames[currentMonth - 1]}</span>
            <span className="block text-xs text-gray-500 font-medium">{currentYear}</span>
          </div>
          <button onClick={handleNextMonth} className="text-gray-500 hover:text-primary text-2xl px-4 font-bold">›</button>
        </div>

        {/* CARDS (Agora usam o Summary que vem do Backend!) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Entradas</h3>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(summary.income)}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Saídas</h3>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(summary.outcome)}</p>
          </div>
          <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${summary.balance >= 0 ? 'border-primary' : 'border-red-500'}`}>
            <h3 className="text-gray-500 text-sm font-medium mb-1">Saldo do Mês</h3>
            <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-primary' : 'text-red-600'}`}>{formatCurrency(summary.balance)}</p>
          </div>
        </div>

        {expensesByCategory.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8 animate-fade-in">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Raio-X de Saídas ({monthNames[currentMonth - 1]})</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60} // Faz o buraco no meio (Donut)
                    outerRadius={80}
                    paddingAngle={5} // Espaço entre as fatias
                    dataKey="value"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  {/* Quando passas o rato, formata para Moeda! */}
                  <Tooltip formatter={(value) => formatCurrency(value * 100)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}


        {/* LISTA DE TRANSAÇÕES */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Transações de {monthNames[currentMonth - 1]}</h2>
            <button onClick={openNewTransactionModal} className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              + Nova
            </button>
          </div>
          
          <div className="p-0">
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Não há transações registadas.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {transactions.map((t) => (
                  // Se não estiver pago, a linha fica ligeiramente transparente
                  <li key={t.id} className={`p-6 flex justify-between items-center group transition-all ${!t.isPaid ? 'opacity-60 bg-gray-50' : 'hover:bg-gray-50'}`}>
                    
                    <div className="flex items-center gap-4">
                      {/* O BOTÃO MÁGICO "JÁ PAGUEI" */}
                      <button 
                        onClick={() => handleTogglePaid(t)} 
                        className="text-2xl hover:scale-110 transition-transform active:scale-95" 
                        title={t.isPaid ? "Marcar como pendente" : "Marcar como pago"}
                      >
                        {t.isPaid ? '✅' : '⏳'}
                      </button>

                      <div>
                        {/* Se não estiver pago, risca o nome */}
                        <p className={`font-medium ${!t.isPaid ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{t.description}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(t.date)} • {t.categoryName} • {getPaymentMethodLabel(t.paymentMethod)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button onClick={() => openEditModal(t)} className="text-blue-500 hover:text-blue-700 text-sm font-medium bg-blue-50 px-2 py-1 rounded">Editar</button>
                        <button onClick={() => handleDeleteTransaction(t.id)} className="text-red-500 hover:text-red-700 text-sm font-medium bg-red-50 px-2 py-1 rounded">Excluir</button>
                      </div>
                      <div className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'income' ? '+' : '-'} {formatCurrency(t.valueCents)}
                      </div>
                    </div>

                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* CONTROLES DE PAGINAÇÃO */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50">
              <button 
                disabled={currentPage === 0} 
                onClick={() => setCurrentPage(c => c - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600 font-medium">
                Página {currentPage + 1} de {totalPages}
              </span>
              <button 
                disabled={currentPage === totalPages - 1} 
                onClick={() => setCurrentPage(c => c + 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      </main>

      {/* MODAL MANTÉM-SE IGUAL, MAS COM A CAIXA "JÁ PAGUEI" NO FINAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 animate-fade-in overflow-y-auto max-h-[90vh]">
            {/* Cabeçalho do Modal... */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">{editingTransactionId ? 'Editar Transação' : 'Nova Transação'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-800 text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Entradas... */}
              <div className="flex gap-4">
                <label className={`flex-1 text-center py-2 border rounded-lg cursor-pointer transition-colors ${type === 'outcome' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-600 border-gray-300'}`}>
                  <input type="radio" name="type" className="hidden" checked={type === 'outcome'} onChange={() => setType('outcome')} /> Saída
                </label>
                <label className={`flex-1 text-center py-2 border rounded-lg cursor-pointer transition-colors ${type === 'income' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-300'}`}>
                  <input type="radio" name="type" className="hidden" checked={type === 'income'} onChange={() => setType('income')} /> Entrada
                </label>
              </div>

              <div><label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label><input type="text" required value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-primary focus:border-primary" /></div>
              
              <div className="flex gap-4">
                <div className="w-1/2"><label className="block text-sm font-medium text-gray-700 mb-1">Valor</label><input type="text" required value={value} onChange={e => setValue(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-primary focus:border-primary" /></div>
                <div className="w-1/2"><label className="block text-sm font-medium text-gray-700 mb-1">Data</label><input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-primary focus:border-primary" /></div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select required value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-primary focus:border-primary">
                  {categories.map(c => (<option key={c.id} value={c.id}>{c.icon} {c.name}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pagamento</label>
                <div className="flex gap-2">
                  <label className={`flex-1 text-center py-2 border rounded-lg cursor-pointer transition-colors text-sm ${paymentMethod === 'CASH' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-300'}`}><input type="radio" className="hidden" checked={paymentMethod === 'CASH'} onChange={() => { setPaymentMethod('CASH'); setInstallments(1); }} /> Dinheiro</label>
                  <label className={`flex-1 text-center py-2 border rounded-lg cursor-pointer transition-colors text-sm ${paymentMethod === 'DEBIT' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-300'}`}><input type="radio" className="hidden" checked={paymentMethod === 'DEBIT'} onChange={() => { setPaymentMethod('DEBIT'); setInstallments(1); }} /> Débito</label>
                  <label className={`flex-1 text-center py-2 border rounded-lg cursor-pointer transition-colors text-sm ${paymentMethod === 'CREDIT' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-300'}`}><input type="radio" className="hidden" checked={paymentMethod === 'CREDIT'} onChange={() => setPaymentMethod('CREDIT')} /> Crédito</label>
                </div>
              </div>

              {paymentMethod === 'CREDIT' && (
                <div className="animate-fade-in"><label className="block text-sm font-medium text-gray-700 mb-1">Número de Parcelas</label><input type="number" min="1" max="24" required value={installments} onChange={e => setInstallments(e.target.value)} disabled={!!editingTransactionId} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-primary focus:border-primary disabled:bg-gray-100" /></div>
              )}

              {/* NOVO: CHECKBOX DE STATUS NO FORMULÁRIO */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={isPaid} onChange={e => setIsPaid(e.target.checked)} className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary" />
                  <span className="text-sm font-medium text-gray-700">A transação já foi paga / efetuada?</span>
                </label>
              </div>

              <button type="submit" disabled={isSubmitting || categories.length === 0} className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-lg mt-6 transition-colors disabled:opacity-50">
                {isSubmitting ? 'A salvar...' : (editingTransactionId ? 'Atualizar Transação' : 'Salvar Transação')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}