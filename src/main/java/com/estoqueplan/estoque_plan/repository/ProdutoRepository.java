package com.estoqueplan.estoque_plan.repository;

import com.estoqueplan.estoque_plan.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    
}

