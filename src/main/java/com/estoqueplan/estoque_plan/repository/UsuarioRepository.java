package com.estoqueplan.estoque_plan.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.estoqueplan.estoque_plan.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long>{
    
    public Optional<Usuario> findByLogin(String login);

    public Optional<Usuario> findByNome(String nome);

    public Optional<Usuario> findByNomeAndSobrenome(String nome, String sobrenome);

    public Optional<Usuario> findByCargo(String cargo);

}
