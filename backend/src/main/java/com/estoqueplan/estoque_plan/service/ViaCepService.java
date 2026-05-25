package com.estoqueplan.estoque_plan.service;

import com.estoqueplan.estoque_plan.dto.ViaCepDTO;
import com.estoqueplan.estoque_plan.exception.RecursoNaoEncontradoException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ViaCepService {

    public ViaCepDTO buscarEnderecoPorCep(String cep) {
        String url = "https://viacep.com.br/ws/" + cep + "/json/";

        RestTemplate restTemplate = new RestTemplate();
        ViaCepDTO endereco = restTemplate.getForObject(url, ViaCepDTO.class);

        if (endereco == null || Boolean.TRUE.equals(endereco.getErro())) {
            throw new RecursoNaoEncontradoException("CEP não encontrado.");
        }

        return endereco;
    }
}