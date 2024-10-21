package com.estoqueplan.estoque_plan.model;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.DiscriminatorType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;
import lombok.Data;

//A tratativa abaixo é uma forma de controlar a abstração da classe Cliente, permitindo cadastro de pessoa física ou jurídica
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "tipo"
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = PessoaFisica.class, name = "pessoaFisica"),
    @JsonSubTypes.Type(value = PessoaJuridica.class, name = "pessoaJuridica")
})

@Entity
@Table(name = "clientes")
@Inheritance(strategy = InheritanceType.JOINED)  //Utiliza herança com tabelas separadas
@Data
@DiscriminatorColumn(name = "tipo_cliente", discriminatorType = DiscriminatorType.STRING)
public abstract class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private String email;

    private String telefone;

    private String endereco;

    private int numeroDeCompras;

}
