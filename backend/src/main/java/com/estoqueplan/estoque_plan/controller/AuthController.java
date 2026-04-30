package com.estoqueplan.estoque_plan.controller;

import com.estoqueplan.estoque_plan.dto.LoginDTO;
import com.estoqueplan.estoque_plan.config.JwtUtil;
import com.estoqueplan.estoque_plan.model.Usuario;
import com.estoqueplan.estoque_plan.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.estoqueplan.estoque_plan.dto.EsqueciSenhaDTO;
import com.estoqueplan.estoque_plan.dto.RedefinirSenhaDTO;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO request) {
        Usuario usuario = usuarioService.buscarPorLogin(request.getLogin());
        boolean valido = usuario != null && usuarioService.validar(request.getLogin(), request.getSenha());
        if (valido) {
            String token = jwtUtil.generateToken(usuario.getLogin(), usuario.getPermissao().name());
            ResponseCookie jwtCookie = ResponseCookie.from("jwt", token)
                    .httpOnly(true)
                    .secure(false) // true só em produção HTTPS
                    .path("/")
                    .maxAge(24 * 60 * 60)
                    .sameSite("Strict")
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                    .body(new JwtResponse(token));
        } else {
            return ResponseEntity.status(401).body("Credenciais inválidas");
        }
    }


    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        ResponseCookie jwtCookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0) // expira agora!
                .sameSite("Strict")
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .body("Logout realizado!");
    }

    // Classe para resposta (pode ser um DTO separado)
    static class JwtResponse {
        public String token;
        public JwtResponse(String token) { this.token = token; }
    }

    @PostMapping("/esqueci-senha")
    public ResponseEntity<?> esqueciSenha(@RequestBody EsqueciSenhaDTO dto) {
        usuarioService.solicitarRedefinicaoSenha(dto.getEmail());

        return ResponseEntity.ok(
                "Se o e-mail informado estiver cadastrado, enviaremos as instruções para redefinição de senha."
        );
    }

    @PostMapping("/redefinir-senha")
    public ResponseEntity<?> redefinirSenha(@RequestBody RedefinirSenhaDTO dto) {
        usuarioService.redefinirSenha(dto.getToken(), dto.getNovaSenha());

        return ResponseEntity.ok("Senha redefinida com sucesso.");
    }
}