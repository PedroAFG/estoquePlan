package com.estoqueplan.estoque_plan.financeiro.service;

import com.estoqueplan.estoque_plan.financeiro.model.MovimentacaoCaixa;
import com.estoqueplan.estoque_plan.financeiro.model.enums.TipoMovimentacao;
import com.estoqueplan.estoque_plan.financeiro.repository.MovimentacaoCaixaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class MovimentacaoCaixaService {

    @Autowired
    private MovimentacaoCaixaRepository movimentacaoCaixaRepository;

    public MovimentacaoCaixa criarMovimentacao(TipoMovimentacao tipo, BigDecimal valor, String descricao) {
        BigDecimal saldoAnterior = movimentacaoCaixaRepository
                .findTopByOrderByDataHoraDesc()
                .map(MovimentacaoCaixa::getSaldoApos)
                .orElse(BigDecimal.ZERO);

        BigDecimal saldoNovo = calcularSaldoNovo(saldoAnterior, tipo, valor);

        MovimentacaoCaixa mov = new MovimentacaoCaixa();
        mov.setTipo(tipo);
        mov.setValor(valor);
        mov.setDescricao(descricao);
        mov.setSaldoApos(saldoNovo);
        mov.setDataHora(LocalDateTime.now()); // ou deixa o @PrePersist fazer isso

        return movimentacaoCaixaRepository.save(mov);
    }

    private BigDecimal calcularSaldoNovo(BigDecimal saldoAnterior, TipoMovimentacao tipo, BigDecimal valor) {
        if (valor == null) {
            throw new IllegalArgumentException("Valor da movimentação não pode ser nulo.");
        }

        return (tipo == TipoMovimentacao.ENTRADA)
                ? saldoAnterior.add(valor)
                : saldoAnterior.subtract(valor);
    }
}

