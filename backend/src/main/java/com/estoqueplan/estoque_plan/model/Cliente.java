package com.estoqueplan.estoque_plan.model;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

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

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "endereco_id")
    private Endereco endereco;

    private int numeroDeCompras;

    @Column(nullable = false)
    private boolean ativo = true;

    private LocalDateTime inativadoEm;

}
