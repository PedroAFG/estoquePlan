package com.estoqueplan.estoque_plan.controller;

import com.estoqueplan.estoque_plan.model.Venda;
import com.estoqueplan.estoque_plan.service.VendaService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/vendas")
public class VendaController {

    @Autowired
    private VendaService vendaService;

    //Criação de uma venda
    @PostMapping
    public ResponseEntity<Venda> criarVenda(@RequestBody Venda venda) {
        Venda novaVenda = vendaService.salvarVenda(venda);
        return ResponseEntity.ok(novaVenda);
    }

    //Listar todas as vendas
    @GetMapping
    public ResponseEntity<List<Venda>> listarTodasVendas() {
        List<Venda> vendas = vendaService.listarTodasVendas();
        return ResponseEntity.ok(vendas);
    }

    //Buscar venda por ID
    @GetMapping("/{id}")
    public ResponseEntity<Venda> buscarVendaPorId(@PathVariable Long id) {
        return vendaService.encontrarVendaPorId(id)
                .map(venda -> ResponseEntity.ok(venda))
                .orElse(ResponseEntity.notFound().build());
    }

    //Buscar venda por valor
    @GetMapping("/{valor}")
    public ResponseEntity<List<Venda>> buscarVendasPorValor(@RequestParam BigDecimal valorTotal) {
        List<Venda> vendas = vendaService.encontrarVendaPorValor(valorTotal);
        if (vendas.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(vendas);
    }

    //Buscar venda por valor
    @GetMapping("/{data}")
    public ResponseEntity<List<Venda>> buscarVendasPorData(@RequestParam LocalDateTime dataDaVenda) {
        List<Venda> vendas = vendaService.encontrarVendaPorData(dataDaVenda);
        if (vendas.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(vendas);
    }

    //Deletar venda por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarVenda(@PathVariable Long id) {
        vendaService.deletarVendaPorId(id);
        return ResponseEntity.noContent().build();
    }


}