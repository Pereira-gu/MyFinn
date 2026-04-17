import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Categories } from './pages/Categories';
import { Investments } from './pages/Investments';
import { Profile } from './pages/Profile';
import { Layout } from './components/Layout';
import { Academy } from './pages/Academy';
import { Transactions } from './pages/Transactions';
import { Goals } from './pages/Goals';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas (Sem Sidebar) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rotas Privadas (Com Sidebar e fundo padrão) */}
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/academy" element={<Academy />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/categories" element={<Categories />} />
        </Route>

        {/* Fallback: Se a rota não existir, manda para a Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;