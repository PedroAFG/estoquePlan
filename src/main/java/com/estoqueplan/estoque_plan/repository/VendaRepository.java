package com.estoqueplan.estoque_plan.repository;

import com.estoqueplan.estoque_plan.model.Venda;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface VendaRepository extends JpaRepository<Venda, Long> {
    
    List<Venda> findByValorTotal(BigDecimal valorTotal);

    List<Venda> findByDataDaVenda(LocalDateTime dataDaVenda);

}