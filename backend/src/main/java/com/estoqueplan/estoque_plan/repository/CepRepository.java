package com.estoqueplan.estoque_plan.repository;

import com.estoqueplan.estoque_plan.model.Cep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CepRepository extends JpaRepository<Cep, Long> {

    Optional<Cep> findByCodigo(String codigo);
}