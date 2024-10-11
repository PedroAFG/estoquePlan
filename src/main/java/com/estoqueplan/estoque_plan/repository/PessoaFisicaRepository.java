package com.estoqueplan.estoque_plan.repository;

import com.estoqueplan.estoque_plan.model.PessoaFisica;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PessoaFisicaRepository extends JpaRepository<PessoaFisica, Long> {
    //método específico para buscar por CPF, se necessário
    Optional<PessoaFisica> findByCpf(String cpf);
}
