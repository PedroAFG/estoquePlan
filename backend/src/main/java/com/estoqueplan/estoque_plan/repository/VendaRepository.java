package com.estoqueplan.estoque_plan.repository;

import com.estoqueplan.estoque_plan.model.Venda;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.estoqueplan.estoque_plan.model.enums.StatusVenda;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VendaRepository extends JpaRepository<Venda, Long> {

    List<Venda> findByStatus(StatusVenda status);

    List<Venda> findByStatusAndValorTotal(StatusVenda status, BigDecimal valorTotal);

    List<Venda> findByStatusAndDataDaVendaBetween(StatusVenda status, LocalDateTime inicio, LocalDateTime fim);

    boolean existsByClienteId(Long clienteId);

}