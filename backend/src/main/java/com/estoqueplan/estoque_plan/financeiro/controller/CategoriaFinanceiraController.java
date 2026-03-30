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
    public ResponseEntity<List<CategoriaFinanceira>> listarCategoriaFinanceira(
            @RequestParam(required = false, defaultValue = "false") Boolean incluirInativos
    ) {
        return ResponseEntity.ok(categoriaFinanceiraService.listarCategoriasFinanceiras(incluirInativos));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoriaFinanceira> editarCategoriaFinanceira(@PathVariable Long id, @RequestBody CategoriaFinanceira body) {
        CategoriaFinanceira categoriaFinanceiraAtualizada = categoriaFinanceiraService.atualizarCategoriaFinanceira(id, body);
        return ResponseEntity.ok(categoriaFinanceiraAtualizada);
    }

    @PatchMapping("/{id}/inativar")
    public ResponseEntity<Void> inativarCategoriaFinanceira(@PathVariable Long id) {
        categoriaFinanceiraService.inativarCategoriaFinanceira(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/ativar")
    public ResponseEntity<Void> ativarCategoriaFinanceira(@PathVariable Long id) {
        categoriaFinanceiraService.ativarCategoriaFinanceiraPorId(id);
        return ResponseEntity.noContent().build();
    }
}
