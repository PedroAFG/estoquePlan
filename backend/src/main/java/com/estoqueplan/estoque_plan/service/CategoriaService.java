package com.estoqueplan.estoque_plan.service;

import com.estoqueplan.estoque_plan.exception.RecursoNaoEncontradoException;
import com.estoqueplan.estoque_plan.exception.RegraNegocioException;
import com.estoqueplan.estoque_plan.model.Categoria;
import com.estoqueplan.estoque_plan.repository.CategoriaRepository;
import com.estoqueplan.estoque_plan.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CategoriaService {
    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    public Categoria salvarCategoria(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    public List<Categoria> listarCategorias(Boolean incluirInativos) {
        if (Boolean.TRUE.equals(incluirInativos)) {
            return categoriaRepository.findAll();
        }
        return categoriaRepository.findByAtivoTrue();
    }

    public Optional<Categoria> buscarPorId(Long id) {
        return categoriaRepository.findById(id);
    }

    public Categoria atualizarCategoria(Long id, Categoria categoriaAtualizada) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria não encontrada!"));

        // atualiza somente o que você permite editar
        if (categoriaAtualizada.getNome() != null && !categoriaAtualizada.getNome().isBlank()) {
            categoria.setNome(categoriaAtualizada.getNome().trim());
        } else {
            throw new RegraNegocioException("Nome da categoria é obrigatório");
        }

        return categoriaRepository.save(categoria);
    }

    public void inativarCategoriaPorId(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria não encontrada!"));

        if (!categoria.isAtivo()) {
            return;
        }

        categoria.setAtivo(false);
        categoria.setInativadoEm(LocalDateTime.now());
        categoriaRepository.save(categoria);
    }

    public void ativarCategoriaPorId(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria não encontrada!"));

        categoria.setAtivo(true);
        categoria.setInativadoEm(null);
        categoriaRepository.save(categoria);
    }

    public void deletarCategoria(Long id) {
        if (!categoriaRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Categoria não encontrada!");
        }

        boolean temProdutoAssoaciado = produtoRepository.existsByCategoriaId(id);
        if (temProdutoAssoaciado) {
            throw new RegraNegocioException("Não é possível excluir: existem produtos vinculados a esta categoria!");
        }

        categoriaRepository.deleteById(id);
    }
}
