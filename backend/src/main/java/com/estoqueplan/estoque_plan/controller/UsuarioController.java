package com.estoqueplan.estoque_plan.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.estoqueplan.estoque_plan.dto.UsuarioAdminUpdateDTO;
import com.estoqueplan.estoque_plan.dto.UsuarioCreateDTO;
import com.estoqueplan.estoque_plan.dto.UsuarioDTO;
import com.estoqueplan.estoque_plan.dto.UsuarioPerfilUpdateDTO;
import com.estoqueplan.estoque_plan.model.Usuario;
import com.estoqueplan.estoque_plan.service.UsuarioService;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> listarTodosUsuarios() {
        List<UsuarioDTO> usuarios = usuarioService.listarTodosUsuarios()
                .stream()
                .map(this::toUsuarioDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(usuarios);
    }

    @PostMapping
    public ResponseEntity<UsuarioDTO> criarUsuario(@RequestBody UsuarioCreateDTO usuarioCreateDTO) {
        Usuario novoUsuario = usuarioService.criarUsuarioViaDTO(usuarioCreateDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(toUsuarioDTO(novoUsuario));
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> buscarUsuarioPorId(@PathVariable Long id) {
        return usuarioService.buscarUsuariosPorId(id)
                .map(this::toUsuarioDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioDTO> buscarMeuPerfil(Authentication authentication) {
        Usuario usuario = usuarioService.buscarPorLogin(authentication.getName());
        return ResponseEntity.ok(toUsuarioDTO(usuario));
    }

    @PutMapping("/me")
    public ResponseEntity<UsuarioDTO> atualizarMeuPerfil(
            @RequestBody UsuarioPerfilUpdateDTO dto,
            Authentication authentication) {
        Usuario usuarioAtualizado = usuarioService.atualizarMeuPerfil(authentication.getName(), dto);
        return ResponseEntity.ok(toUsuarioDTO(usuarioAtualizado));
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioDTO> atualizarUsuarioPorAdmin(
            @PathVariable Long id,
            @RequestBody UsuarioAdminUpdateDTO dto,
            Authentication authentication) {
        Usuario usuarioAtualizado = usuarioService.atualizarUsuarioPorAdmin(id, authentication.getName(), dto);
        return ResponseEntity.ok(toUsuarioDTO(usuarioAtualizado));
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PatchMapping("/{id}/ativar")
    public ResponseEntity<Void> ativarUsuario(@PathVariable Long id) {
        usuarioService.ativarUsuarioPorId(id);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PatchMapping("/{id}/inativar")
    public ResponseEntity<Void> inativarUsuario(@PathVariable Long id) {
        usuarioService.inativarUsuarioPorId(id);
        return ResponseEntity.ok().build();
    }

    private UsuarioDTO toUsuarioDTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setSobrenome(usuario.getSobrenome());
        dto.setDataNascimento(usuario.getDataNascimento());
        dto.setCargo(usuario.getCargo());
        dto.setLogin(usuario.getLogin());
        dto.setPermissao(usuario.getPermissao());
        dto.setAtivo(usuario.isAtivo());
        dto.setInativadoEm(usuario.getInativadoEm());
        return dto;
    }
}