package com.estoqueplan.estoque_plan.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopProdutoVendidoDTO {

    private Long produtoId;
    private String descricao;
    private Long quantidadeVendida;
    private BigDecimal valorTotalVendido;
}