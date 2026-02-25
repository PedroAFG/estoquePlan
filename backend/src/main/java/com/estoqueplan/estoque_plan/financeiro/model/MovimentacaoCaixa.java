package com.estoqueplan.estoque_plan.financeiro.model;

import com.estoqueplan.estoque_plan.financeiro.model.enums.TipoMovimentacao;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "movimentacao_caixa")
public class MovimentacaoCaixa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column (nullable = false)
    private TipoMovimentacao tipo;

    @Column(nullable = false)
    private LocalDateTime dataHora;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valor;

    @Column(nullable = true, length = 200)
    private String descricao;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal saldoApos;

    @JsonIgnore
    @OneToOne(mappedBy = "movimentacaoCaixa")
    private ParcelaFinanceira parcelaFinanceira;

    @PrePersist
    public void prePersist() {
        if (dataHora == null) dataHora = LocalDateTime.now();
    }
}
