# Contexto do Projeto: MyFinn (Frontend)

## 1. Visão Geral
MyFinn é um sistema web de gestão financeira pessoal. O usuário pode registrar receitas, despesas, gerenciar categorias e ver um dashboard com o resumo financeiro.

## 2. Stack Tecnológica
* **Framework:** React (criado com Vite).
* **Linguagem:** JavaScript (JSX).
* **Estilização:** Tailwind CSS (exclusivamente. Não crie arquivos .css adicionais).
* **Roteamento:** React Router DOM.
* **Ícones:** `lucide-react`.
* **Gráficos:** `recharts`.
* **Requisições HTTP:** Axios (configurado em `src/services/api.js`).

## 3. Design System & UI Guidelines
Para manter a consistência visual em todas as páginas, utilize estritamente estas regras de Tailwind:
* **Background da Aplicação (Main):** `bg-[#F8FAFC]` (um tom bem claro e limpo).
* **Sidebar (Barra Lateral):** Fundo escuro `bg-[#1E1E1E]`, com textos padrão em `text-slate-400` e itens ativos com background `bg-blue-600/10 text-blue-500`.
* **Cor Primária/Destaque:** `blue-600` (botões principais, destaques).
* **Cards (Cartões de conteúdo):** Fundo branco `bg-white`, bordas sutis `border border-slate-100`, cantos bem arredondados `rounded-2xl` (ou `3xl`), e sombra leve `shadow-sm`.
* **Tipografia:** * Títulos principais: `text-slate-800 font-bold`.
    * Textos secundários/descrições: `text-slate-500` ou `text-slate-400`.
    * Valores positivos: `text-emerald-600` / Valores negativos: `text-rose-600`.

### 3.1. Padrões de Interface Específicos [NOVO]
* **Cabeçalhos de Página:** Toda página deve iniciar com `<header className="mb-8">` contendo um `h1` (`text-2xl font-bold text-slate-800`) e um `p` (`text-slate-500 text-sm`).
* **Estados Vazios / Em Construção:** Utilize um card centralizado (`bg-white p-16 rounded-3xl text-center flex flex-col items-center justify-center`). Inclua um ícone do Lucide (tamanho 40) dentro de um círculo colorido (`w-20 h-20 rounded-full flex items-center justify-center mb-6`).

## 4. Estrutura de Layout e Páginas [ATUALIZADO]
* **Layout Global:** O projeto utiliza um padrão de Layout (localizado em `src/components/Layout.jsx`). Este componente já engloba o fundo da aplicação (`bg-[#F8FAFC]`) e a barra de navegação lateral (`Sidebar`).
* **Criação/Refatoração de Páginas:** Novas páginas (em `src/pages/`) **NÃO** devem incluir menus laterais, barras de topo ou fundos de tela cheia. Elas devem retornar apenas o conteúdo interno (ex: o header da página e os grids), pois serão renderizadas dentro do `<Outlet />` do Layout.

## 4. Regras de Negócio e Formatação [NOVO]
* **Moeda:** O backend trabalha com centavos (`valueCents`). Ao enviar para a API, multiplique por 100 e arredonde. Ao exibir na tela, divida por 100 e formate usando `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
* **Datas:** O backend espera o formato ISO ou `YYYY-MM-DD`. Para exibição, use o padrão brasileiro `DD/MM/YYYY`.
* **Feedback (UX):** Para mensagens de sucesso ou erro (ex: falha no login, transação salva), utilize a função nativa `alert()` (ou atualize esta regra caso instalemos bibliotecas como react-toastify).

## 5. Regras de Código e Arquitetura
* Use apenas Componentes Funcionais (Functional Components) e Hooks (`useState`, `useEffect`, `useMemo`). Evite criar estados desnecessários.
* **Autenticação:** O token JWT é armazenado no `localStorage` com a chave `@MyFinn:token`.
* **Refatoração:** Ao refatorar um código existente, mantenha a lógica de conexão com a API intacta, foque apenas em reorganizar a estrutura do JSX e padronizar as classes do Tailwind.
* **Modularização:** Se uma página estiver muito grande (como a Sidebar repetida em várias telas), extraia para a pasta `src/components/`.