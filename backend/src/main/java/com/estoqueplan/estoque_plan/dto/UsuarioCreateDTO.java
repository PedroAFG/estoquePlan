package com.estoqueplan.estoque_plan.dto;

import com.estoqueplan.estoque_plan.model.Usuario;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class UsuarioCreateDTO {

    private String nome;
    private String sobrenome;
    private LocalDate dataNascimento;
    private String cargo;
    private String login;
    private String senha;  // A senha pode ser recebida na criação
    private Usuario.Permissao permissao;
    private Boolean ativo;
    private LocalDateTime inativadoEm;

}

