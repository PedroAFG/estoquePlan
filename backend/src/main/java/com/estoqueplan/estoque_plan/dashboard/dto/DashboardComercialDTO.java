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
public class DashboardComercialDTO {

    private BigDecimal totalVendidoPeriodo;
    private Long quantidadeVendasPeriodo;
    private BigDecimal ticketMedio;

    private List<TopProdutoVendidoDTO> topProdutosVendidos = new ArrayList<>();
    private List<TopClienteDTO> topClientes = new ArrayList<>();
}