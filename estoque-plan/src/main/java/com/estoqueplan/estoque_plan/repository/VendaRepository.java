package com.estoqueplan.estoque_plan.repository;

import com.estoqueplan.estoque_plan.model.Venda;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VendaRepository extends JpaRepository<Venda, Long> {
    
}