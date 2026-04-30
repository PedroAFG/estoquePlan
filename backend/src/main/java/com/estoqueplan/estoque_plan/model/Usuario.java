package com.estoqueplan.estoque_plan.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "usuarios")
@Data
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private String sobrenome;

    private LocalDate dataNascimento;

    private String cargo;

    private String login;

    private String senha;

    @Column(nullable = false)
    private boolean ativo = true;

    private LocalDateTime inativadoEm;

    @Enumerated(EnumType.STRING)
    private Permissao permissao;

    private String resetPasswordToken;

    private LocalDateTime resetPasswordTokenExpiraEm;

    //Enums para permissões
    public enum Permissao {
        ADMINISTRADOR,
        COLABORADOR
    }

     
}
