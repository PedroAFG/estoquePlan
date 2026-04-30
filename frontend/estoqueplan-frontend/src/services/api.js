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
      await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.LOGOUT}`, {
        method: "POST",
        credentials: "include",
      });

      return true;
    } catch (error) {
      console.error("Erro no logout:", error);
      return true;
    }
  }

  async solicitarRedefinicaoSenha(email) {
    const response = await fetch(`${this.baseURL}/auth/esqueci-senha`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error("Erro ao solicitar redefinição de senha");
    }

    return await response.text();
  }

  async redefinirSenha(token, novaSenha) {
    const response = await fetch(`${this.baseURL}/auth/redefinir-senha`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        novaSenha,
      }),
    });

    if (!response.ok) {
      const mensagem = await response.text();
      throw new Error(mensagem || "Erro ao redefinir senha");
    }

    return await response.text();
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
      const response = await this.authenticatedRequest('/usuarios/me', {
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

  // Ativar produto
  async ativarProduto(id) {
    try {
      const response = await this.authenticatedRequest(
        `${API_CONFIG.ENDPOINTS.PRODUTO}/${id}/ativar`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao reativar produto");
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  async exportarProdutosXlsx({ incluirInativos = false } = {}) {
    const query = incluirInativos ? "?incluirInativos=true" : "";

    const response = await this.authenticatedRequest(
      `/produtos/exportar/xlsx${query}`,
      {
        method: "GET",
      }
    );

    return await response.blob();
  }

  async exportarProdutosPdf({ incluirInativos = false } = {}) {
    const query = incluirInativos ? "?incluirInativos=true" : "";

    const response = await this.authenticatedRequest(
      `/produtos/exportar/pdf${query}`,
      {
        method: "GET",
      }
    );

    return await response.blob();
  }

  async importarProdutosXlsx(file) {
    const formData = new FormData();
    formData.append("arquivo", file);

    const response = await this.authenticatedRequest("/produtos/importar/xlsx", {
      method: "POST",
      headers: {},
      body: formData,
    });

    return await response.text();
  }





  // Método para buscar todas as categorias
  async getCategorias({ incluirInativos = false } = {}) {
    try {
      const query = incluirInativos ? "?incluirInativos=true" : "";
      const response = await this.authenticatedRequest(`/categorias${query}`);

      if (!response.ok) {
        throw new Error("Erro ao buscar categorias");
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

  async exportarVendasXlsx() {
    const response = await this.authenticatedRequest("/vendas/exportar/xlsx", {
      method: "GET",
    });

    return await response.blob();
  }

  async exportarVendasPdf() {
    const response = await this.authenticatedRequest("/vendas/exportar/pdf", {
      method: "GET",
    });

    return await response.blob();
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
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (options.headers && !options.headers['Content-Type']) {
      delete defaultOptions.headers['Content-Type'];
    }

    const response = await fetch(`${this.baseURL}${url}`, {
      ...defaultOptions,
      ...options,
    });

    if (response.status === 401) {
      this.handleUnauthorized();
      throw new Error('Token expirado ou inválido');
    }

    if (!response.ok) {
      let mensagem = "Erro na requisição";

      try {
        const errorData = await response.json();
        mensagem = errorData?.message || mensagem;
      } catch (e) {
        // caso não venha JSON
      }

      throw new Error(mensagem);
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

  async cancelarTituloFinanceiro(id) {
    const response = await this.authenticatedRequest(
      `/financeiro/titulos/${id}/cancelar`,
      {
        method: "PATCH",
      }
    );

    if (!response.ok) throw new Error("Erro ao cancelar título financeiro");

    return await response.json();
  }

  async exportarTitulosXlsx() {
    const response = await this.authenticatedRequest(
      `/financeiro/titulos/exportar/xlsx`,
      { method: "GET" }
    );

    return await response.blob();
  }

  async exportarTitulosPdf() {
    const response = await this.authenticatedRequest(
      `/financeiro/titulos/exportar/pdf`,
      { method: "GET" }
    );

    return await response.blob();
  }

  async importarTitulosXlsx(file) {
    const formData = new FormData();
    formData.append("arquivo", file);

    const response = await this.authenticatedRequest(
      `/financeiro/titulos/importar/xlsx`,
      {
        method: "POST",
        headers: {},
        body: formData,
      }
    );

    return await response.text();
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
    params.set("inicio", inicio);
    params.set("fim", fim);
    if (tipo) params.set("tipo", tipo);

    const response = await this.authenticatedRequest(
      `/financeiro/caixa/movimentacoes?${params.toString()}`
    );

    if (!response.ok) throw new Error("Erro ao buscar movimentações do caixa");
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
  async getCategoriasFinanceiras({ incluirInativos = false } = {}) {
    const query = incluirInativos ? "?incluirInativos=true" : "";
    const response = await this.authenticatedRequest(`/categoriasFinanceiras${query}`);
    if (!response.ok) throw new Error('Erro ao buscar categorias financeiras');
    return await response.json();
  }

  async getFormasPagamento({ incluirInativos = false } = {}) {
    const query = incluirInativos ? "?incluirInativos=true" : "";
    const response = await this.authenticatedRequest(`/formaPagamento${query}`);
    if (!response.ok) throw new Error("Erro ao buscar formas de pagamento");
    return await response.json();
  }

  /*---------CADASTRO CLIENTES-----------*/
  async getClienteById(id) {
    const response = await this.authenticatedRequest(`/clientes/${id}`);
    if (!response.ok) throw new Error("Erro ao buscar cliente");
    return await response.json();
  }

  async createCliente(payload) {
    const response = await this.authenticatedRequest("/clientes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Erro ao criar cliente");
    return await response.json();
  }

  async updateCliente(id, payload) {
    const response = await this.authenticatedRequest(`/clientes/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Erro ao atualizar cliente");
    return await response.json();
  }

  async deleteCliente(id) {
    await this.authenticatedRequest(`/clientes/${id}`, {
      method: "DELETE",
    });
    return true;
  }

  async inativarCliente(id) {
    const response = await this.authenticatedRequest(`/clientes/${id}/inativar`, {
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Erro ao inativar cliente");
    return true;
  }

  async ativarCliente(id) {
    const response = await this.authenticatedRequest(`/clientes/${id}/ativar`, {
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Erro ao ativar cliente");
    return true;
  }

  /*---------CADASTRO CATEGORIAS-----------*/
  async createCategoria(payload) {
    const response = await this.authenticatedRequest("/categorias", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Erro ao criar categoria");
    return await response.json();
  }

  async updateCategoria(id, payload) {
    const response = await this.authenticatedRequest(`/categorias/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Erro ao atualizar categoria");
    return await response.json();
  }

  async inativarCategoria(id) {
    const response = await this.authenticatedRequest(`/categorias/${id}/inativar`, {
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Erro ao inativar categoria");
    return true;
  }

  async ativarCategoria(id) {
    const response = await this.authenticatedRequest(`/categorias/${id}/ativar`, {
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Erro ao ativar categoria");
    return true;
  }

  /*---------CADASTRO CATEGORIAS FINANCEIRAS-----------*/
  async createCategoriaFinanceira(payload) {
    const response = await this.authenticatedRequest("/categoriasFinanceiras", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Erro ao criar categoria financeira");
    return await response.json();
  }

  async updateCategoriaFinanceira(id, payload) {
    const response = await this.authenticatedRequest(`/categoriasFinanceiras/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Erro ao atualizar categoria financeira");
    return await response.json();
  }

  async inativarCategoriaFinanceira(id) {
    const response = await this.authenticatedRequest(`/categoriasFinanceiras/${id}/inativar`, {
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Erro ao inativar categoria financeira");
    return true;
  }

  async ativarCategoriaFinanceira(id) {
    const response = await this.authenticatedRequest(`/categoriasFinanceiras/${id}/ativar`, {
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Erro ao ativar categoria financeira");
    return true;
  }

  /*---------CADASTRO FORMAS DE PAGAMENTO-----------*/
  async createFormaPagamento(payload) {
    const response = await this.authenticatedRequest("/formaPagamento", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Erro ao criar forma de pagamento");
    return await response.json();
  }

  async updateFormaPagamento(id, payload) {
    const response = await this.authenticatedRequest(`/formaPagamento/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Erro ao atualizar forma de pagamento");
    return await response.json();
  }

  async inativarFormaPagamento(id) {
    const response = await this.authenticatedRequest(`/formaPagamento/${id}/inativar`, {
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Erro ao inativar forma de pagamento");
    return true;
  }

  async ativarFormaPagamento(id) {
    const response = await this.authenticatedRequest(`/formaPagamento/${id}/ativar`, {
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Erro ao ativar forma de pagamento");
    return true;
  }

  /*---------CADASTRO USUÁRIOS-----------*/
  async getUsuarios() {
    try {
      const response = await this.authenticatedRequest('/usuarios');

      if (!response.ok) {
        throw new Error('Erro ao buscar usuários');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async getUsuarioById(id) {
    try {
      const response = await this.authenticatedRequest(`/usuarios/${id}`);

      if (!response.ok) {
        throw new Error('Erro ao buscar usuário');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async createUsuario(payload) {
    try {
      const response = await this.authenticatedRequest('/usuarios', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar usuário');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async updateUsuario(id, payload) {
    try {
      const response = await this.authenticatedRequest(`/usuarios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar usuário');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async inativarUsuario(id) {
    try {
      const response = await this.authenticatedRequest(`/usuarios/${id}/inativar`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Erro ao inativar usuário');
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  async ativarUsuario(id) {
    try {
      const response = await this.authenticatedRequest(`/usuarios/${id}/ativar`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Erro ao ativar usuário');
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  // ======================
  // DASHBOARD
  // ======================
  async getDashboardEstoque({ inicio, fim } = {}) {
    const params = new URLSearchParams();
    if (inicio) params.set("inicio", inicio);
    if (fim) params.set("fim", fim);

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await this.authenticatedRequest(`/dashboard/estoque${query}`);

    if (!response.ok) throw new Error("Erro ao buscar indicadores de estoque");
    return await response.json();
  }

  async getDashboardComercial({ inicio, fim } = {}) {
    const params = new URLSearchParams();
    if (inicio) params.set("inicio", inicio);
    if (fim) params.set("fim", fim);

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await this.authenticatedRequest(`/dashboard/comercial${query}`);

    if (!response.ok) throw new Error("Erro ao buscar indicadores comerciais");
    return await response.json();
  }

  async getDashboardFinanceiro({ inicio, fim } = {}) {
    const params = new URLSearchParams();
    if (inicio) params.set("inicio", inicio);
    if (fim) params.set("fim", fim);

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await this.authenticatedRequest(`/dashboard/financeiro${query}`);

    if (!response.ok) throw new Error("Erro ao buscar indicadores financeiros");
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