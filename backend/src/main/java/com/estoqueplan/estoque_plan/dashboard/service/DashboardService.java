package com.estoqueplan.estoque_plan.dashboard.service;

import com.estoqueplan.estoque_plan.dashboard.dto.DashboardComercialDTO;
import com.estoqueplan.estoque_plan.dashboard.dto.DashboardEstoqueDTO;

import java.time.LocalDate;

public interface DashboardService {

    DashboardEstoqueDTO obterIndicadoresEstoque(LocalDate inicio, LocalDate fim);

    DashboardComercialDTO obterIndicadoresComerciais(LocalDate inicio, LocalDate fim);
}