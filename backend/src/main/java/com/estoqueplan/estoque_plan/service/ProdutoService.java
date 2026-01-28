package com.estoqueplan.estoque_plan.service;

import com.estoqueplan.estoque_plan.dto.ProdutoDTO;
import com.estoqueplan.estoque_plan.model.Categoria;
import com.estoqueplan.estoque_plan.model.Produto;
import com.estoqueplan.estoque_plan.repository.CategoriaRepository;
import com.estoqueplan.estoque_plan.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProdutoService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    public List<Produto> listarProdutos(Boolean incluirInativos) {
        if (Boolean.TRUE.equals(incluirInativos)) {
            return produtoRepository.findAll();
        }
        return produtoRepository.findByAtivoTrue();
    }

    public Produto salvarProduto(ProdutoDTO dto) {
        Produto produto = new Produto();
        produto.setDescricao(dto.getDescricao());
        produto.setQuantidadeDisponivel(dto.getQuantidadeDisponivel());
        produto.setUnidade(dto.getUnidade());
        produto.setCusto(dto.getCusto());
        produto.setPrecoVarejo(dto.getPrecoVarejo());
        produto.setNcm(dto.getNcm());
        produto.setIdSebrae(dto.getIdSebrae());

        //Busca e associa a categoria pelo ID recebido no DTO
        if (dto.getCategoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                    .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
            produto.setCategoria(categoria);
        } else {
            produto.setCategoria(null);
        }

        return produtoRepository.save(produto);
    }

    public Optional<Produto> encontrarProdutoPorId(Long id) {
        return produtoRepository.findById(id);
    }

    public void inativarProdutoPorId(Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado!"));

        if (!produto.isAtivo()) {
            return;
        }

        produto.setAtivo(false);
        produto.setInativadoEm(LocalDateTime.now());
        produtoRepository.save(produto);
    }

    public void ativarProdutoPorId(Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        produto.setAtivo(true);
        produtoRepository.save(produto);
    }

}
