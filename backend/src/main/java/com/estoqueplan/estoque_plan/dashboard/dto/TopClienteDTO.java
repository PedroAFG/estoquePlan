package com.estoqueplan.estoque_plan.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopClienteDTO {

    private Long clienteId;
    private String nomeCliente;
    private BigDecimal valorTotalComprado;
    private Long quantidadeCompras;
}