package com.estoqueplan.estoque_plan.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "cidades")
@Data
public class Cidade {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @ManyToOne
    @JoinColumn(name = "estado_id")
    private Estado estado;
}
