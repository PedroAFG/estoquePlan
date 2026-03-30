package com.estoqueplan.estoque_plan.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class UsuarioPerfilUpdateDTO {

    private String nome;
    private String sobrenome;
    private LocalDate dataNascimento;
    private String cargo;
    private String login;
    private String senha;
}