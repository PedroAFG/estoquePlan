package com.estoqueplan.estoque_plan.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "paises")
@Data
public class Pais {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String sigla;
}
