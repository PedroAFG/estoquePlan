package com.estoqueplan.estoque_plan.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.estoqueplan.estoque_plan.dto.UsuarioDTO;
import com.estoqueplan.estoque_plan.model.Usuario;
import com.estoqueplan.estoque_plan.repository.UsuarioRepository;


@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Usuario> listarTodosUsuarios() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> buscarUsuariosPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    public Optional<UsuarioDTO> buscarUsuariosPorLogin(String login) {
        return usuarioRepository.findByLogin(login)
                .map(this::toDTO);
    }

    public Optional<UsuarioDTO> buscarUsuarioPorCargo(String cargo) {
        return usuarioRepository.findByCargo(cargo)
                .map(this::toDTO);
    }

    public Optional<UsuarioDTO> buscarUsuarioPorNomeSobrenome(String nome, String sobrenome) {
        return usuarioRepository.findByNomeAndSobrenome(nome, sobrenome)
                .map(this::toDTO);
    }

    public Usuario salvar(Usuario usuario) {
        // Criptografa a senha antes de salvar
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        return usuarioRepository.save(usuario);
    }

    private UsuarioDTO toDTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setSobrenome(usuario.getSobrenome());
        dto.setCargo(usuario.getCargo());
        dto.setLogin(usuario.getLogin());
        dto.setPermissao(usuario.getPermissao());
        return dto;
    }
}
