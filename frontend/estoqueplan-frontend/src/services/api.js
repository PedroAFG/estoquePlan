import API_CONFIG from '../config/api';

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Método para fazer login
  async login(login, senha) {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante: incluir cookies
        body: JSON.stringify({
          login,
          senha
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Credenciais inválidas');
        }
        throw new Error('Erro ao fazer login');
      }

      // O JWT é enviado automaticamente em cookie HttpOnly
      // Retornamos os dados do usuário do body da resposta
      const userData = await response.json();
      return userData;
    } catch (error) {
      throw error;
    }
  }

  // Método para fazer logout
  async logout() {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.LOGOUT}`, {
        method: 'POST',
        credentials: 'include', // Importante: incluir cookies
      });

      // Mesmo que a requisição falhe, limpar o estado local
      return true;
    } catch (error) {
      console.error('Erro no logout:', error);
      return true; // Sempre retornar true para limpar o estado local
    }
  }

  // Método para buscar dados do usuário logado
  async getMe() {
    try {
      const response = await this.authenticatedRequest(API_CONFIG.ENDPOINTS.ME);
      if (!response.ok) {
        throw new Error('Erro ao buscar dados do usuário');
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Método para buscar dados do usuário (mantido para compatibilidade)
  async getUserProfile() {
    return this.getMe();
  }

  // Método para atualizar dados do usuário
  async updateUserProfile(userData) {
    try {
      const response = await this.authenticatedRequest('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar dados do usuário');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Método para fazer upload da foto do perfil
  async uploadProfileImage(imageFile) {
    try {
      const formData = new FormData();
      formData.append('profileImage', imageFile);

      const response = await this.authenticatedRequest('/user/profile/image', {
        method: 'POST',
        headers: {
          // Remover Content-Type para que o browser defina automaticamente com boundary
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Método para buscar todos os produtos
  async getProdutos({ incluirInativos = false } = {}) {
    try {
      const query = incluirInativos ? '?incluirInativos=true' : '';
      const response = await this.authenticatedRequest(
        `${API_CONFIG.ENDPOINTS.PRODUTOS}${query}`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar produtos');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }


  // Inativar produto (soft delete)
  async inativarProduto(id) {
    try {
      const response = await this.authenticatedRequest(
        `${API_CONFIG.ENDPOINTS.PRODUTO}/${id}/inativar`,
        {
          method: 'PATCH',
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao inativar produto');
      }

      // 204 No Content → não retorna nada
      return true;
    } catch (error) {
      throw error;
    }
  }





  // Método para buscar todas as categorias
  async getCategorias() {
    try {
      const response = await this.authenticatedRequest(API_CONFIG.ENDPOINTS.CATEGORIAS);
      if (!response.ok) {
        throw new Error('Erro ao buscar categorias');
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Método para buscar um produto específico
  async getProduto(id) {
    try {
      const response = await this.authenticatedRequest(`${API_CONFIG.ENDPOINTS.PRODUTO}/${id}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar produto');
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Método para criar um novo produto
  async createProduto(produtoData) {
    try {
      const response = await this.authenticatedRequest(API_CONFIG.ENDPOINTS.PRODUTO, {
        method: 'POST',
        body: JSON.stringify(produtoData),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar produto');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Método para atualizar um produto
  async updateProduto(id, produtoData) {
    try {
      const response = await this.authenticatedRequest(`${API_CONFIG.ENDPOINTS.PRODUTO}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(produtoData),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar produto');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }


  // Método para buscar vendas
  async getVendas() {
    const response = await this.authenticatedRequest('/vendas');
    if (!response.ok) throw new Error('Erro ao buscar vendas');
    return await response.json();
  }

  // Método para criar uma nova venda
  async createVenda(vendaData) {
    try {
      const response = await this.authenticatedRequest('/vendas', {
        method: 'POST',
        body: JSON.stringify(vendaData),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar venda');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Método para atualizar uma venda
  async updateVenda(id, vendaData) {
    try {
      const response = await this.authenticatedRequest(`/vendas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(vendaData),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar venda');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async cancelarVenda(id, motivo = '') {
    const qp = motivo ? `?motivo=${encodeURIComponent(motivo)}` : '';
    const response = await this.authenticatedRequest(`/vendas/${id}/cancelar${qp}`, {
      method: 'PATCH',
    });
    if (!response.ok) throw new Error('Erro ao cancelar venda');
    return true; // PATCH pode não vir com body
  }

  // Método para buscar clientes
  async getClientes() {
    try {
      const response = await this.authenticatedRequest('/clientes');
      if (!response.ok) {
        throw new Error('Erro ao buscar clientes');
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Método para fazer requisições autenticadas
  async authenticatedRequest(url, options = {}) {
    const defaultOptions = {
      credentials: 'include', // Sempre incluir cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Se não há Content-Type nos headers, remover do defaultOptions
    if (options.headers && !options.headers['Content-Type']) {
      delete defaultOptions.headers['Content-Type'];
    }

    const response = await fetch(`${this.baseURL}${url}`, {
      ...defaultOptions,
      ...options,
    });

    if (response.status === 401) {
      // Token expirado ou inválido - redirecionar para login
      this.handleUnauthorized();
      throw new Error('Token expirado ou inválido');
    }

    return response;
  }

  // Método para verificar se o usuário está autenticado
  // Usamos o endpoint /produtos que requer autenticação
  async isAuthenticated() {
    try {
      const response = await fetch(`${this.baseURL}/produtos`, {
        method: 'GET',
        credentials: 'include',
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

    // ======================
  // FINANCEIRO - TITULOS
  // ======================
  async getTitulosFinanceiros() {
    const response = await this.authenticatedRequest('/financeiro/titulos');
    if (!response.ok) throw new Error('Erro ao buscar títulos financeiros');
    return await response.json();
  }

  async getTituloFinanceiroById(id) {
    const response = await this.authenticatedRequest(`/financeiro/titulos/${id}`);
    if (!response.ok) throw new Error('Erro ao buscar título financeiro');
    return await response.json();
  }

  async createTituloFinanceiro(payload) {
    const response = await this.authenticatedRequest('/financeiro/titulos', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Erro ao criar título financeiro');
    return await response.json();
  }

  // ======================
  // FINANCEIRO - PARCELAS
  // ======================
  async baixarParcela(id, payload = {}) {
    const response = await this.authenticatedRequest(`/financeiro/parcelas/${id}/baixar`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Erro ao baixar parcela');
    return await response.json();
  }

  // ======================
  // FINANCEIRO - CAIXA
  // ======================
  async getSaldoAtual() {
    const response = await this.authenticatedRequest('/financeiro/caixa/saldo-atual');
    if (!response.ok) throw new Error('Erro ao buscar saldo atual');
    return await response.json(); // { saldoAtual }
  }

  async getMovimentacoesCaixa({ inicio, fim, tipo } = {}) {
    const params = new URLSearchParams();
    params.set('inicio', inicio);
    params.set('fim', fim);
    if (tipo) params.set('tipo', tipo);

    const response = await this.authenticatedRequest(
      `/financeiro/caixa/movimentacoes?${params.toString()}`
    );
    if (!response.ok) throw new Error('Erro ao buscar movimentações do caixa');
    return await response.json();
  }

  async getResumoCaixa({ inicio, fim }) {
    const params = new URLSearchParams();
    params.set('inicio', inicio);
    params.set('fim', fim);

    const response = await this.authenticatedRequest(
      `/financeiro/caixa/resumo?${params.toString()}`
    );
    if (!response.ok) throw new Error('Erro ao buscar resumo do caixa');
    return await response.json();
  }

  // ======================
  // CADASTROS FINANCEIROS
  // ======================
  async getCategoriasFinanceiras() {
    const response = await this.authenticatedRequest('/categoriasFinanceiras');
    if (!response.ok) throw new Error('Erro ao buscar categorias financeiras');
    return await response.json();
  }

  async getFormasPagamento() {
    const response = await this.authenticatedRequest('/formaPagamento');
    if (!response.ok) throw new Error('Erro ao buscar formas de pagamento');
    return await response.json();
  }

  // Método para lidar com erro 401
  handleUnauthorized() {
    // Limpar qualquer estado local se necessário
    // O redirecionamento será feito pelos componentes que capturam o erro
  }


}

const apiService = new ApiService();
export default apiService; 