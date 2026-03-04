package com.estoqueplan.estoque_plan.service;

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

    public void inativarCategoriaPorId(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada!"));

        if (!categoria.isAtivo()) {
            return;
        }

        categoria.setAtivo(false);
        categoria.setInativadoEm(LocalDateTime.now());
        categoriaRepository.save(categoria);
    }

    public void deletarCategoria(Long id) {
        if (!categoriaRepository.existsById(id)) {
            throw new RuntimeException("Categoria não encontrada!");
        }

        boolean temProdutoAssoaciado = produtoRepository.existsByCategoriaId(id);
        if (temProdutoAssoaciado) {
            throw new RuntimeException("Não é possível excluir: existem produtos vinculados a esta categoria!");
        }

        categoriaRepository.deleteById(id);
    }
}
