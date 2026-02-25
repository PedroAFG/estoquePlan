package com.estoqueplan.estoque_plan.financeiro.controller;

import com.estoqueplan.estoque_plan.financeiro.dto.BaixaParcelaDTO;
import com.estoqueplan.estoque_plan.financeiro.model.ParcelaFinanceira;
import com.estoqueplan.estoque_plan.financeiro.service.ParcelaFinanceiraService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/financeiro/parcelas")
public class ParcelaFinanceiraController {

    @Autowired
    private ParcelaFinanceiraService parcelaFinanceiraService;

    @PostMapping("/{id}/baixar")
    public ResponseEntity<ParcelaFinanceira> baixar(@PathVariable Long id,
                                                    @RequestBody(required = false) BaixaParcelaDTO dto) {
        return ResponseEntity.ok(parcelaFinanceiraService.baixarParcela(id, dto));
    }
}
