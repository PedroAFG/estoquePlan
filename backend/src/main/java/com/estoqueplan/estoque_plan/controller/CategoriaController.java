package com.estoqueplan.estoque_plan.controller;

import com.estoqueplan.estoque_plan.model.Categoria;
import com.estoqueplan.estoque_plan.service.CategoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categorias")
public class CategoriaController {
    @Autowired
    private CategoriaService categoriaService;

    @PostMapping
    public ResponseEntity<Categoria> criarCategoria(@RequestBody Categoria categoria) {
        return ResponseEntity.ok(categoriaService.salvarCategoria(categoria));
    }

    @GetMapping
    public ResponseEntity<List<Categoria>> listarCategorias(
            @RequestParam(required = false, defaultValue = "false") Boolean incluirInativos
    ) {
        return ResponseEntity.ok(categoriaService.listarCategorias(incluirInativos));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Categoria> editarCategoria(@PathVariable Long id, @RequestBody Categoria body) {
        Categoria categoriaAtualizada = categoriaService.atualizarCategoria(id, body);
        return ResponseEntity.ok(categoriaAtualizada);
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PatchMapping("/{id}/inativar")
    public ResponseEntity<Void> inativarCategoria(@PathVariable Long id) {
        categoriaService.inativarCategoriaPorId(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PatchMapping("/{id}/ativar")
    public ResponseEntity<Void> ativarCategoria(@PathVariable Long id) {
        categoriaService.ativarCategoriaPorId(id);
        return ResponseEntity.noContent().build();
    }

}

