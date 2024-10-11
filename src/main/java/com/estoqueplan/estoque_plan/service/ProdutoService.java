package com.estoqueplan.estoque_plan.service;

import com.estoqueplan.estoque_plan.model.Produto;
import com.estoqueplan.estoque_plan.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository produtoRepository;

    public List<Produto> listarTodosProdutos() {
        return produtoRepository.findAll();
    }

    public Produto salvarProduto(Produto produto) {
        return produtoRepository.save(produto);
    }

    public Optional<Produto> encontrarProdutoPorId(Long id) {
        return produtoRepository.findById(id);
    }

    public void deletarProdutoPorId(Long id) {
        produtoRepository.deleteById(id);
    }
}
