package com.estoqueplan.estoque_plan.model;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "vendas")
@Data
public class Venda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //Relacionamento ManyToOne com a entidade Cliente. Cada venda está associada a um único cliente.
    //O campo cliente_id será a chave estrangeira que liga a venda ao cliente correspondente.
    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    //Relacionamento ManyToMany com a entidade Produto.
    //Uma venda pode incluir múltiplos produtos, e cada produto pode estar presente em múltiplas vendas.
    //A tabela venda_produtos será usada para gerenciar essa relação.
    @ManyToMany
    @JoinTable(
        name = "venda_produtos",
        joinColumns = @JoinColumn(name = "venda_id"),
        inverseJoinColumns = @JoinColumn(name = "produto_id")
    )
    
    private List<Produto> produtos;

    private LocalDateTime dataDaVenda;

    private int quantidade;

    private BigDecimal valorTotal;

    private BigDecimal desconto;

}

