package com.estoqueplan.estoque_plan.controller;

import com.estoqueplan.estoque_plan.dto.ViaCepDTO;
import com.estoqueplan.estoque_plan.service.ViaCepService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/enderecos")
public class EnderecoController {

    @Autowired
    private ViaCepService viaCepService;

    @GetMapping("/cep/{cep}")
    public ViaCepDTO buscarPorCep(@PathVariable String cep) {
        return viaCepService.buscarEnderecoPorCep(cep);
    }
}