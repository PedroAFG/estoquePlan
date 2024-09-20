package com.estoqueplan.estoque_plan.dto;

import lombok.Data;

@Data
public class UsuarioCreateDTO {

    private String nome;
    private String sobrenome;
    private String login;
    private String senha;

}

