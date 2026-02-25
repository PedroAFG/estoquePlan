package com.estoqueplan.estoque_plan.financeiro.model;

import com.estoqueplan.estoque_plan.financeiro.model.enums.TipoTitulo;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "categoria_financeira")
@Data
public class CategoriaFinanceira {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoTitulo tipo;

    @Column(nullable = false)
    private boolean ativo = true;

}
