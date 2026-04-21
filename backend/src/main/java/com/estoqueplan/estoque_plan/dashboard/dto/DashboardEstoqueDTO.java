package com.estoqueplan.estoque_plan.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardEstoqueDTO {

    private Long totalProdutosCadastrados;
    private Long quantidadeTotalEmEstoque;
    private Long produtosComBaixoEstoque;
    private Long produtosSemEstoque;
    private BigDecimal valorTotalEstoquePorCusto;

    private List<ProdutoBaixoEstoqueDTO> produtosBaixoEstoque = new ArrayList<>();
    private List<ProdutoBaixoEstoqueDTO> produtosZerados = new ArrayList<>();
}