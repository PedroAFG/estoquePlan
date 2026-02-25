package com.estoqueplan.estoque_plan.financeiro.controller;

import com.estoqueplan.estoque_plan.financeiro.model.CategoriaFinanceira;
import com.estoqueplan.estoque_plan.financeiro.service.CategoriaFinanceiraService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("categoriasFinanceiras")
public class CategoriaFinanceiraController {

    @Autowired
    private CategoriaFinanceiraService categoriaFinanceiraService;

    @PostMapping
    public ResponseEntity<CategoriaFinanceira> criarCategoriaFinanceira(@RequestBody CategoriaFinanceira categoriaFinanceira) {
        return ResponseEntity.ok(categoriaFinanceiraService.salvarCategoriaFinanceira(categoriaFinanceira));
    }

    @GetMapping
    public ResponseEntity<List<CategoriaFinanceira>> listarCategoriaFinanceira() {
        return ResponseEntity.ok(categoriaFinanceiraService.listarCategoriasFinanceiras());
    }
}
