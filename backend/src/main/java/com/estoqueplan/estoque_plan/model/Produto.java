package com.estoqueplan.estoque_plan.model;

import lombok.Data;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "produtos")
@Data
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String descricao;

    //pensar em Enum no futuro
    private String unidade;

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    private BigDecimal custo;

    @Column(name = "preco_varejo")
    private BigDecimal precoVarejo;

    private Integer quantidadeDisponivel;

    //campos para o código fiscal (NCM)
    private String ncm;

    private String origem;

    private String tipo;

    @Column(name = "id_sebrae")
    private String idSebrae;

    private boolean ativo = true;

    private LocalDateTime inativadoEm;

    @Column(name = "estoque_minimo", nullable = false)
    private Integer estoqueMinimo = 0;

}
