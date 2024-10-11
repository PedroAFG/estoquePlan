package com.estoqueplan.estoque_plan.model;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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

    @Enumerated(EnumType.STRING)
    private Permissao permissao;

    //Enums para permissões
    public enum Permissao {
        ADMINISTRADOR,
        COLABORADOR
    }

     
}
