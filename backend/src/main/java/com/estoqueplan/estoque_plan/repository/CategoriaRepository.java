package com.estoqueplan.estoque_plan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.estoqueplan.estoque_plan.model.Categoria;

import java.util.List;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    List<Categoria> findByAtivoTrue();
    List<Categoria> findByAtivoFalse();
}
