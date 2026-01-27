package com.estoqueplan.estoque_plan.controller;

import java.util.List; // Import correto
import java.util.stream.Collectors;

import com.estoqueplan.estoque_plan.config.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.estoqueplan.estoque_plan.dto.UsuarioCreateDTO;
import com.estoqueplan.estoque_plan.dto.UsuarioDTO;
import com.estoqueplan.estoque_plan.model.Usuario;
import com.estoqueplan.estoque_plan.service.UsuarioService;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    // Listar todos os usuários (Retornando apenas o DTO)
    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> listarTodosUsuarios() {
        List<UsuarioDTO> usuarios = usuarioService.listarTodosUsuarios()  // Retorna List<Usuario>
            .stream()
            .map(this::toUsuarioDTO) // Converte Usuario para UsuarioDTO
            .collect(Collectors.toList());
        return ResponseEntity.ok(usuarios);
    }

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/me")
    public ResponseEntity<?> getMe(HttpServletRequest request) {
        String token = null;

        // Tenta pegar token do header Authorization
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }
        // Ou do cookie "jwt"
        if (token == null && request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("jwt".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        if (token == null) return ResponseEntity.status(401).body("Token não encontrado");

        String login = jwtUtil.extractUsername(token);

        Usuario usuario = usuarioService.buscarUsuarioPorLoginEntity(login);
        if (usuario == null) return ResponseEntity.status(404).body("Usuário não encontrado");

        return ResponseEntity.ok(new UsuarioDTO(usuario));
    }

    // Criar um novo usuário (Recebendo o DTO de criação)
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PostMapping
    public ResponseEntity<UsuarioDTO> criarUsuario(@RequestBody UsuarioCreateDTO usuarioCreateDTO) {
        Usuario usuario = toUsuario(usuarioCreateDTO); // Converte DTO para entidade
        Usuario novoUsuario = usuarioService.salvar(usuario); // Agora o método salvar está definido
        return ResponseEntity.status(HttpStatus.CREATED).body(toUsuarioDTO(novoUsuario));
    }


    // Buscar usuário por ID (Retornando DTO)
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> buscarUsuarioPorId(@PathVariable Long id) {
        return usuarioService.buscarUsuariosPorId(id)
            .map(this::toUsuarioDTO)  // Converte Usuario para UsuarioDTO
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }


    // Métodos de conversão (pode estar no service)
    private UsuarioDTO toUsuarioDTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setSobrenome(usuario.getSobrenome());
        dto.setCargo(usuario.getCargo());
        dto.setLogin(usuario.getLogin());
        dto.setPermissao(usuario.getPermissao());
        return dto;
    }

    private Usuario toUsuario(UsuarioCreateDTO dto) {
        Usuario usuario = new Usuario();
        usuario.setNome(dto.getNome());
        usuario.setSobrenome(dto.getSobrenome());
        usuario.setCargo(dto.getCargo());
        usuario.setLogin(dto.getLogin());
        usuario.setSenha(dto.getSenha());
        usuario.setPermissao(dto.getPermissao());
        return usuario;
    }
}
