package com.estoqueplan.estoque_plan.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "vendas")
@Data
public class Venda {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @OneToMany(mappedBy = "venda", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemVenda> itens;

    private LocalDateTime dataDaVenda;

    private BigDecimal valorTotal;
    private BigDecimal desconto;
    private BigDecimal adicional;
    private BigDecimal frete;

    // Campos para observação, endereço, fone (caso não tenha cliente)
    private String rua;
    private String bairro;
    private String fone;
    private String observacao;
}
