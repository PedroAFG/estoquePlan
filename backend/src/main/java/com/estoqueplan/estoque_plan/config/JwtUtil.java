package com.estoqueplan.estoque_plan.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    // O ideal é mover essa chave para uma config externa
    private static final String SECRET_KEY = "umasecretkeygrandeealeatoria1234567890"; // min. 32 chars

    private SecretKey getSigningKey() {
        // Use StandardCharsets.UTF_8 para evitar warning
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    // claim: Gera token incluindo a role/permissao
    public String generateToken(String username, String role) {
        long expirationMillis = 1000 * 60 * 60 * 24; // 24h
        return Jwts.builder()
                .subject(username)
                .claim("role", role) // Adiciona role
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMillis))
                .signWith(getSigningKey())
                .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    // NOVO: Extrai a role do token
    public String extractRole(String token) {
        return (String) Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("role");
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}