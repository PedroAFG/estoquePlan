package com.estoqueplan.estoque_plan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.estoqueplan.estoque_plan.model.Categoria;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
}
