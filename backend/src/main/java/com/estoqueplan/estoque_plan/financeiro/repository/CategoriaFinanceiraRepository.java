package com.estoqueplan.estoque_plan.financeiro.repository;

import com.estoqueplan.estoque_plan.financeiro.model.CategoriaFinanceira;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaFinanceiraRepository extends JpaRepository<CategoriaFinanceira, Long> {
}
