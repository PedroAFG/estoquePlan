package com.estoqueplan.estoque_plan.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProdutoBaixoEstoqueDTO {

    private Long id;
    private String descricao;
    private Integer quantidadeDisponivel;
    private Integer estoqueMinimo;
}