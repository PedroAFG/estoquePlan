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
public class DashboardFinanceiroDTO {

    private BigDecimal totalReceberAberto;
    private BigDecimal totalPagarAberto;
    private Long parcelasVencidas;

    private BigDecimal recebidoPeriodo;
    private BigDecimal pagoPeriodo;

    private BigDecimal saldoAtualCaixa;
    private BigDecimal totalEntradasPeriodo;
    private BigDecimal totalSaidasPeriodo;

    private List<MovimentacaoResumoDTO> ultimasMovimentacoes = new ArrayList<>();
}