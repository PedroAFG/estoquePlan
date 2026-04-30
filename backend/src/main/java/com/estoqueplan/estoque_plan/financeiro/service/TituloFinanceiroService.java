package com.estoqueplan.estoque_plan.financeiro.service;

import com.estoqueplan.estoque_plan.exception.RecursoNaoEncontradoException;
import com.estoqueplan.estoque_plan.exception.RegraNegocioException;
import com.estoqueplan.estoque_plan.financeiro.dto.TituloFinanceiroCreateDTO;
import com.estoqueplan.estoque_plan.financeiro.dto.TituloFinanceiroResponseDTO;
import com.estoqueplan.estoque_plan.financeiro.model.CategoriaFinanceira;
import com.estoqueplan.estoque_plan.financeiro.model.FormaPagamento;
import com.estoqueplan.estoque_plan.financeiro.model.ParcelaFinanceira;
import com.estoqueplan.estoque_plan.financeiro.model.TituloFinanceiro;
import com.estoqueplan.estoque_plan.financeiro.model.enums.StatusTitulo;
import com.estoqueplan.estoque_plan.financeiro.model.enums.TipoTitulo;
import com.estoqueplan.estoque_plan.financeiro.repository.CategoriaFinanceiraRepository;
import com.estoqueplan.estoque_plan.financeiro.repository.FormaPagamentoRepository;
import com.estoqueplan.estoque_plan.financeiro.repository.TituloFinanceiroRepository;
import com.estoqueplan.estoque_plan.model.Venda;
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

        CategoriaFinanceira cat = categoriaRepo.findByIdAndAtivoTrue(dto.getCategoriaId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria não encontrada ou inativa."));

        FormaPagamento forma = formaRepo.findByIdAndAtivoTrue(dto.getFormaPagamentoId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("FormaPagamento não encontrada ou inativa: " + dto.getFormaPagamentoId()));

        TituloFinanceiro titulo = new TituloFinanceiro();
        titulo.setTipo(dto.getTipo());
        titulo.setDescricao(dto.getDescricao());
        titulo.setValorTotal(dto.getValorTotal());
        titulo.setCategoria(cat);
        titulo.setStatus(StatusTitulo.PENDENTE);
        titulo.setDataEmissao(dto.getDataEmissao() != null ? dto.getDataEmissao() : LocalDateTime.now());

        int n = dto.getNumeroParcelas();
        int intervalo = (dto.getIntervaloDias() != null && dto.getIntervaloDias() > 0) ? dto.getIntervaloDias() : 30;
        LocalDate vencIni = dto.getPrimeiroVencimento();

        List<ParcelaFinanceira> parcelas = gerarParcelas(titulo, forma, dto.getValorTotal(), n, vencIni, intervalo);
        titulo.setParcelas(parcelas);

        TituloFinanceiro salvo = tituloRepo.save(titulo);
        return mapToResponse(salvo);
    }

    @Transactional
    public TituloFinanceiro criarTituloPorVenda(Venda venda,
                                                Long categoriaId,
                                                Long formaPagamentoId,
                                                Integer numeroParcelas,
                                                LocalDate primeiroVencimento,
                                                Integer intervaloDias,
                                                String descricaoTitulo) {

        if (venda == null) {
            throw new RegraNegocioException("Venda não pode ser nula.");
        }

        if (venda.getId() == null) {
            throw new RegraNegocioException("A venda precisa estar salva antes de gerar o título.");
        }

        if (venda.getValorTotal() == null || venda.getValorTotal().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RegraNegocioException("Venda com valor total inválido para geração do título.");
        }

        if (categoriaId == null) {
            throw new RegraNegocioException("categoriaFinanceiraId é obrigatório para gerar título da venda.");
        }

        if (formaPagamentoId == null) {
            throw new RegraNegocioException("formaPagamentoId é obrigatório para gerar título da venda.");
        }

        CategoriaFinanceira categoria = categoriaRepo.findByIdAndAtivoTrue(categoriaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria financeira não encontrada ou inativa."));

        FormaPagamento formaPagamento = formaRepo.findByIdAndAtivoTrue(formaPagamentoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Forma de pagamento não encontrada ou inativa."));

        int quantidadeParcelas = (numeroParcelas != null && numeroParcelas > 0) ? numeroParcelas : 1;
        int intervalo = (intervaloDias != null && intervaloDias > 0) ? intervaloDias : 30;
        LocalDate vencimentoInicial = (primeiroVencimento != null) ? primeiroVencimento : LocalDate.now();

        TituloFinanceiro titulo = new TituloFinanceiro();
        titulo.setTipo(TipoTitulo.A_RECEBER);
        titulo.setDescricao(
                (descricaoTitulo != null && !descricaoTitulo.isBlank())
                        ? descricaoTitulo.trim()
                        : "Venda #" + venda.getId()
        );
        titulo.setValorTotal(venda.getValorTotal());
        titulo.setDataEmissao(LocalDateTime.now());
        titulo.setStatus(StatusTitulo.PENDENTE);
        titulo.setCategoria(categoria);
        titulo.setVenda(venda);

        List<ParcelaFinanceira> parcelas = gerarParcelas(
                titulo,
                formaPagamento,
                venda.getValorTotal(),
                quantidadeParcelas,
                vencimentoInicial,
                intervalo
        );

        titulo.setParcelas(parcelas);

        return tituloRepo.save(titulo);
    }

    public List<TituloFinanceiroResponseDTO> listarTodos() {
        return tituloRepo.findAll().stream().map(this::mapToResponse).toList();
    }

    public TituloFinanceiroResponseDTO buscarPorId(Long id) {
        TituloFinanceiro t = tituloRepo.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Título não encontrado: " + id));
        return mapToResponse(t);
    }

    private void validarCreate(TituloFinanceiroCreateDTO dto) {
        if (dto == null) throw new RegraNegocioException("Body não pode ser vazio.");
        if (dto.getTipo() == null) throw new RegraNegocioException("Tipo (A_PAGAR/A_RECEBER) é obrigatório.");
        if (dto.getDescricao() == null || dto.getDescricao().isBlank()) throw new RegraNegocioException("Descrição é obrigatória.");
        if (dto.getCategoriaId() == null) throw new RegraNegocioException("categoriaId é obrigatório.");
        if (dto.getFormaPagamentoId() == null) throw new RegraNegocioException("formaPagamentoId é obrigatório.");
        if (dto.getValorTotal() == null || dto.getValorTotal().compareTo(BigDecimal.ZERO) <= 0)
            throw new RegraNegocioException("valorTotal deve ser maior que zero.");
        if (dto.getNumeroParcelas() == null || dto.getNumeroParcelas() <= 0)
            throw new RegraNegocioException("numeroParcelas deve ser >= 1.");
        if (dto.getPrimeiroVencimento() == null)
            throw new RegraNegocioException("primeiroVencimento é obrigatório.");
    }

    private List<ParcelaFinanceira> gerarParcelas(TituloFinanceiro titulo, FormaPagamento forma,
                                                  BigDecimal total, int n, LocalDate primeiroVenc,
                                                  int intervaloDias) {
        List<ParcelaFinanceira> lista = new ArrayList<>();

        BigDecimal base = total.divide(BigDecimal.valueOf(n), 2, RoundingMode.DOWN);
        BigDecimal soma = BigDecimal.ZERO;

        for (int i = 1; i <= n; i++) {
            ParcelaFinanceira p = new ParcelaFinanceira();
            p.setNumero(i);
            p.setStatus(StatusTitulo.PENDENTE);
            p.setFormaPagamento(forma);
            p.setTituloFinanceiro(titulo);
            p.setVencimento(primeiroVenc.plusDays((long) (i - 1) * intervaloDias));

            if (i < n) {
                p.setValor(base);
                soma = soma.add(base);
            } else {
                p.setValor(total.subtract(soma));
            }

            lista.add(p);
        }
        return lista;
    }

    @Transactional
    public TituloFinanceiroResponseDTO cancelarTitulo(Long id) {
        TituloFinanceiro titulo = tituloRepo.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Título não encontrado: " + id));

        if (titulo.getStatus() == StatusTitulo.CANCELADO) {
            return mapToResponse(titulo);
        }

        if (titulo.getVenda() != null) {
            throw new RegraNegocioException(
                    "Este título está vinculado a uma venda e só pode ser cancelado através do cancelamento da venda."
            );
        }

        cancelarTituloInterno(titulo);

        TituloFinanceiro salvo = tituloRepo.save(titulo);
        return mapToResponse(salvo);
    }

    @Transactional
    public void cancelarTituloPorVenda(Venda venda) {
        if (venda == null || venda.getId() == null) {
            throw new RegraNegocioException("Venda inválida para cancelamento dos títulos financeiros.");
        }

        List<TituloFinanceiro> titulos = tituloRepo.findAll()
                .stream()
                .filter(t -> t.getVenda() != null && t.getVenda().getId().equals(venda.getId()))
                .toList();

        for (TituloFinanceiro titulo : titulos) {
            if (titulo.getStatus() != StatusTitulo.CANCELADO) {
                cancelarTituloInterno(titulo);
                tituloRepo.save(titulo);
            }
        }
    }

    private void cancelarTituloInterno(TituloFinanceiro titulo) {
        if (titulo.getStatus() == StatusTitulo.PAGO_RECEBIDO) {
            throw new RegraNegocioException("Não é possível cancelar um título já pago/recebido.");
        }

        if (titulo.getParcelas() != null) {
            for (ParcelaFinanceira parcela : titulo.getParcelas()) {
                if (parcela.getStatus() == StatusTitulo.PAGO_RECEBIDO) {
                    throw new RegraNegocioException(
                            "Não é possível cancelar o título, pois a parcela " +
                                    parcela.getNumero() + " já está paga/recebida."
                    );
                }

                parcela.setStatus(StatusTitulo.CANCELADO);
                parcela.setDataBaixa(null);
            }
        }

        titulo.setStatus(StatusTitulo.CANCELADO);
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