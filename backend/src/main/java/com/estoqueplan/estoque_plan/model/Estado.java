package com.estoqueplan.estoque_plan.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "estados")
@Data
public class Estado {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String uf;

    @ManyToOne
    @JoinColumn(name = "pais_id")
    private Pais pais;
}
