package com.estoqueplan.estoque_plan.financeiro.repository;

import com.estoqueplan.estoque_plan.financeiro.model.FormaPagamento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormaPagamentoRepository extends JpaRepository<FormaPagamento, Long> {
}
