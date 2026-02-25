package com.estoqueplan.estoque_plan.financeiro.repository;

import com.estoqueplan.estoque_plan.financeiro.model.TituloFinanceiro;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TituloFinanceiroRepository extends JpaRepository<TituloFinanceiro, Long> {
}
