package com.estoqueplan.estoque_plan.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "enderecos")
@Data
public class Endereco {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numero;
    private String complemento;

    @ManyToOne
    @JoinColumn(name = "cep_id")
    private Cep cep;
}