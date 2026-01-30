# EstoquePlan Frontend

Frontend do sistema EstoquePlan com autenticação JWT integrada ao backend usando cookies HTTP-only.

## Funcionalidades Implementadas

- ✅ Sistema de login com JWT usando cookies HTTP-only
- ✅ Proteção de rotas (autenticação obrigatória)
- ✅ Armazenamento seguro do token em cookies (não localStorage)
- ✅ Logout funcional com limpeza de cookies
- ✅ Interface moderna com Material-UI
- ✅ Validação de formulários
- ✅ Feedback visual de loading e erros
- ✅ Tratamento automático de erros 401 (redirecionamento para login)
- ✅ Verificação assíncrona de autenticação

## Como Testar

### 1. Configuração do Backend
Certifique-se de que o backend do estoquePlan está rodando na porta 8080 (ou ajuste a configuração em `src/config/api.js`).

### 2. Instalação das Dependências
```bash
npm install
```

### 3. Executar o Frontend
```bash
npm start
```

O frontend estará disponível em `http://localhost:3000`

### 4. Teste do Login

1. Acesse `http://localhost:3000`
2. Use as credenciais do seu backend:
   - **Email**: (email cadastrado no backend)
   - **Senha**: (senha cadastrada no backend)
3. Clique em "Login"
4. Se as credenciais estiverem corretas, você será redirecionado para o Dashboard

### 5. Navegação

Após o login, você pode:
- Navegar entre Dashboard e Produtos usando o header
- Fazer logout clicando no botão "Sair"

## Estrutura do Projeto

```
src/
├── components/
│   ├── Header.js          # Header com navegação e logout
│   ├── ProtectedRoute.js  # Componente para proteger rotas
│   └── LoadingSpinner.js  # Componente de loading
├── config/
│   └── api.js            # Configuração da API
├── contexts/
│   └── UserContext.js    # Contexto do usuário
├── hooks/
│   └── useAuthError.js   # Hook para tratamento de erros de auth
├── pages/
│   ├── Login.js          # Página de login
│   ├── Dashboard.js      # Dashboard principal
│   └── Produtos.js       # Gestão de produtos
├── services/
│   └── api.js           # Serviço de comunicação com backend
└── App.js               # Roteamento principal
```

## Configuração da API

Para alterar a URL do backend, edite o arquivo `src/config/api.js`:

```javascript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080', // Altere aqui
  // ...
};
```

Ou use variáveis de ambiente criando um arquivo `.env`:

```
REACT_APP_API_URL=http://localhost:8080
```

## Fluxo de Autenticação

1. **Login**: Usuário envia email e senha
2. **Validação**: Backend valida credenciais
3. **Cookie**: Backend retorna JWT token em cookie HTTP-only
4. **Acesso**: Cookie é enviado automaticamente em todas as requisições autenticadas
5. **Logout**: Backend limpa o cookie através do endpoint de logout

## Principais Mudanças Implementadas

### Segurança Aprimorada
- **Cookies HTTP-only**: Token JWT agora é armazenado em cookies seguros
- **Sem localStorage**: Eliminação do armazenamento inseguro de tokens
- **withCredentials**: Todas as requisições incluem cookies automaticamente

### Tratamento de Erros
- **Hook useAuthError**: Tratamento consistente de erros 401
- **Redirecionamento automático**: Usuário é redirecionado para login em caso de token expirado
- **Limpeza de estado**: Estado do usuário é limpo automaticamente

### Verificação de Autenticação
- **Método assíncrono**: `isAuthenticated()` agora faz requisição ao backend
- **Loading states**: Feedback visual durante verificação de autenticação
- **Proteção de rotas**: Verificação robusta antes de renderizar páginas protegidas

## Tecnologias Utilizadas

- React 18
- React Router DOM
- Material-UI
- Fetch API para requisições HTTP
- Cookies HTTP-only para persistência do token
- Context API para gerenciamento de estado do usuário

## Endpoints Utilizados

- `POST /auth/login` - Autenticação
- `POST /auth/logout` - Logout
- `GET /me` - Dados do usuário logado
- `GET /produtos` - Listar produtos (também usado para verificação de autenticação)
- `PUT /user/profile` - Atualização de dados do usuário
- `POST /user/profile/image` - Upload de foto do perfil
- `GET /produtos` - Listar produtos
- `POST /produtos` - Criar produto
- `PUT /produtos/{id}` - Atualizar produto
- `DELETE /produtos/{id}` - Deletar produto
