package com.estoqueplan.estoque_plan.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ItemVendaDTO {
    private Long produtoId;
    private String descricaoProduto;
    private Integer quantidade;
    private String unidade;
    private String bitola;
    private String comprimento;
    private BigDecimal precoUnitario;
    private BigDecimal total;

}
