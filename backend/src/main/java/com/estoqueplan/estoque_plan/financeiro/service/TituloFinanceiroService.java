package com.estoqueplan.estoque_plan.financeiro.service;

import com.estoqueplan.estoque_plan.financeiro.dto.TituloFinanceiroCreateDTO;
import com.estoqueplan.estoque_plan.financeiro.dto.TituloFinanceiroResponseDTO;
import com.estoqueplan.estoque_plan.financeiro.model.CategoriaFinanceira;
import com.estoqueplan.estoque_plan.financeiro.model.FormaPagamento;
import com.estoqueplan.estoque_plan.financeiro.model.ParcelaFinanceira;
import com.estoqueplan.estoque_plan.financeiro.model.TituloFinanceiro;
import com.estoqueplan.estoque_plan.financeiro.model.enums.StatusTitulo;
import com.estoqueplan.estoque_plan.financeiro.repository.CategoriaFinanceiraRepository;
import com.estoqueplan.estoque_plan.financeiro.repository.FormaPagamentoRepository;
import com.estoqueplan.estoque_plan.financeiro.repository.TituloFinanceiroRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class TituloFinanceiroService {

    private final TituloFinanceiroRepository tituloRepo;
    private final CategoriaFinanceiraRepository categoriaRepo;
    private final FormaPagamentoRepository formaRepo;

    public TituloFinanceiroService(TituloFinanceiroRepository tituloRepo,
                                   CategoriaFinanceiraRepository categoriaRepo,
                                   FormaPagamentoRepository formaRepo) {
        this.tituloRepo = tituloRepo;
        this.categoriaRepo = categoriaRepo;
        this.formaRepo = formaRepo;
    }

    @Transactional
    public TituloFinanceiroResponseDTO criarTitulo(TituloFinanceiroCreateDTO dto) {
        validarCreate(dto);

        CategoriaFinanceira cat = categoriaRepo.findById(dto.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("CategoriaFinanceira não encontrada: " + dto.getCategoriaId()));

        FormaPagamento forma = formaRepo.findById(dto.getFormaPagamentoId())
                .orElseThrow(() -> new RuntimeException("FormaPagamento não encontrada: " + dto.getFormaPagamentoId()));

        TituloFinanceiro titulo = new TituloFinanceiro();
        titulo.setTipo(dto.getTipo());
        titulo.setDescricao(dto.getDescricao());
        titulo.setValorTotal(dto.getValorTotal());
        titulo.setCategoria(cat);
        titulo.setStatus(StatusTitulo.PENDENTE);
        titulo.setDataEmissao(dto.getDataEmissao() != null ? dto.getDataEmissao() : LocalDateTime.now());

        // Gera parcelas
        int n = dto.getNumeroParcelas();
        int intervalo = (dto.getIntervaloDias() != null && dto.getIntervaloDias() > 0) ? dto.getIntervaloDias() : 30;
        LocalDate vencIni = dto.getPrimeiroVencimento();

        List<ParcelaFinanceira> parcelas = gerarParcelas(titulo, forma, dto.getValorTotal(), n, vencIni, intervalo);
        titulo.setParcelas(parcelas);

        TituloFinanceiro salvo = tituloRepo.save(titulo);
        return mapToResponse(salvo);
    }

    public List<TituloFinanceiroResponseDTO> listarTodos() {
        return tituloRepo.findAll().stream().map(this::mapToResponse).toList();
    }

    public TituloFinanceiroResponseDTO buscarPorId(Long id) {
        TituloFinanceiro t = tituloRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Título não encontrado: " + id));
        return mapToResponse(t);
    }

    private void validarCreate(TituloFinanceiroCreateDTO dto) {
        if (dto == null) throw new RuntimeException("Body não pode ser vazio.");
        if (dto.getTipo() == null) throw new RuntimeException("Tipo (A_PAGAR/A_RECEBER) é obrigatório.");
        if (dto.getDescricao() == null || dto.getDescricao().isBlank()) throw new RuntimeException("Descrição é obrigatória.");
        if (dto.getCategoriaId() == null) throw new RuntimeException("categoriaId é obrigatório.");
        if (dto.getFormaPagamentoId() == null) throw new RuntimeException("formaPagamentoId é obrigatório.");
        if (dto.getValorTotal() == null || dto.getValorTotal().compareTo(BigDecimal.ZERO) <= 0)
            throw new RuntimeException("valorTotal deve ser maior que zero.");
        if (dto.getNumeroParcelas() == null || dto.getNumeroParcelas() <= 0)
            throw new RuntimeException("numeroParcelas deve ser >= 1.");
        if (dto.getPrimeiroVencimento() == null)
            throw new RuntimeException("primeiroVencimento é obrigatório.");
    }

    private List<ParcelaFinanceira> gerarParcelas(TituloFinanceiro titulo, FormaPagamento forma,
                                                  BigDecimal total, int n, LocalDate primeiroVenc,
                                                  int intervaloDias) {
        List<ParcelaFinanceira> lista = new ArrayList<>();

        // valor base arredondado
        BigDecimal base = total.divide(BigDecimal.valueOf(n), 2, RoundingMode.DOWN);
        BigDecimal soma = BigDecimal.ZERO;

        for (int i = 1; i <= n; i++) {
            ParcelaFinanceira p = new ParcelaFinanceira();
            p.setNumero(i);
            p.setStatus(StatusTitulo.PENDENTE);
            p.setFormaPagamento(forma);
            p.setTituloFinanceiro(titulo);
            p.setVencimento(primeiroVenc.plusDays((long) (i - 1) * intervaloDias));

            // última parcela recebe ajuste de centavos
            if (i < n) {
                p.setValor(base);
                soma = soma.add(base);
            } else {
                p.setValor(total.subtract(soma)); // fecha exatamente o total
            }

            lista.add(p);
        }
        return lista;
    }

    private TituloFinanceiroResponseDTO mapToResponse(TituloFinanceiro t) {
        TituloFinanceiroResponseDTO dto = new TituloFinanceiroResponseDTO();
        dto.setId(t.getId());
        dto.setTipo(t.getTipo());
        dto.setDescricao(t.getDescricao());
        dto.setValorTotal(t.getValorTotal());
        dto.setDataEmissao(t.getDataEmissao());
        dto.setStatus(t.getStatus());

        if (t.getCategoria() != null) {
            dto.setCategoriaId(t.getCategoria().getId());
            dto.setCategoriaNome(t.getCategoria().getNome());
        }

        if (t.getParcelas() != null) {
            List<TituloFinanceiroResponseDTO.ParcelaResumoDTO> ps = new ArrayList<>();
            for (ParcelaFinanceira p : t.getParcelas()) {
                TituloFinanceiroResponseDTO.ParcelaResumoDTO pr = new TituloFinanceiroResponseDTO.ParcelaResumoDTO();
                pr.setId(p.getId());
                pr.setNumero(p.getNumero());
                pr.setValor(p.getValor());
                pr.setVencimento(p.getVencimento());
                pr.setStatus(p.getStatus());
                pr.setDataBaixa(p.getDataBaixa());
                pr.setFormaPagamentoId(p.getFormaPagamento() != null ? p.getFormaPagamento().getId() : null);
                ps.add(pr);
            }
            dto.setParcelas(ps);
        }

        return dto;
    }
}