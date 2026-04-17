import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import Footer from '../components/Footer';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  // Função disparada ao clicar em "Entrar"
  async function handleLogin(e) {
    e.preventDefault(); // Evita que a página recarregue
    setIsLoading(true);
    setErrorMessage('');

    try {
      // 1. Fazemos o pedido POST para o nosso Backend
      const response = await api.post('/auth/login', {
        email,
        password
      });

      // 2. Se der certo, guardamos o token recebido
      const token = response.data.token;
      localStorage.setItem('@MyFinn:token', token);

      // 3. Redirecionamos o utilizador para a página inicial (Dashboard)
      navigate('/');
      
    } catch (error) {
      // Se o Backend devolver um erro (ex: senha errada), mostramos ao utilizador
      if (error.response && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Erro ao tentar fazer login. Verifique os seus dados.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    // Fundo cinza a ocupar 100% da altura da tela, conteúdo centrado
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
    <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 my-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">MyFinn</h2>
          <p className="text-gray-500 mt-2">Bem-vindo de volta! Faça o seu login.</p>
        </div>

        {/* Mensagem de Erro (só aparece se houver erro) */}
        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'A entrar...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Ainda não tem uma conta?{' '}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Registe-se aqui
          </Link>
        </p>
      </div>
      <Footer />
    </div>
  );
}