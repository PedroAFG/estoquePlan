package com.estoqueplan.estoque_plan.financeiro.controller;

import com.estoqueplan.estoque_plan.financeiro.model.MovimentacaoCaixa;
import com.estoqueplan.estoque_plan.financeiro.model.enums.TipoMovimentacao;
import com.estoqueplan.estoque_plan.financeiro.service.CaixaService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/financeiro/caixa")
public class MovimentacaoCaixaController {

    private final CaixaService caixaService;

    public MovimentacaoCaixaController(CaixaService caixaService) {
        this.caixaService = caixaService;
    }

    // GET /financeiro/caixa/movimentacoes?inicio=2026-02-01T00:00:00&fim=2026-02-28T23:59:59&tipo=ENTRADA
    @GetMapping("/movimentacoes")
    public ResponseEntity<List<MovimentacaoCaixa>> listarMovimentacoes(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim,
            @RequestParam(required = false) TipoMovimentacao tipo
    ) {
        return ResponseEntity.ok(caixaService.listarMovimentacoes(inicio, fim, tipo));
    }

    // GET /financeiro/caixa/saldo-atual
    @GetMapping("/saldo-atual")
    public ResponseEntity<SaldoDTO> saldoAtual() {
        BigDecimal saldo = caixaService.saldoAtual();
        return ResponseEntity.ok(new SaldoDTO(saldo));
    }

    // GET /financeiro/caixa/resumo?inicio=...&fim=...
    @GetMapping("/resumo")
    public ResponseEntity<CaixaService.ResumoCaixaDTO> resumo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim
    ) {
        return ResponseEntity.ok(caixaService.resumoPeriodo(inicio, fim));
    }

    public static class SaldoDTO {
        private BigDecimal saldoAtual;

        public SaldoDTO(BigDecimal saldoAtual) {
            this.saldoAtual = saldoAtual;
        }

        public BigDecimal getSaldoAtual() { return saldoAtual; }
        public void setSaldoAtual(BigDecimal saldoAtual) { this.saldoAtual = saldoAtual; }
    }
}