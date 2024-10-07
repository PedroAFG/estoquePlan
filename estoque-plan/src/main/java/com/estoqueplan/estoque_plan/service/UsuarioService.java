package com.estoqueplan.estoque_plan.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.estoqueplan.estoque_plan.dto.UsuarioDTO;
import com.estoqueplan.estoque_plan.model.Usuario;
import com.estoqueplan.estoque_plan.repository.UsuarioRepository;

@Service
public class UsuarioService {
    
    private UsuarioRepository usuarioRepository;

    // Método para listar todos os usuários com conversão para DTO
    public List<UsuarioDTO> listarTodosUsuarios() {
        return usuarioRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Método para buscar usuário por ID com conversão para DTO
    public Optional<UsuarioDTO> buscarUsuariosPorId(Long id) {
        return usuarioRepository.findById(id)
                .map(this::toDTO);
    }

    // Método para buscar usuário por login com conversão para DTO
    public Optional<UsuarioDTO> buscarUsuariosPorLogin(String login) {
        return usuarioRepository.findByLogin(login)
                .map(this::toDTO);
    }

    // Método para buscar usuário por cargo com conversão para DTO
    public Optional<UsuarioDTO> buscarUsuarioPorCargo(String cargo) {
        return usuarioRepository.findByCargo(cargo)
                .map(this::toDTO);
    }

    // Método para buscar usuário por nome e sobrenome com conversão para DTO
    public Optional<UsuarioDTO> buscarUsuarioPorNomeSobrenome(String nome, String sobrenome) {
        return usuarioRepository.findByNomeAndSobrenome(nome, sobrenome)
                .map(this::toDTO);
    }

    public Usuario salvar(Usuario usuario) {
        return usuarioRepository.save(usuario); // O repositório que faz a persistência no banco
    }
    

    // Método auxiliar para converter Usuario para UsuarioDTO
    private UsuarioDTO toDTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setSobrenome(usuario.getSobrenome());
        dto.setLogin(usuario.getLogin());
        // Aqui, por segurança, não expomos a senha
        return dto;
    }

}
