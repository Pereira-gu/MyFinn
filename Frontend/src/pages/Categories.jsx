import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PlusCircle, X, Tag, Trash2 } from 'lucide-react';

export function Categories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado para nova categoria
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '💰',
    color: '#3B82F6'
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
      await api.post('/categories', newCategory);
      setIsModalOpen(false);
      setNewCategory({ name: '', icon: '💰', color: '#3B82F6' });
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
      {/* CABEÇALHO PADRONIZADO */}
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

      {/* GRID DE CATEGORIAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div 
            key={category.id}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative"
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner"
                style={{ backgroundColor: `${category.color}15` }} // Cor com 15% de opacidade
              >
                {category.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800">{category.name}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {category.color}
                  </span>
                </div>
              </div>
            </div>

            {/* Botão de Excluir (Aparece no Hover) */}
            <button 
              onClick={() => handleDeleteCategory(category.id)}
              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* MODAL NOVA CATEGORIA (Estilo Dashboard) */}
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