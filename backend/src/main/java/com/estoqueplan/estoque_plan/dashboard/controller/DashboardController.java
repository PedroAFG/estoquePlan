package com.estoqueplan.estoque_plan.dashboard.controller;

import com.estoqueplan.estoque_plan.dashboard.dto.DashboardComercialDTO;
import com.estoqueplan.estoque_plan.dashboard.dto.DashboardEstoqueDTO;
import com.estoqueplan.estoque_plan.dashboard.dto.DashboardFinanceiroDTO;
import com.estoqueplan.estoque_plan.dashboard.service.DashboardService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/estoque")
    public ResponseEntity<DashboardEstoqueDTO> obterIndicadoresEstoque(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        return ResponseEntity.ok(dashboardService.obterIndicadoresEstoque(inicio, fim));
    }

    @GetMapping("/comercial")
    public ResponseEntity<DashboardComercialDTO> obterIndicadoresComerciais(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        return ResponseEntity.ok(dashboardService.obterIndicadoresComerciais(inicio, fim));
    }

    @GetMapping("/financeiro")
    public ResponseEntity<DashboardFinanceiroDTO> obterIndicadoresFinanceiros(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        return ResponseEntity.ok(dashboardService.obterIndicadoresFinanceiros(inicio, fim));
    }
}