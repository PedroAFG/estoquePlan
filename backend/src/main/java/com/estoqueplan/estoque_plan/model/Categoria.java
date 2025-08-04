package com.estoqueplan.estoque_plan.model;

import lombok.Data;
import jakarta.persistence.*;

@Entity
@Table(name = "categorias")
@Data
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
}

