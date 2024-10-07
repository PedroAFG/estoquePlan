package com.estoqueplan.estoque_plan.dto;

import com.estoqueplan.estoque_plan.model.Usuario;

import lombok.Data;

@Data
public class UsuarioDTO {

    private Long id;
    private String nome;
    private String cargo;
    private String sobrenome;
    private String login;
    private Usuario.Permissao permissao;
    
}

