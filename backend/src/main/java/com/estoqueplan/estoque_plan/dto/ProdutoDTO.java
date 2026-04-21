package com.estoqueplan.estoque_plan.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProdutoDTO {
    private String descricao;
    private Integer quantidadeDisponivel;
    private String unidade;
    private Long categoriaId;
    private BigDecimal custo;
    private BigDecimal precoVarejo;
    private String ncm;
    private String idSebrae;
    private Integer estoqueMinimo;
    // getters e setters (ou @Data do Lombok)
}

