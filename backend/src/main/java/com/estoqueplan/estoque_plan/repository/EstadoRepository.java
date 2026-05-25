package com.estoqueplan.estoque_plan.repository;

import com.estoqueplan.estoque_plan.model.Estado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EstadoRepository extends JpaRepository<Estado, Long> {
    Optional<Estado> findByUf(String uf);
}