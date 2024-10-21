package com.estoqueplan.estoque_plan.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.estoqueplan.estoque_plan.model.PessoaJuridica;
import java.util.Optional;


public interface PessoaJuridicaRepository extends JpaRepository<PessoaJuridica, Long> {

    Optional<PessoaJuridica> findByCnpj(String cnpj);
    
}
