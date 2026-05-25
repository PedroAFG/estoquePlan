package com.estoqueplan.estoque_plan.repository;

import com.estoqueplan.estoque_plan.model.Pais;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaisRepository extends JpaRepository<Pais, Long> {
    Optional<Pais> findBySigla(String sigla);
}