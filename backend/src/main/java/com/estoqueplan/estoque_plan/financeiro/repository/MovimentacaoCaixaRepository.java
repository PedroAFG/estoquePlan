package com.estoqueplan.estoque_plan.financeiro.repository;

import com.estoqueplan.estoque_plan.financeiro.model.MovimentacaoCaixa;
import com.estoqueplan.estoque_plan.financeiro.model.enums.TipoMovimentacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MovimentacaoCaixaRepository extends JpaRepository<MovimentacaoCaixa, Long> {

    public Optional<MovimentacaoCaixa> findTopByOrderByDataHoraDesc();

    List<MovimentacaoCaixa> findByDataHoraBetweenOrderByDataHoraDesc(LocalDateTime inicio, LocalDateTime fim);

    List<MovimentacaoCaixa> findByDataHoraBetweenAndTipoOrderByDataHoraDesc(
            LocalDateTime inicio, LocalDateTime fim, TipoMovimentacao tipo
    );

    List<MovimentacaoCaixa> findTop5ByOrderByDataHoraDesc();

    @Query("""
           select coalesce(sum(m.valor), 0)
           from MovimentacaoCaixa m
           where m.tipo = com.estoqueplan.estoque_plan.financeiro.model.enums.TipoMovimentacao.ENTRADA
             and m.dataHora between :inicio and :fim
           """)
    BigDecimal sumEntradasPeriodo(LocalDateTime inicio, LocalDateTime fim);

    @Query("""
           select coalesce(sum(m.valor), 0)
           from MovimentacaoCaixa m
           where m.tipo = com.estoqueplan.estoque_plan.financeiro.model.enums.TipoMovimentacao.SAIDA
             and m.dataHora between :inicio and :fim
           """)
    BigDecimal sumSaidasPeriodo(LocalDateTime inicio, LocalDateTime fim);

}
