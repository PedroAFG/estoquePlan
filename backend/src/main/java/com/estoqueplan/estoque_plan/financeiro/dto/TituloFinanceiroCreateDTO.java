package com.estoqueplan.estoque_plan.financeiro.dto;

import com.estoqueplan.estoque_plan.financeiro.model.enums.TipoTitulo;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class TituloFinanceiroCreateDTO {

    private TipoTitulo tipo;                 // A_PAGAR ou A_RECEBER
    private String descricao;
    private BigDecimal valorTotal;

    // mandar localdate ou deixar nulo, pra set de data AGORA
    private LocalDateTime dataEmissao;

    private Long categoriaId;

    // Geração de parcelas
    private Integer numeroParcelas;          // ex: 1, 2, 3...
    private LocalDate primeiroVencimento;    // ex: hoje
    private Integer intervaloDias;           // ex: 30 (se null, assume 30)

    private Long formaPagamentoId;

    // opcional: vincular venda no futuro
    private Long vendaId;

    public TipoTitulo getTipo() { return tipo; }
    public void setTipo(TipoTitulo tipo) { this.tipo = tipo; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public BigDecimal getValorTotal() { return valorTotal; }
    public void setValorTotal(BigDecimal valorTotal) { this.valorTotal = valorTotal; }

    public LocalDateTime getDataEmissao() { return dataEmissao; }
    public void setDataEmissao(LocalDateTime dataEmissao) { this.dataEmissao = dataEmissao; }

    public Long getCategoriaId() { return categoriaId; }
    public void setCategoriaId(Long categoriaId) { this.categoriaId = categoriaId; }

    public Integer getNumeroParcelas() { return numeroParcelas; }
    public void setNumeroParcelas(Integer numeroParcelas) { this.numeroParcelas = numeroParcelas; }

    public LocalDate getPrimeiroVencimento() { return primeiroVencimento; }
    public void setPrimeiroVencimento(LocalDate primeiroVencimento) { this.primeiroVencimento = primeiroVencimento; }

    public Integer getIntervaloDias() { return intervaloDias; }
    public void setIntervaloDias(Integer intervaloDias) { this.intervaloDias = intervaloDias; }

    public Long getFormaPagamentoId() { return formaPagamentoId; }
    public void setFormaPagamentoId(Long formaPagamentoId) { this.formaPagamentoId = formaPagamentoId; }

    public Long getVendaId() { return vendaId; }
    public void setVendaId(Long vendaId) { this.vendaId = vendaId; }
}