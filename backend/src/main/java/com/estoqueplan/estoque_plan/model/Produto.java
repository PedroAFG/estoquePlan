package com.estoqueplan.estoque_plan.model;

import lombok.Data;
import jakarta.persistence.*;
import java.math.BigDecimal;

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
}
