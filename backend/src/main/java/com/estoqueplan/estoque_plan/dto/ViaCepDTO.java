package com.estoqueplan.estoque_plan.dto;

import lombok.Data;

@Data
public class ViaCepDTO {

    private String cep;

    private String logradouro;

    private String complemento;

    private String bairro;

    private String localidade;

    private String uf;

    private Boolean erro;
}