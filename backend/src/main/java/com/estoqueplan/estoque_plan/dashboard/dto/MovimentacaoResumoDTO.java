package com.estoqueplan.estoque_plan.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MovimentacaoResumoDTO {

    private Long id;
    private String tipo;
    private String descricao;
    private LocalDateTime dataHora;
    private BigDecimal valor;
}