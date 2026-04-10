import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

export function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💰');
  const [color, setColor] = useState('#3B82F6');
  
  // NOVO: Estado para sabermos se estamos a editar alguma categoria
  const [editingId, setEditingId] = useState(null); 
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      if (error.response?.status === 403) navigate('/login');
    } finally {
      setIsLoading(false);
    }
  }

  // NOVO: Função que lida tanto com Criar como com Editar
  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingId) {
        // Se tem ID de edição, fazemos PUT
        await api.put(`/categories/${editingId}`, { name, icon, color });
      } else {
        // Senão, fazemos POST normal
        await api.post('/categories', { name, icon, color });
      }
      
      resetForm();
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || "Erro ao salvar categoria");
    } finally {
      setIsSubmitting(false);
    }
  }

  // NOVO: Função para apagar (Soft Delete)
  async function handleDelete(id) {
    const confirm = window.confirm("Tem certeza que deseja excluir esta categoria?");
    if (!confirm) return;

    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (error) {
      alert("Erro ao excluir categoria");
    }
  }

  // NOVO: Preenche o formulário com os dados da categoria clicada
  function handleEditClick(category) {
    setEditingId(category.id);
    setName(category.name);
    setIcon(category.icon);
    setColor(category.color);
  }

  function resetForm() {
    setEditingId(null);
    setName('');
    setIcon('💰');
    setColor('#3B82F6');
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-100">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-primary text-white p-6 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-white/80 hover:text-white transition-colors">← Voltar</Link>
            <h1 className="text-2xl font-bold">Categorias</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 flex flex-col md:flex-row gap-6">
        
        {/* Formulário */}
        <div className="bg-white p-6 rounded-xl shadow-sm md:w-1/3 h-fit">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            {editingId ? 'Editar Categoria' : 'Nova Categoria'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none" />
            </div>
            
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
                <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={2} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-primary focus:border-primary outline-none" />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-[42px] p-1 border border-gray-300 rounded-lg cursor-pointer" />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button type="submit" disabled={isSubmitting} className="flex-1 bg-primary hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50">
                {isSubmitting ? 'A salvar...' : (editingId ? 'Atualizar' : 'Criar')}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition-colors">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Lista de Categorias com Botões */}
        <div className="bg-white p-6 rounded-xl shadow-sm md:w-2/3">
          <h2 className="text-lg font-bold text-gray-800 mb-4">As Minhas Categorias</h2>
          
          {categories.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Ainda não criou nenhuma categoria.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {categories.map(cat => (
                <div key={cat.id} className="border border-gray-100 rounded-lg p-4 flex flex-col items-center justify-center shadow-sm relative group hover:shadow-md transition-all">
                  
                  {/* Botões de Ação (Aparecem ao passar o rato por cima) */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditClick(cat)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1 rounded" title="Editar">✏️</button>
                    <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-1 rounded" title="Excluir">🗑️</button>
                  </div>

                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2" style={{ backgroundColor: `${cat.color}20` }}>
                    {cat.icon}
                  </div>
                  <span className="font-medium text-gray-800 text-sm text-center">{cat.name}</span>
                  <div className="w-4 h-1 rounded-full mt-2" style={{ backgroundColor: cat.color }}></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}