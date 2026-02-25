package com.estoqueplan.estoque_plan.financeiro.repository;

import com.estoqueplan.estoque_plan.financeiro.model.ParcelaFinanceira;
import com.estoqueplan.estoque_plan.financeiro.model.enums.StatusTitulo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ParcelaFinanceiraRepository extends JpaRepository<ParcelaFinanceira, Long> {

    List<ParcelaFinanceira> findByStatusOrderByVencimentoAsc(StatusTitulo status);

    Optional<ParcelaFinanceira> findTopByStatusOrderByVencimentoAsc(StatusTitulo status);

}
