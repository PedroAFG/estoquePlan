package com.estoqueplan.estoque_plan.financeiro.controller;

import com.estoqueplan.estoque_plan.financeiro.model.MovimentacaoCaixa;
import com.estoqueplan.estoque_plan.financeiro.model.enums.TipoMovimentacao;
import com.estoqueplan.estoque_plan.financeiro.service.CaixaService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/financeiro/caixa")
public class MovimentacaoCaixaController {

    private final CaixaService caixaService;

    public MovimentacaoCaixaController(CaixaService caixaService) {
        this.caixaService = caixaService;
    }

    // GET /financeiro/caixa/movimentacoes?inicio=2026-03-17&fim=2026-03-18&tipo=ENTRADA
    @GetMapping("/movimentacoes")
    public ResponseEntity<List<MovimentacaoCaixa>> listarMovimentacoes(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
            @RequestParam(required = false) TipoMovimentacao tipo
    ) {
        LocalDateTime dataHoraInicio = inicio.atStartOfDay();
        LocalDateTime dataHoraFim = fim.atTime(LocalTime.MAX);

        return ResponseEntity.ok(caixaService.listarMovimentacoes(dataHoraInicio, dataHoraFim, tipo));
    }

    @GetMapping("/saldo-atual")
    public ResponseEntity<SaldoDTO> saldoAtual() {
        BigDecimal saldo = caixaService.saldoAtual();
        return ResponseEntity.ok(new SaldoDTO(saldo));
    }

    // GET /financeiro/caixa/resumo?inicio=2026-03-17&fim=2026-03-18
    @GetMapping("/resumo")
    public ResponseEntity<CaixaService.ResumoCaixaDTO> resumo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        LocalDateTime dataHoraInicio = inicio.atStartOfDay();
        LocalDateTime dataHoraFim = fim.atTime(LocalTime.MAX);

        return ResponseEntity.ok(caixaService.resumoPeriodo(dataHoraInicio, dataHoraFim));
    }

    public static class SaldoDTO {
        private BigDecimal saldoAtual;

        public SaldoDTO(BigDecimal saldoAtual) {
            this.saldoAtual = saldoAtual;
        }

        public BigDecimal getSaldoAtual() {
            return saldoAtual;
        }

        public void setSaldoAtual(BigDecimal saldoAtual) {
            this.saldoAtual = saldoAtual;
        }
    }
}