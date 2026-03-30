package com.estoqueplan.estoque_plan.repository;

import com.estoqueplan.estoque_plan.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {


    Optional<Cliente> findByIdAndAtivoTrue(Long id);
}
