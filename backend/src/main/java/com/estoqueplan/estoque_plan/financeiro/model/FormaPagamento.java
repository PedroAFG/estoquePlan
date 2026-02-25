package com.estoqueplan.estoque_plan.financeiro.model;


import com.estoqueplan.estoque_plan.financeiro.model.enums.TipoPagamento;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Entity
@Table(name = "forma_pagamento")
@Data
public class FormaPagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoPagamento tipo;

    @Column(precision = 5, scale = 2)
    private BigDecimal taxaPercentual;

    @Column(nullable = false)
    private Integer prazoDiasRepasse = 0;

    @Column(nullable = false)
    private boolean ativo = true;

}
