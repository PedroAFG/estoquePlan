package com.estoqueplan.estoque_plan.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class VendaDTO {
    private Long id;
    private Long clienteId;
    private String nomeCliente; // opcional, para exibir no front
    private String rua;
    private String bairro;
    private String fone;
    private String observacao;
    private LocalDateTime dataDaVenda;
    private BigDecimal valorTotal;
    private BigDecimal desconto;
    private BigDecimal adicional;
    private BigDecimal frete;
    private List<ItemVendaDTO> itens;
    // getters e setters
}
