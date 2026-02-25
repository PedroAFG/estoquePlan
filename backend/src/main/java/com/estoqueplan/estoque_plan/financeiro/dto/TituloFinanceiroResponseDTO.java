package com.estoqueplan.estoque_plan.financeiro.dto;

import com.estoqueplan.estoque_plan.financeiro.model.enums.StatusTitulo;
import com.estoqueplan.estoque_plan.financeiro.model.enums.TipoTitulo;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class TituloFinanceiroResponseDTO {

    private Long id;
    private TipoTitulo tipo;
    private String descricao;
    private BigDecimal valorTotal;
    private LocalDateTime dataEmissao;
    private StatusTitulo status;

    private Long categoriaId;
    private String categoriaNome;

    private List<ParcelaResumoDTO> parcelas;

    public static class ParcelaResumoDTO {
        private Long id;
        private Integer numero;
        private BigDecimal valor;
        private LocalDate vencimento;
        private StatusTitulo status;
        private LocalDate dataBaixa;
        private Long formaPagamentoId;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Integer getNumero() { return numero; }
        public void setNumero(Integer numero) { this.numero = numero; }

        public BigDecimal getValor() { return valor; }
        public void setValor(BigDecimal valor) { this.valor = valor; }

        public LocalDate getVencimento() { return vencimento; }
        public void setVencimento(LocalDate vencimento) { this.vencimento = vencimento; }

        public StatusTitulo getStatus() { return status; }
        public void setStatus(StatusTitulo status) { this.status = status; }

        public LocalDate getDataBaixa() { return dataBaixa; }
        public void setDataBaixa(LocalDate dataBaixa) { this.dataBaixa = dataBaixa; }

        public Long getFormaPagamentoId() { return formaPagamentoId; }
        public void setFormaPagamentoId(Long formaPagamentoId) { this.formaPagamentoId = formaPagamentoId; }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public TipoTitulo getTipo() { return tipo; }
    public void setTipo(TipoTitulo tipo) { this.tipo = tipo; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public BigDecimal getValorTotal() { return valorTotal; }
    public void setValorTotal(BigDecimal valorTotal) { this.valorTotal = valorTotal; }

    public LocalDateTime getDataEmissao() { return dataEmissao; }
    public void setDataEmissao(LocalDateTime dataEmissao) { this.dataEmissao = dataEmissao; }

    public StatusTitulo getStatus() { return status; }
    public void setStatus(StatusTitulo status) { this.status = status; }

    public Long getCategoriaId() { return categoriaId; }
    public void setCategoriaId(Long categoriaId) { this.categoriaId = categoriaId; }

    public String getCategoriaNome() { return categoriaNome; }
    public void setCategoriaNome(String categoriaNome) { this.categoriaNome = categoriaNome; }

    public List<ParcelaResumoDTO> getParcelas() { return parcelas; }
    public void setParcelas(List<ParcelaResumoDTO> parcelas) { this.parcelas = parcelas; }
}