package com.estoqueplan.estoque_plan.controller;

import com.estoqueplan.estoque_plan.dto.ProdutoDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.estoqueplan.estoque_plan.model.Produto;
import com.estoqueplan.estoque_plan.service.ProdutoService;
import com.estoqueplan.estoque_plan.service.ProdutoImportExportService;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpHeaders;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/produtos")
public class ProdutoController {
    
    @Autowired
    private ProdutoService produtoService;

    @Autowired
    private ProdutoImportExportService produtoImportExportService;

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


    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PatchMapping("/{id}/ativar")
    public ResponseEntity<Void> ativarProduto(@PathVariable Long id) {
        produtoService.ativarProdutoPorId(id);
        return ResponseEntity.ok().build();
    }


    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PatchMapping("/{id}/inativar")
    public ResponseEntity<Void> inativarProduto(@PathVariable Long id) {
        produtoService.inativarProdutoPorId(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/exportar/xlsx")
    public ResponseEntity<byte[]> exportarXlsx(
            @RequestParam(required = false, defaultValue = "false") Boolean incluirInativos
    ) {
        byte[] arquivo = produtoImportExportService.exportarXlsx(incluirInativos);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=produtos.xlsx")
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .body(arquivo);
    }

    @GetMapping("/exportar/pdf")
    public ResponseEntity<byte[]> exportarPdf(
            @RequestParam(required = false, defaultValue = "false") Boolean incluirInativos
    ) {
        byte[] arquivo = produtoImportExportService.exportarPdf(incluirInativos);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=produtos.pdf")
                .header("Content-Type", "application/pdf")
                .body(arquivo);
    }

    @PostMapping("/importar/xlsx")
    public ResponseEntity<String> importarXlsx(@RequestParam("arquivo") MultipartFile arquivo) {
        int totalImportados = produtoImportExportService.importarXlsx(arquivo);
        return ResponseEntity.ok(totalImportados + " produto(s) importado(s) com sucesso.");
    }


}
