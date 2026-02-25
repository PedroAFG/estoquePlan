package com.estoqueplan.estoque_plan.financeiro.service;

import com.estoqueplan.estoque_plan.financeiro.model.CategoriaFinanceira;
import com.estoqueplan.estoque_plan.financeiro.repository.CategoriaFinanceiraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoriaFinanceiraService {

    @Autowired
    private CategoriaFinanceiraRepository categoriaFinanceiraRepository;

    public CategoriaFinanceira salvarCategoriaFinanceira(CategoriaFinanceira categoriaFinanceira) {
        return categoriaFinanceiraRepository.save(categoriaFinanceira);
    }

    public List<CategoriaFinanceira> listarCategoriasFinanceiras() {
        return categoriaFinanceiraRepository.findAll();
    }


}
