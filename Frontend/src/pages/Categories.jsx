import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PlusCircle, X, Trash2, Pin } from 'lucide-react';

export function Categories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 1. Estado atualizado com o campo isFixed
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '💰',
    color: '#3B82F6',
    isFixed: false 
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setIsLoading(true);
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateCategory(e) {
    e.preventDefault();
    try {
      // O axios envia o objeto newCategory inteiro, agora incluindo o isFixed!
      await api.post('/categories', newCategory);
      setIsModalOpen(false);
      
      // Reseta o formulário
      setNewCategory({ name: '', icon: '💰', color: '#3B82F6', isFixed: false });
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || "Erro ao criar categoria.");
    }
  }

  async function handleDeleteCategory(id) {
    if (!window.confirm("Tem certeza que deseja excluir esta categoria?")) return;
    
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (error) {
      alert("Não foi possível excluir. Verifique se existem transações vinculadas a esta categoria.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500 font-medium">
        Carregando categorias...
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gerir Categorias</h1>
          <p className="text-slate-500 text-sm mt-1">Personalize como você organiza suas receitas e despesas.</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm shadow-blue-600/20 transition-all"
        >
          <PlusCircle size={18} /> Nova Categoria
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div 
            key={category.id}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
          >
            {/* 3. Badge Visual para Categorias Fixas */}
            {category.isFixed && (
              <div className="absolute top-0 right-0 bg-amber-100 text-amber-700 text-[9px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 uppercase tracking-wider">
                <Pin size={10} /> Essencial
              </div>
            )}

            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0"
                style={{ backgroundColor: `${category.color}15` }}
              >
                {category.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 truncate pr-4">{category.name}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {category.color}
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => handleDeleteCategory(category.id)}
              className={`absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 transition-all ${category.isFixed ? 'opacity-100 mt-6' : 'opacity-0 group-hover:opacity-100'}`}
              title="Excluir Categoria"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* MODAL NOVA CATEGORIA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative border border-slate-100">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition-colors bg-slate-50 p-2 rounded-full"
            >
              <X size={18} />
            </button>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-8">Criar Categoria</h2>
            
            <form onSubmit={handleCreateCategory} className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Nome da Categoria</label>
                <input 
                  type="text" 
                  required 
                  value={newCategory.name}
                  onChange={e => setNewCategory({...newCategory, name: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Ex: Alimentação, Lazer..."
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Ícone (Emoji)</label>
                  <input 
                    type="text" 
                    required 
                    value={newCategory.icon}
                    onChange={e => setNewCategory({...newCategory, icon: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-center text-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Cor (Hex)</label>
                  <div className="flex gap-2">
                    <input 
                      type="color" 
                      value={newCategory.color}
                      onChange={e => setNewCategory({...newCategory, color: e.target.value})}
                      className="w-12 h-11 p-1 bg-white border border-slate-200 rounded-xl cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={newCategory.color}
                      onChange={e => setNewCategory({...newCategory, color: e.target.value})}
                      className="flex-1 p-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Toggle de Despesa Fixa */}
              <div className="flex items-start gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                <input 
                  type="checkbox" 
                  id="isFixed"
                  checked={newCategory.isFixed}
                  onChange={e => setNewCategory({...newCategory, isFixed: e.target.checked})}
                  className="mt-1 w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <label htmlFor="isFixed" className="text-sm font-bold text-slate-700 cursor-pointer">
                    Despesa Essencial (Custo Fixo)
                  </label>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                    Marque se for um custo obrigatório do mês (ex: Moradia, Energia, Água). Isso ajuda no cálculo de saúde do Dashboard.
                  </p>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl mt-4 transition-all shadow-md shadow-blue-600/20"
              >
                Salvar Categoria
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}