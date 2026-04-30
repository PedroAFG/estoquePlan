package com.estoqueplan.estoque_plan.financeiro.repository;

import com.estoqueplan.estoque_plan.financeiro.model.FormaPagamento;
import com.estoqueplan.estoque_plan.financeiro.model.enums.TipoPagamento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FormaPagamentoRepository extends JpaRepository<FormaPagamento, Long> {

    List<FormaPagamento> findByAtivoTrue();
    Optional<FormaPagamento> findByIdAndAtivoTrue(Long id);
    Optional<FormaPagamento> findByTipoAndAtivoTrue(TipoPagamento tipo);

}
