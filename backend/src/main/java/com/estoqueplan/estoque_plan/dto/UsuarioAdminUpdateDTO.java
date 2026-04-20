package com.estoqueplan.estoque_plan.dto;

import java.time.LocalDate;

import com.estoqueplan.estoque_plan.model.Usuario;

import lombok.Data;

@Data
public class UsuarioAdminUpdateDTO {

    private String nome;
    private String sobrenome;
    private LocalDate dataNascimento;
    private String cargo;
    private String login;
    private String senha;
    private Usuario.Permissao permissao;
    private Boolean ativo;
}