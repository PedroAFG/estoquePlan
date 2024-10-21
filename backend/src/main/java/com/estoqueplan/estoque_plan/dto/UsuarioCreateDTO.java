package com.estoqueplan.estoque_plan.dto;

import com.estoqueplan.estoque_plan.model.Usuario;

import lombok.Data;

@Data
public class UsuarioCreateDTO {

    private String nome;
    private String sobrenome;
    private String cargo;
    private String login;
    private String senha;  // A senha pode ser recebida na criação
    private Usuario.Permissao permissao;

}

