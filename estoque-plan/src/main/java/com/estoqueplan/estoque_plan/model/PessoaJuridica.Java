package com.estoqueplan.estoque_plan.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "pessoas_juridicas")
@Data
@EqualsAndHashCode(callSuper = true)  //Inclui os campos da superclasse
public class PessoaJuridica extends Cliente {

    private String cnpj;

    private double capitalSocial;

}