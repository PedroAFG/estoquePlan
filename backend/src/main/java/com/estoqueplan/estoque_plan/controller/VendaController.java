package com.estoqueplan.estoque_plan.controller;

import com.estoqueplan.estoque_plan.dto.VendaDTO;
import com.estoqueplan.estoque_plan.service.VendaService;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/vendas")
public class VendaController {

    @Autowired
    private VendaService vendaService;

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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarVenda(@PathVariable Long id) {
        vendaService.deletarVendaPorId(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/por-valor")
    public ResponseEntity<List<VendaDTO>> buscarVendasPorValor(
            @RequestParam BigDecimal valorTotal) {
        List<VendaDTO> vendas = vendaService.encontrarVendasPorValor(valorTotal);
        if (vendas.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(vendas);
    }

    @GetMapping("/por-data")
    public ResponseEntity<List<VendaDTO>> buscarVendasPorData(
            @RequestParam String data) { // Pode ser "2024-07-07"
        List<VendaDTO> vendas = vendaService.encontrarVendasPorData(data);
        if (vendas.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(vendas);
    }
}
