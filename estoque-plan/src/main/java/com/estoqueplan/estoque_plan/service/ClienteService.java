package com.estoqueplan.estoque_plan.service;

import com.estoqueplan.estoque_plan.model.Cliente;
import com.estoqueplan.estoque_plan.model.PessoaFisica;
import com.estoqueplan.estoque_plan.model.PessoaJuridica;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ClienteService {

    @Autowired
    private PessoaFisicaService pessoaFisicaService;

    @Autowired
    private PessoaJuridicaService pessoaJuridicaService;

    // Método para listar todos os clientes
    public List<Cliente> listarTodosClientes() {
        // Aqui você poderia mesclar resultados de PessoaFisica e PessoaJuridica
        List<PessoaFisica> pessoasFisicas = pessoaFisicaService.listarTodasPessoasFisicas();
        List<PessoaJuridica> pessoasJuridicas = pessoaJuridicaService.listarTodasPessoasJuridicas();
        
        // Você pode combinar as listas ou tratar como preferir
        List<Cliente> todosClientes = new ArrayList<>();
        todosClientes.addAll(pessoasFisicas);
        todosClientes.addAll(pessoasJuridicas);

        return todosClientes;
    }

    // Método para salvar cliente (delegando para o serviço apropriado)
    public Cliente salvar(Cliente cliente) {
        if (cliente instanceof PessoaFisica) {
            return pessoaFisicaService.salvarPessoaFisica((PessoaFisica) cliente);
        } else if (cliente instanceof PessoaJuridica) {
            return pessoaJuridicaService.salvarPessoaJuridica((PessoaJuridica) cliente);
        }
        throw new IllegalArgumentException("Tipo de cliente desconhecido.");
    }

    public Optional<Cliente> encontrarPorId(Long id) {
        // Primeiro busca por PessoaFisica, depois por PessoaJuridica
        Optional<PessoaFisica> pessoaFisica = pessoaFisicaService.bucarPessoaFisicaPorId(id);
        if (pessoaFisica.isPresent()) {
            return Optional.of(pessoaFisica.get());
        }
        
        Optional<PessoaJuridica> pessoaJuridica = pessoaJuridicaService.bucarPessoaJuridicaPorId(id);
        return pessoaJuridica.map(Cliente.class::cast);
    }

    public void deletar(Long id) {
        // Tenta deletar como PessoaFisica, se não achar, tenta como PessoaJuridica
        Optional<PessoaFisica> pessoaFisica = pessoaFisicaService.bucarPessoaFisicaPorId(id);
        if (pessoaFisica.isPresent()) {
            pessoaFisicaService.deletarPessoaFisica(id);
        } else {
            pessoaJuridicaService.deletarPessoaJuridica(id);
        }
    }
}

