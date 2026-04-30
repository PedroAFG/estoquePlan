package com.estoqueplan.estoque_plan.financeiro.service;

import com.estoqueplan.estoque_plan.exception.RecursoNaoEncontradoException;
import com.estoqueplan.estoque_plan.exception.RegraNegocioException;
import com.estoqueplan.estoque_plan.financeiro.model.CategoriaFinanceira;
import com.estoqueplan.estoque_plan.financeiro.repository.CategoriaFinanceiraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CategoriaFinanceiraService {

    @Autowired
    private CategoriaFinanceiraRepository categoriaFinanceiraRepository;

    public CategoriaFinanceira salvarCategoriaFinanceira(CategoriaFinanceira categoriaFinanceira) {
        return categoriaFinanceiraRepository.save(categoriaFinanceira);
    }

    public List<CategoriaFinanceira> listarCategoriasFinanceiras(Boolean incluirInativos) {
        if (Boolean.TRUE.equals(incluirInativos)) {
            return categoriaFinanceiraRepository.findAll();
        }
        return categoriaFinanceiraRepository.findByAtivoTrue();

    }

    public CategoriaFinanceira atualizarCategoriaFinanceira(Long id, CategoriaFinanceira categoriaFinAtualizada) {
        CategoriaFinanceira categoriaFinanceira = categoriaFinanceiraRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria não encontrada!"));

        if (categoriaFinAtualizada.getNome() == null || categoriaFinAtualizada.getNome().isBlank()) {
            throw new RegraNegocioException("Nome não pode ser vazio!");
        }
        if (categoriaFinAtualizada.getTipo() == null) {
            throw new RegraNegocioException("Tipo é obrigatório!");
        }

        categoriaFinanceira.setNome(categoriaFinAtualizada.getNome().trim());
        categoriaFinanceira.setTipo(categoriaFinAtualizada.getTipo());

        return categoriaFinanceiraRepository.save(categoriaFinanceira);
    }

    public void inativarCategoriaFinanceira(Long id) {
        CategoriaFinanceira categoriaFinanceira = categoriaFinanceiraRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria não encontrada!"));

        if (!categoriaFinanceira.isAtivo()) {
            return;
        }

        categoriaFinanceira.setAtivo(false);
        categoriaFinanceira.setInativadoEm(LocalDateTime.now());
        categoriaFinanceiraRepository.save(categoriaFinanceira);
    }

    public void ativarCategoriaFinanceiraPorId(Long id) {
        CategoriaFinanceira categoriaFinanceira = categoriaFinanceiraRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria não encontrada"));

        categoriaFinanceira.setAtivo(true);
        categoriaFinanceira.setInativadoEm(null);
        categoriaFinanceiraRepository.save(categoriaFinanceira);
    }

}
