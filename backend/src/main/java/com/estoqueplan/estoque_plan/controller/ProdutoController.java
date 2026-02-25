package com.estoqueplan.estoque_plan.controller;

import com.estoqueplan.estoque_plan.dto.ProdutoDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.estoqueplan.estoque_plan.model.Produto;
import com.estoqueplan.estoque_plan.service.ProdutoService;

@RestController
@RequestMapping("/produtos")
public class ProdutoController {
    
    @Autowired
    private ProdutoService produtoService;

    @GetMapping
    public ResponseEntity<List<Produto>> listarTodosProdutos(
            @RequestParam(required = false, defaultValue = "false") Boolean incluirInativos
    ) {
        return ResponseEntity.ok(produtoService.listarProdutos(incluirInativos));
    }


    @PostMapping
    public ResponseEntity<Produto> criarProduto(@RequestBody ProdutoDTO dto) {
        Produto produtoSalvo = produtoService.salvarProduto(dto);
        return ResponseEntity.ok(produtoSalvo);
    }


    //buscar produto por ID
    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarProdutoPorId(@PathVariable Long id) {
        return produtoService.encontrarProdutoPorId(id)
                .map(produto -> ResponseEntity.ok(produto))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Produto> editarProduto(@PathVariable Long id, @RequestBody ProdutoDTO dto) {
        Produto produtoAtualizado = produtoService.atualizarProduto(id, dto);
        return ResponseEntity.ok(produtoAtualizado);
    }


    @PatchMapping("/{id}/ativar")
    public ResponseEntity<Void> ativarProduto(@PathVariable Long id) {
        produtoService.ativarProdutoPorId(id);
        return ResponseEntity.ok().build();
    }


    @PatchMapping("/{id}/inativar")
    public ResponseEntity<Void> inativarProduto(@PathVariable Long id) {
        produtoService.inativarProdutoPorId(id);
        return ResponseEntity.noContent().build();
    }


}
