package com.estoqueplan.estoque_plan.financeiro.service;

import com.estoqueplan.estoque_plan.financeiro.model.FormaPagamento;
import com.estoqueplan.estoque_plan.financeiro.repository.FormaPagamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FormaPagamentoService {

    @Autowired
    private FormaPagamentoRepository formaPagamentoRepository;

    public FormaPagamento salvarFormaPagamento(FormaPagamento formaPagamento) {
        return formaPagamentoRepository.save(formaPagamento);
    }

    public List<FormaPagamento> listarFormasPagamento(Boolean incluirInativos) {
        if (Boolean.TRUE.equals(incluirInativos)) {
            return formaPagamentoRepository.findAll();
        }
        return formaPagamentoRepository.findByAtivoTrue();
    }

    public FormaPagamento atualizarFormaPagamento(Long id, FormaPagamento formaPagamentoAtualizada) {
        FormaPagamento formaPagamento = formaPagamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Forma de pagamento não encontrada!"));

        if (formaPagamentoAtualizada.getTipo() == null) {
            throw new RuntimeException("Tipo é obrigatório!");
        }
        if (formaPagamentoAtualizada.getTaxaPercentual() == null) {
            throw new RuntimeException("Taxa é obrigatória!");
        }
        if (formaPagamentoAtualizada.getPrazoDiasRepasse() == null) {
            throw new RuntimeException("Prazo é obrigatório!");
        }

        formaPagamento.setTipo(formaPagamentoAtualizada.getTipo());
        formaPagamento.setTaxaPercentual(formaPagamentoAtualizada.getTaxaPercentual());
        formaPagamento.setPrazoDiasRepasse((formaPagamentoAtualizada.getPrazoDiasRepasse()));

        return formaPagamentoRepository.save(formaPagamento);
    }

    public void inativarFormaPagamento(Long id) {
        FormaPagamento formaPagamento = formaPagamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Forma de pagamento não encontrada!"));

        if (!formaPagamento.isAtivo()) {
            return;
        }
        formaPagamento.setAtivo(false);
        formaPagamento.setInativadoEm(LocalDateTime.now());
        formaPagamentoRepository.save(formaPagamento);
    }

    public void ativarFormaPagamento(Long id) {
        FormaPagamento formaPagamento = formaPagamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Forma de pagamento não encontrada"));

        formaPagamento.setAtivo(true);
        formaPagamento.setInativadoEm(null);
        formaPagamentoRepository.save(formaPagamento);
    }

}
