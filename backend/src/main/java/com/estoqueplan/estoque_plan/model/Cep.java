package com.estoqueplan.estoque_plan.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ceps")
@Data
public class Cep {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 8)
    private String codigo;

    private String logradouro;
    private String bairro;
    private String complemento;

    @ManyToOne
    @JoinColumn(name = "cidade_id")
    private Cidade cidade;
}
