package com.estoqueplan.estoque_plan.financeiro.service;

import com.estoqueplan.estoque_plan.financeiro.model.MovimentacaoCaixa;
import com.estoqueplan.estoque_plan.financeiro.model.enums.TipoMovimentacao;
import com.estoqueplan.estoque_plan.financeiro.repository.MovimentacaoCaixaRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CaixaService {

    private final MovimentacaoCaixaRepository repo;

    public CaixaService(MovimentacaoCaixaRepository repo) {
        this.repo = repo;
    }

    public List<MovimentacaoCaixa> listarMovimentacoes(LocalDateTime inicio, LocalDateTime fim, TipoMovimentacao tipo) {
        if (tipo == null) {
            return repo.findByDataHoraBetweenOrderByDataHoraDesc(inicio, fim);
        }
        return repo.findByDataHoraBetweenAndTipoOrderByDataHoraDesc(inicio, fim, tipo);
    }

    public BigDecimal saldoAtual() {
        return repo.findTopByOrderByDataHoraDesc()
                .map(MovimentacaoCaixa::getSaldoApos)
                .orElse(BigDecimal.ZERO);
    }

    public ResumoCaixaDTO resumoPeriodo(LocalDateTime inicio, LocalDateTime fim) {
        List<MovimentacaoCaixa> movs = repo.findByDataHoraBetweenOrderByDataHoraDesc(inicio, fim);

        BigDecimal entradas = BigDecimal.ZERO;
        BigDecimal saidas = BigDecimal.ZERO;

        for (MovimentacaoCaixa m : movs) {
            if (m.getTipo() == TipoMovimentacao.ENTRADA) {
                entradas = entradas.add(m.getValor());
            } else {
                saidas = saidas.add(m.getValor());
            }
        }

        ResumoCaixaDTO dto = new ResumoCaixaDTO();
        dto.setTotalEntradas(entradas);
        dto.setTotalSaidas(saidas);
        dto.setResultado(entradas.subtract(saidas));
        return dto;
    }

    public static class ResumoCaixaDTO {
        private BigDecimal totalEntradas;
        private BigDecimal totalSaidas;
        private BigDecimal resultado;

        public BigDecimal getTotalEntradas() { return totalEntradas; }
        public void setTotalEntradas(BigDecimal totalEntradas) { this.totalEntradas = totalEntradas; }

        public BigDecimal getTotalSaidas() { return totalSaidas; }
        public void setTotalSaidas(BigDecimal totalSaidas) { this.totalSaidas = totalSaidas; }

        public BigDecimal getResultado() { return resultado; }
        public void setResultado(BigDecimal resultado) { this.resultado = resultado; }
    }
}