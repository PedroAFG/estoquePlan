package com.estoqueplan.estoque_plan.model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Entity
@Table(name = "itens_venda")
@Data
public class ItemVenda {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "venda_id")
    private Venda venda;

    @ManyToOne
    @JoinColumn(name = "produto_id")
    private Produto produto;

    private Integer quantidade;
    private String unidade; // Ex: m³, un, etc
    private String bitola;  // Se quiser customizar aqui, senão só usa do Produto
    private String comprimento;
    private BigDecimal precoUnitario;
    private BigDecimal total; // quantidade * precoUnitario, já calculado
}
