package com.estoqueplan.estoque_plan.financeiro.controller;

import com.estoqueplan.estoque_plan.financeiro.model.FormaPagamento;
import com.estoqueplan.estoque_plan.financeiro.service.FormaPagamentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("formaPagamento")
public class FormaPagamentoController {

    @Autowired
    private FormaPagamentoService formaPagamentoService;

    @PostMapping
    public ResponseEntity<FormaPagamento> criarFormaPagamento(@RequestBody FormaPagamento formaPagamento) {
        return ResponseEntity.ok(formaPagamentoService.salvarFormaPagamento(formaPagamento));

    }

    @GetMapping
    public ResponseEntity<List<FormaPagamento>> listarFormasPagamento() {
        return ResponseEntity.ok(formaPagamentoService.listarFormasPagamento());
    }
}
