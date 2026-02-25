package com.estoqueplan.estoque_plan.financeiro.controller;

import com.estoqueplan.estoque_plan.financeiro.dto.TituloFinanceiroCreateDTO;
import com.estoqueplan.estoque_plan.financeiro.dto.TituloFinanceiroResponseDTO;
import com.estoqueplan.estoque_plan.financeiro.service.TituloFinanceiroService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/financeiro/titulos")
public class TituloFinanceiroController {

    private final TituloFinanceiroService service;

    public TituloFinanceiroController(TituloFinanceiroService service) {
        this.service = service;
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
}