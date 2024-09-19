package com.estoqueplan.estoque_plan.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.estoqueplan.estoque_plan.model.Usuario;
import com.estoqueplan.estoque_plan.repository.UsuarioRepository;

@Service
public class UsuarioService {
    
    private UsuarioRepository usuarioRepository;

    public List<Usuario> listarTodosUsuarios() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> buscarUsuariosPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    public Optional<Usuario> buscarUsuariosPorLogin(String login) {
        return usuarioRepository.findByLogin(login);
    }

    public Optional<Usuario> buscarUsuarioPorCargo(String cargo){
        return usuarioRepository.findByCargo(cargo);
    }

    public Optional<Usuario> buscarUsuarioPorNomeSobrenome(String nome, String sobrenome){
        return usuarioRepository.findByNomeSobrenome(nome, sobrenome);
    }

}
