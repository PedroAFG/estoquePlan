package com.estoqueplan.estoque_plan.service;

import com.estoqueplan.estoque_plan.dto.ViaCepDTO;
import com.estoqueplan.estoque_plan.exception.RegraNegocioException;
import com.estoqueplan.estoque_plan.model.Cep;
import com.estoqueplan.estoque_plan.model.Cidade;
import com.estoqueplan.estoque_plan.model.Estado;
import com.estoqueplan.estoque_plan.model.Pais;
import com.estoqueplan.estoque_plan.repository.CepRepository;
import com.estoqueplan.estoque_plan.repository.CidadeRepository;
import com.estoqueplan.estoque_plan.repository.EstadoRepository;
import com.estoqueplan.estoque_plan.repository.PaisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CepService {

    @Autowired
    private CepRepository cepRepository;

    @Autowired
    private CidadeRepository cidadeRepository;

    @Autowired
    private EstadoRepository estadoRepository;

    @Autowired
    private PaisRepository paisRepository;

    @Autowired
    private ViaCepService viaCepService;

    public Cep buscarOuCriarPorCodigo(String codigoCep) {
        if (codigoCep == null || codigoCep.isBlank()) {
            throw new RegraNegocioException("CEP é obrigatório.");
        }

        String codigoLimpo = codigoCep.replaceAll("\\D", "");

        if (codigoLimpo.length() != 8) {
            throw new RegraNegocioException("CEP inválido.");
        }

        Optional<Cep> cepExistente = cepRepository.findByCodigo(codigoLimpo);

        if (cepExistente.isPresent()) {
            return cepExistente.get();
        }

        ViaCepDTO viaCep = viaCepService.buscarEnderecoPorCep(codigoLimpo);

        Pais pais = paisRepository.findBySigla("BR")
                .orElseGet(() -> {
                    Pais novoPais = new Pais();
                    novoPais.setNome("Brasil");
                    novoPais.setSigla("BR");
                    return paisRepository.save(novoPais);
                });

        Estado estado = estadoRepository.findByUf(viaCep.getUf())
                .orElseGet(() -> {
                    Estado novoEstado = new Estado();
                    novoEstado.setNome(viaCep.getUf());
                    novoEstado.setUf(viaCep.getUf());
                    novoEstado.setPais(pais);
                    return estadoRepository.save(novoEstado);
                });

        Cidade cidade = cidadeRepository
                .findByNomeAndEstadoId(viaCep.getLocalidade(), estado.getId())
                .orElseGet(() -> {
                    Cidade novaCidade = new Cidade();
                    novaCidade.setNome(viaCep.getLocalidade());
                    novaCidade.setEstado(estado);
                    return cidadeRepository.save(novaCidade);
                });

        Cep novoCep = new Cep();
        novoCep.setCodigo(codigoLimpo);
        novoCep.setLogradouro(viaCep.getLogradouro());
        novoCep.setBairro(viaCep.getBairro());
        novoCep.setComplemento(viaCep.getComplemento());
        novoCep.setCidade(cidade);

        return cepRepository.save(novoCep);
    }
}