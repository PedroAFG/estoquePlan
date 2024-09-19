package com.estoqueplan.estoque_plan.service;

import com.estoqueplan.estoque_plan.model.PessoaJuridica;
import com.estoqueplan.estoque_plan.repository.PessoaJuridicaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PessoaJuridicaService {

    @Autowired
    private PessoaJuridicaRepository pessoaJuridicaRepository;

     public List<PessoaJuridica> listarTodasPessoasJuridicas() {
        return pessoaJuridicaRepository.findAll();
    }

    public Optional<PessoaJuridica> bucarPessoaJuridicaPorId(Long id) {
        return pessoaJuridicaRepository.findById(id);
    }

    public Optional<PessoaJuridica> buscarPessoaJuridicaPorCnpj(String cnpj) {
        return pessoaJuridicaRepository.findByCnpj(cnpj);
    }

    public PessoaJuridica salvarPessoaJuridica(PessoaJuridica pessoaJuridica) {
        return pessoaJuridicaRepository.save(pessoaJuridica);
    }

    public void deletarPessoaJuridica(Long id) {
        pessoaJuridicaRepository.deleteById(id);
    }
}