package com.estoqueplan.estoque_plan.controller;

import com.estoqueplan.estoque_plan.dto.VendaDTO;
import com.estoqueplan.estoque_plan.model.enums.StatusVenda;
import com.estoqueplan.estoque_plan.service.VendaService;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.estoqueplan.estoque_plan.service.VendaExportService;
import org.springframework.http.HttpHeaders;

@RestController
@RequestMapping("/vendas")
public class VendaController {

    @Autowired
    private VendaService vendaService;

    @Autowired
    private VendaExportService vendaExportService;

    @PostMapping
    public ResponseEntity<VendaDTO> criarVenda(@RequestBody VendaDTO vendaDTO) {
        VendaDTO novaVenda = vendaService.salvarVenda(vendaDTO);
        return ResponseEntity.ok(novaVenda);
    }

    @GetMapping
    public ResponseEntity<List<VendaDTO>> listarTodasVendas() {
        List<VendaDTO> vendas = vendaService.listarTodasVendas();
        return ResponseEntity.ok(vendas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VendaDTO> buscarVendaPorId(@PathVariable Long id) {
        return vendaService.encontrarVendaPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<Void> cancelarVenda(
            @PathVariable Long id,
            @RequestParam(required = false) String motivo
    ) {
        vendaService.cancelarVenda(id, motivo);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<VendaDTO> atualizarVenda(@PathVariable Long id, @RequestBody VendaDTO vendaDTO) {
        VendaDTO vendaAtualizada = vendaService.atualizarVenda(id, vendaDTO);
        return ResponseEntity.ok(vendaAtualizada);
    }

    @GetMapping("/por-valor")
    public ResponseEntity<List<VendaDTO>> buscarVendasPorValor(
            @RequestParam BigDecimal valorTotal,
            @RequestParam(required = false, defaultValue = "ATIVA") StatusVenda status) {
        List<VendaDTO> vendas = vendaService.encontrarVendasPorValor(status, valorTotal);
        if (vendas.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(vendas);
    }

    @GetMapping("/por-data")
    public ResponseEntity<List<VendaDTO>> buscarVendasPorData(
            @RequestParam String data,
            @RequestParam(required = false, defaultValue = "ATIVA") StatusVenda status
    ) {
        List<VendaDTO> vendas = vendaService.encontrarVendasPorData(status, data);
        if (vendas.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(vendas);
    }

    @GetMapping("/exportar/xlsx")
    public ResponseEntity<byte[]> exportarXlsx() {
        byte[] arquivo = vendaExportService.exportarXlsx();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=vendas.xlsx")
                .header(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .body(arquivo);
    }

    @GetMapping("/exportar/pdf")
    public ResponseEntity<byte[]> exportarPdf() {
        byte[] arquivo = vendaExportService.exportarPdf();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=vendas.pdf")
                .header(HttpHeaders.CONTENT_TYPE, "application/pdf")
                .body(arquivo);
    }
}
