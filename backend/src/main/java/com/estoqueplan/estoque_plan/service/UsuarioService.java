package com.estoqueplan.estoque_plan.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.estoqueplan.estoque_plan.dto.UsuarioAdminUpdateDTO;
import com.estoqueplan.estoque_plan.dto.UsuarioCreateDTO;
import com.estoqueplan.estoque_plan.dto.UsuarioDTO;
import com.estoqueplan.estoque_plan.dto.UsuarioPerfilUpdateDTO;
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
        validarLoginNovo(usuario.getLogin());

        if (usuario.getSenha() == null || usuario.getSenha().isBlank()) {
            throw new RuntimeException("A senha é obrigatória");
        }

        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        return usuarioRepository.save(usuario);
    }

    public Usuario criarUsuarioViaDTO(UsuarioCreateDTO dto) {
        validarLoginNovo(dto.getLogin());

        if (dto.getSenha() == null || dto.getSenha().isBlank()) {
            throw new RuntimeException("A senha é obrigatória");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(dto.getNome() != null ? dto.getNome().trim() : null);
        usuario.setSobrenome(dto.getSobrenome() != null ? dto.getSobrenome().trim() : null);
        usuario.setDataNascimento(dto.getDataNascimento());
        usuario.setCargo(dto.getCargo() != null ? dto.getCargo().trim() : null);
        usuario.setLogin(dto.getLogin() != null ? dto.getLogin().trim() : null);
        usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
        usuario.setPermissao(dto.getPermissao());

        return usuarioRepository.save(usuario);
    }

    public boolean validar(String login, String senha) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByLogin(login);
        if (usuarioOpt.isEmpty()) {
            return false;
        }

        Usuario usuario = usuarioOpt.get();
        return passwordEncoder.matches(senha, usuario.getSenha());
    }

    public Usuario buscarPorLogin(String login) {
        return usuarioRepository.findByLogin(login)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    public Usuario buscarUsuarioPorLoginEntity(String login) {
        return usuarioRepository.findByLogin(login).orElse(null);
    }

    public Usuario atualizarMeuPerfil(String loginLogado, UsuarioPerfilUpdateDTO dto) {
        Usuario usuario = usuarioRepository.findByLogin(loginLogado)
                .orElseThrow(() -> new RuntimeException("Usuário logado não encontrado"));

        if (dto.getNome() != null && !dto.getNome().isBlank()) {
            usuario.setNome(dto.getNome().trim());
        }

        if (dto.getSobrenome() != null && !dto.getSobrenome().isBlank()) {
            usuario.setSobrenome(dto.getSobrenome().trim());
        }

        if (dto.getDataNascimento() != null) {
            usuario.setDataNascimento(dto.getDataNascimento());
        }

        if (dto.getCargo() != null && !dto.getCargo().isBlank()) {
            usuario.setCargo(dto.getCargo().trim());
        }

        if (dto.getLogin() != null && !dto.getLogin().isBlank()) {
            validarLoginDuplicado(dto.getLogin().trim(), usuario.getId());
            usuario.setLogin(dto.getLogin().trim());
        }

        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
        }

        return usuarioRepository.save(usuario);
    }

    public Usuario atualizarUsuarioPorAdmin(Long id, String loginLogado, UsuarioAdminUpdateDTO dto) {
        Usuario adminLogado = usuarioRepository.findByLogin(loginLogado)
                .orElseThrow(() -> new RuntimeException("Usuário logado não encontrado"));

        if (adminLogado.getPermissao() != Usuario.Permissao.ADMINISTRADOR) {
            throw new RuntimeException("Apenas administradores podem editar outros usuários");
        }

        Usuario usuarioAlvo = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário alvo não encontrado"));

        if (dto.getNome() != null && !dto.getNome().isBlank()) {
            usuarioAlvo.setNome(dto.getNome().trim());
        }

        if (dto.getSobrenome() != null && !dto.getSobrenome().isBlank()) {
            usuarioAlvo.setSobrenome(dto.getSobrenome().trim());
        }

        if (dto.getDataNascimento() != null) {
            usuarioAlvo.setDataNascimento(dto.getDataNascimento());
        }

        if (dto.getCargo() != null && !dto.getCargo().isBlank()) {
            usuarioAlvo.setCargo(dto.getCargo().trim());
        }

        if (dto.getLogin() != null && !dto.getLogin().isBlank()) {
            validarLoginDuplicado(dto.getLogin().trim(), usuarioAlvo.getId());
            usuarioAlvo.setLogin(dto.getLogin().trim());
        }

        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            usuarioAlvo.setSenha(passwordEncoder.encode(dto.getSenha()));
        }

        if (dto.getPermissao() != null) {
            usuarioAlvo.setPermissao(dto.getPermissao());
        }

        return usuarioRepository.save(usuarioAlvo);
    }

    private void validarLoginNovo(String login) {
        if (login == null || login.isBlank()) {
            throw new RuntimeException("Login é obrigatório");
        }

        if (usuarioRepository.existsByLogin(login.trim())) {
            throw new RuntimeException("Já existe um usuário com este login");
        }
    }

    private void validarLoginDuplicado(String login, Long idUsuarioAtual) {
        if (usuarioRepository.existsByLoginAndIdNot(login, idUsuarioAtual)) {
            throw new RuntimeException("Já existe um usuário com este login");
        }
    }

    private UsuarioDTO toDTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setSobrenome(usuario.getSobrenome());
        dto.setDataNascimento(usuario.getDataNascimento());
        dto.setCargo(usuario.getCargo());
        dto.setLogin(usuario.getLogin());
        dto.setPermissao(usuario.getPermissao());
        return dto;
    }
}