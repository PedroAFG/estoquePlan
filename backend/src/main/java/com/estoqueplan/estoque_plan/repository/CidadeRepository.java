package com.estoqueplan.estoque_plan.repository;

import com.estoqueplan.estoque_plan.model.Cidade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CidadeRepository extends JpaRepository<Cidade, Long> {
    Optional<Cidade> findByNomeAndEstadoId(String nome, Long estadoId);
}