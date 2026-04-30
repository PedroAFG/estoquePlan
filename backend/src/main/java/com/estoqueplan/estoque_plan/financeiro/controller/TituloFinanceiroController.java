package com.estoqueplan.estoque_plan.financeiro.controller;

import com.estoqueplan.estoque_plan.financeiro.dto.TituloFinanceiroCreateDTO;
import com.estoqueplan.estoque_plan.financeiro.dto.TituloFinanceiroResponseDTO;
import com.estoqueplan.estoque_plan.financeiro.service.TituloFinanceiroImportExportService;
import com.estoqueplan.estoque_plan.financeiro.service.TituloFinanceiroService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/financeiro/titulos")
public class TituloFinanceiroController {

    private final TituloFinanceiroService service;

    private final TituloFinanceiroImportExportService importExportService;

    public TituloFinanceiroController(
            TituloFinanceiroService service,
            TituloFinanceiroImportExportService importExportService
    ) {
        this.service = service;
        this.importExportService = importExportService;
    }

    @PostMapping
    public ResponseEntity<TituloFinanceiroResponseDTO> criar(@RequestBody TituloFinanceiroCreateDTO dto) {
        return ResponseEntity.ok(service.criarTitulo(dto));
    }

    @GetMapping
    public ResponseEntity<List<TituloFinanceiroResponseDTO>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TituloFinanceiroResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<TituloFinanceiroResponseDTO> cancelar(@PathVariable Long id) {
        return ResponseEntity.ok(service.cancelarTitulo(id));
    }

    @GetMapping("/exportar/xlsx")
    public ResponseEntity<byte[]> exportarXlsx() {
        byte[] arquivo = importExportService.exportarXlsx();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=titulos_financeiros.xlsx")
                .header(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .body(arquivo);
    }

    @GetMapping("/exportar/pdf")
    public ResponseEntity<byte[]> exportarPdf() {
        byte[] arquivo = importExportService.exportarPdf();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=titulos_financeiros.pdf")
                .header(HttpHeaders.CONTENT_TYPE, "application/pdf")
                .body(arquivo);
    }

    @PostMapping("/importar/xlsx")
    public ResponseEntity<String> importarXlsx(@RequestParam("arquivo") MultipartFile arquivo) {
        int totalImportados = importExportService.importarXlsx(arquivo);
        return ResponseEntity.ok(totalImportados + " título(s) importado(s) com sucesso.");
    }
}