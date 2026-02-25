package com.estoqueplan.estoque_plan.financeiro.service;

import com.estoqueplan.estoque_plan.financeiro.model.FormaPagamento;
import com.estoqueplan.estoque_plan.financeiro.repository.FormaPagamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FormaPagamentoService {

    @Autowired
    private FormaPagamentoRepository formaPagamentoRepository;

    public FormaPagamento salvarFormaPagamento(FormaPagamento formaPagamento) {
        return formaPagamentoRepository.save(formaPagamento);
    }

    public List<FormaPagamento> listarFormasPagamento() {
        return formaPagamentoRepository.findAll();
    }

}
