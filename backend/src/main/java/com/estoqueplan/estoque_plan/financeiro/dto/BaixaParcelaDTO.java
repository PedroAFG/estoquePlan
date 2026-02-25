package com.estoqueplan.estoque_plan.financeiro.dto;

import java.time.LocalDate;

public class BaixaParcelaDTO {
    private LocalDate dataBaixa;     // opcional (se null, usa hoje)
    private String descricao;        // opcional (vai pra movimentação)

    public LocalDate getDataBaixa() { return dataBaixa; }
    public void setDataBaixa(LocalDate dataBaixa) { this.dataBaixa = dataBaixa; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
}
