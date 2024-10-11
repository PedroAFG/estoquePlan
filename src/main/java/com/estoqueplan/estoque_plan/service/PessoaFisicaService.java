package com.estoqueplan.estoque_plan.service;

import com.estoqueplan.estoque_plan.model.PessoaFisica;
import com.estoqueplan.estoque_plan.repository.PessoaFisicaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PessoaFisicaService {

    @Autowired
    private PessoaFisicaRepository pessoaFisicaRepository;

    public List<PessoaFisica> listarTodasPessoasFisicas() {
        return pessoaFisicaRepository.findAll();
    }

    public Optional<PessoaFisica> bucarPessoaFisicaPorId(Long id) {
        return pessoaFisicaRepository.findById(id);
    }

    public Optional<PessoaFisica> buscarPessoaFisicaPorCpf(String cpf) {
        return pessoaFisicaRepository.findByCpf(cpf);
    }

    public PessoaFisica salvarPessoaFisica(PessoaFisica pessoaFisica) {
        return pessoaFisicaRepository.save(pessoaFisica);
    }

    public void deletarPessoaFisica(Long id) {
        pessoaFisicaRepository.deleteById(id);
    }
}

