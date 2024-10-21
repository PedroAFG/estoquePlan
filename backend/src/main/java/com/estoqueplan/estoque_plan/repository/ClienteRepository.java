package com.estoqueplan.estoque_plan.repository;

import com.estoqueplan.estoque_plan.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    
}
