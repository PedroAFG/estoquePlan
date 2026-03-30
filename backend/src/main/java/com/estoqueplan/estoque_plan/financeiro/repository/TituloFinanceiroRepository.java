package com.estoqueplan.estoque_plan.financeiro.repository;

import com.estoqueplan.estoque_plan.financeiro.model.TituloFinanceiro;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TituloFinanceiroRepository extends JpaRepository<TituloFinanceiro, Long> {

    Optional<TituloFinanceiro> findByVendaId(Long vendaId);
}
