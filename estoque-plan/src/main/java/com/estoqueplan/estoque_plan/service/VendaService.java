package com.estoqueplan.estoque_plan.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import com.estoqueplan.estoque_plan.repository.VendaRepository;
import com.estoqueplan.estoque_plan.model.Venda;


public class VendaService {

    @Autowired
    private VendaRepository vendaRepository;

    public List<Venda> listarTodasVendas() {
        return vendaRepository.findAll();
    }
    
    public Venda salvarVenda (Venda venda) {
        return vendaRepository.save(venda);
    }

    public Optional<Venda> encontrarVendaPorId (Long id) {
        return vendaRepository.findById(id);
    }

    public void deletarVendaPorId(Long id) {
        vendaRepository.deleteById(id);
    }

    public List<Venda> encontrarVendaPorValor (BigDecimal valorTotal) {
        return vendaRepository.findByValorTotal(valorTotal);
    }

    public List<Venda> encontrarVendaPorData (LocalDateTime dataDaVenda) {
        return vendaRepository.findByData(dataDaVenda);
    }

}
