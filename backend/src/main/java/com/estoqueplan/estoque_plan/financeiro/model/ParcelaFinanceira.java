package com.estoqueplan.estoque_plan.financeiro.model;

import com.estoqueplan.estoque_plan.financeiro.model.enums.StatusTitulo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Entity
@Table (name = "parcela_financeira")
public class ParcelaFinanceira {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer numero;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valor;

    @Column(nullable = false)
    private LocalDate vencimento;

    @Enumerated(EnumType.STRING)
    @Column (nullable = false)
    private StatusTitulo status;

    private LocalDate dataBaixa;

    @JsonIgnore
    @ManyToOne(optional = false)
    @JoinColumn (name = "titulo_financeiro_id")
    private TituloFinanceiro tituloFinanceiro;

    @ManyToOne(optional = false)
    @JoinColumn (name = "forma_pagamento_id")
    private FormaPagamento formaPagamento;

    @OneToOne
    @JoinColumn (name = "movimentacao_caixa_id")
    private MovimentacaoCaixa movimentacaoCaixa;
}
