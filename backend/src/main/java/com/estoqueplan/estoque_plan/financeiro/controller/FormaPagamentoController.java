package com.estoqueplan.estoque_plan.financeiro.controller;

import com.estoqueplan.estoque_plan.financeiro.model.FormaPagamento;
import com.estoqueplan.estoque_plan.financeiro.service.FormaPagamentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    public ResponseEntity<List<FormaPagamento>> listarFormasPagamento(
            @RequestParam(required = false, defaultValue = "false") Boolean incluirInativos
    ) {
        return ResponseEntity.ok(formaPagamentoService.listarFormasPagamento(incluirInativos));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FormaPagamento> editarFormaPagamento(@PathVariable Long id, @RequestBody FormaPagamento body) {
        FormaPagamento formaPagamentoAtualizada = formaPagamentoService.atualizarFormaPagamento(id, body);
        return ResponseEntity.ok(formaPagamentoAtualizada);
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PatchMapping("/{id}/inativar")
    public ResponseEntity<Void> inativarFormaPagamento(@PathVariable Long id) {
        formaPagamentoService.inativarFormaPagamento(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PatchMapping("/{id}/ativar")
    public ResponseEntity<Void> ativarFormaPagamento(@PathVariable Long id) {
        formaPagamentoService.ativarFormaPagamento(id);
        return ResponseEntity.noContent().build();
    }
}
