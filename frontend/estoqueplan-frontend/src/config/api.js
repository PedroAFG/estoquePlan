// Configuração da API
export const API_CONFIG = {
  // URL base da API - ajuste conforme necessário
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  
  // Endpoints
  ENDPOINTS: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/usuarios/me', // Endpoint para dados do usuário logado
    USER_PROFILE: '/user/profile',
    USER_PROFILE_IMAGE: '/user/profile/image',
    PRODUTOS: '/produtos',
    PRODUTO: '/produtos', // Para POST, PUT, DELETE de um produto específico
    CATEGORIAS: '/categorias', // Endpoint para buscar categorias
    // Adicione outros endpoints conforme necessário
  }
};

export default API_CONFIG; 