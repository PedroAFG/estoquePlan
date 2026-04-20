package com.estoqueplan.estoque_plan.service;

import com.estoqueplan.estoque_plan.exception.RecursoNaoEncontradoException;
import com.estoqueplan.estoque_plan.exception.RegraNegocioException;
import com.estoqueplan.estoque_plan.model.Cliente;
import com.estoqueplan.estoque_plan.model.PessoaFisica;
import com.estoqueplan.estoque_plan.model.PessoaJuridica;
import com.estoqueplan.estoque_plan.repository.ClienteRepository;
import com.estoqueplan.estoque_plan.repository.VendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ClienteService {
    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private PessoaFisicaService pessoaFisicaService;

    @Autowired
    private PessoaJuridicaService pessoaJuridicaService;

    @Autowired
    private VendaRepository vendaRepository;

    //listar todos os clientes
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

    //método para salvar cliente (delegando para o serviço apropriado)
    public Cliente salvar(Cliente cliente) {
        if (cliente instanceof PessoaFisica) {
            return pessoaFisicaService.salvarPessoaFisica((PessoaFisica) cliente);
        } else if (cliente instanceof PessoaJuridica) {
            return pessoaJuridicaService.salvarPessoaJuridica((PessoaJuridica) cliente);
        }
        throw new IllegalArgumentException("Tipo de cliente desconhecido.");
    }

    public Cliente atualizarCliente(Long id, Cliente clienteAtualizado) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado!"));

        if (clienteAtualizado.getNome() == null || clienteAtualizado.getNome().isBlank()) {
            throw new RuntimeException("Nome não pode ser nulo!");
        }

        if (clienteAtualizado.getTelefone() == null) {
            throw new RuntimeException("Telefone é obrigatório!");
        }

        return clienteRepository.save(cliente);
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

    public void inativarClientePorId(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado!"));

        if (!cliente.isAtivo()) {
            return;
        }

        cliente.setAtivo(false);
        cliente.setInativadoEm(LocalDateTime.now());
        clienteRepository.save(cliente);
    }

    public void ativarClientePorId(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        cliente.setAtivo(true);
        cliente.setInativadoEm(null);
        clienteRepository.save(cliente);
    }

    public void deletar(Long id) {

        if (!clienteRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Cliente não encontrado!");
        }

        boolean temVendaAssociada = vendaRepository.existsByClienteId(id);
        if (temVendaAssociada) {
            throw new RegraNegocioException("Não é possível excluir: existem vendas associadas a este cliente!");
        }

        // Tenta deletar como PessoaFisica, se não achar, tenta como PessoaJuridica
        Optional<PessoaFisica> pessoaFisica = pessoaFisicaService.bucarPessoaFisicaPorId(id);
        if (pessoaFisica.isPresent()) {
            pessoaFisicaService.deletarPessoaFisica(id);
        } else {
            pessoaJuridicaService.deletarPessoaJuridica(id);
        }
    }
}

