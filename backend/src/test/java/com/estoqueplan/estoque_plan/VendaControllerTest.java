package com.estoqueplan.estoque_plan;

import com.estoqueplan.estoque_plan.dto.ItemVendaDTO;
import com.estoqueplan.estoque_plan.dto.VendaDTO;
import com.estoqueplan.estoque_plan.financeiro.service.TituloFinanceiroService;
import com.estoqueplan.estoque_plan.model.Categoria;
import com.estoqueplan.estoque_plan.model.PessoaFisica;
import com.estoqueplan.estoque_plan.model.Produto;
import com.estoqueplan.estoque_plan.repository.CategoriaRepository;
import com.estoqueplan.estoque_plan.repository.ClienteRepository;
import com.estoqueplan.estoque_plan.repository.ProdutoRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class VendaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @MockBean
    private TituloFinanceiroService tituloFinanceiroService;

    @Test
    void deveRegistrarVendaEReduzirEstoqueDoProduto() throws Exception {
        Categoria categoria = new Categoria();
        categoria.setNome("Madeiras");
        categoria.setAtivo(true);
        categoria = categoriaRepository.save(categoria);

        Produto produto = new Produto();
        produto.setDescricao("Tábua de Pinus");
        produto.setUnidade("UN");
        produto.setCategoria(categoria);
        produto.setCusto(new BigDecimal("20.00"));
        produto.setPrecoVarejo(new BigDecimal("35.00"));
        produto.setQuantidadeDisponivel(100);
        produto.setEstoqueMinimo(10);
        produto.setAtivo(true);
        produto = produtoRepository.save(produto);

        PessoaFisica cliente = new PessoaFisica();
        cliente.setNome("Cliente Teste");
        cliente.setEmail("cliente@teste.com");
        cliente.setTelefone("47999999999");
        cliente.setCpf("12345678900");
        cliente.setAtivo(true);
        cliente = clienteRepository.save(cliente);

        ItemVendaDTO item = new ItemVendaDTO();
        item.setProdutoId(produto.getId());
        item.setQuantidade(10);
        item.setUnidade("UN");
        item.setPrecoUnitario(new BigDecimal("35.00"));

        VendaDTO vendaDTO = new VendaDTO();
        vendaDTO.setClienteId(cliente.getId());
        vendaDTO.setDataDaVenda(LocalDateTime.now());
        vendaDTO.setDesconto(BigDecimal.ZERO);
        vendaDTO.setAdicional(BigDecimal.ZERO);
        vendaDTO.setFrete(BigDecimal.ZERO);
        vendaDTO.setCategoriaFinanceiraId(1L);
        vendaDTO.setFormaPagamentoId(1L);
        vendaDTO.setNumeroParcelas(1);
        vendaDTO.setIntervaloDias(30);
        vendaDTO.setDescricaoTitulo("Título gerado pelo teste automatizado");
        vendaDTO.setItens(List.of(item));

        mockMvc.perform(post("/vendas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(vendaDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valorTotal").value(350.00))
                .andExpect(jsonPath("$.itens[0].quantidade").value(10))
                .andExpect(jsonPath("$.itens[0].descricaoProduto").value("Tábua de Pinus"));

        Produto produtoAtualizado = produtoRepository.findById(produto.getId()).orElseThrow();

        assertEquals(90, produtoAtualizado.getQuantidadeDisponivel());
    }
}