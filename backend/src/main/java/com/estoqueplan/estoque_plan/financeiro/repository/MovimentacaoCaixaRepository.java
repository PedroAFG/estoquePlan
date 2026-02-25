package com.estoqueplan.estoque_plan.financeiro.repository;

import com.estoqueplan.estoque_plan.financeiro.model.MovimentacaoCaixa;
import com.estoqueplan.estoque_plan.financeiro.model.enums.TipoMovimentacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MovimentacaoCaixaRepository extends JpaRepository<MovimentacaoCaixa, Long> {

    public Optional<MovimentacaoCaixa> findTopByOrderByDataHoraDesc();

    List<MovimentacaoCaixa> findByDataHoraBetweenOrderByDataHoraDesc(LocalDateTime inicio, LocalDateTime fim);

    List<MovimentacaoCaixa> findByDataHoraBetweenAndTipoOrderByDataHoraDesc(
            LocalDateTime inicio, LocalDateTime fim, TipoMovimentacao tipo
    );

}
