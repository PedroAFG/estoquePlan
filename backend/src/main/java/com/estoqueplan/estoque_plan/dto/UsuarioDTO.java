package com.estoqueplan.estoque_plan.dto;

import com.estoqueplan.estoque_plan.model.Usuario;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UsuarioDTO {

    private Long id;
    private String nome;
    private String cargo;
    private String sobrenome;
    private String login;
    private Usuario.Permissao permissao;

    public UsuarioDTO(Usuario usuario) {
        this.id = usuario.getId();
        this.nome = usuario.getNome();
        this.sobrenome = usuario.getSobrenome();
        this.cargo = usuario.getCargo();
        this.login = usuario.getLogin();
        this.permissao = usuario.getPermissao();
    }


}

