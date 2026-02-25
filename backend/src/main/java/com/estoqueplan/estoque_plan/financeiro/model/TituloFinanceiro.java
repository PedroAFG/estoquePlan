package com.estoqueplan.estoque_plan.financeiro.model;

import com.estoqueplan.estoque_plan.financeiro.model.enums.StatusTitulo;
import com.estoqueplan.estoque_plan.financeiro.model.enums.TipoTitulo;
import com.estoqueplan.estoque_plan.model.Venda;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table (name = "titulo_financeiro")
public class TituloFinanceiro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoTitulo tipo;

    @Column(nullable = false, length = 200)
    private String descricao;

    @Column(nullable = false)
    private BigDecimal valorTotal;

    @Column(nullable = false)
    private LocalDateTime dataEmissao;

    @Enumerated(EnumType.STRING)
    @Column (nullable = false)
    private StatusTitulo status;

    @ManyToOne
    @JoinColumn (name = "categoria_financeira_id")
    private CategoriaFinanceira categoria;

    @ManyToOne
    @JoinColumn (name = "venda_id")
    private Venda venda;

    @OneToMany(mappedBy = "tituloFinanceiro", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ParcelaFinanceira> parcelas = new ArrayList<>();



}
