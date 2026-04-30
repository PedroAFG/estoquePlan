package com.estoqueplan.estoque_plan.financeiro.service;

import com.estoqueplan.estoque_plan.exception.RecursoNaoEncontradoException;
import com.estoqueplan.estoque_plan.exception.RegraNegocioException;
import com.estoqueplan.estoque_plan.financeiro.dto.BaixaParcelaDTO;
import com.estoqueplan.estoque_plan.financeiro.model.MovimentacaoCaixa;
import com.estoqueplan.estoque_plan.financeiro.model.ParcelaFinanceira;
import com.estoqueplan.estoque_plan.financeiro.model.TituloFinanceiro;
import com.estoqueplan.estoque_plan.financeiro.model.enums.StatusTitulo;
import com.estoqueplan.estoque_plan.financeiro.model.enums.TipoMovimentacao;
import com.estoqueplan.estoque_plan.financeiro.model.enums.TipoTitulo;
import com.estoqueplan.estoque_plan.financeiro.repository.ParcelaFinanceiraRepository;
import com.estoqueplan.estoque_plan.financeiro.repository.TituloFinanceiroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class ParcelaFinanceiraService {

    @Autowired
    private ParcelaFinanceiraRepository parcelaFinanceiraRepository;

    @Autowired
    private TituloFinanceiroRepository tituloFinanceiroRepository;

    @Autowired
    private MovimentacaoCaixaService movimentacaoCaixaService;

    @Transactional
    public ParcelaFinanceira baixarParcela(Long parcelaId, BaixaParcelaDTO dto) {
        ParcelaFinanceira parcela = parcelaFinanceiraRepository.findById(parcelaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Parcela não encontrada: " + parcelaId));

        if (parcela.getStatus() == StatusTitulo.PAGO_RECEBIDO) {
            throw new RegraNegocioException("Esta parcela já está baixada (PAGO/RECEBIDO).");
        }
        if (parcela.getStatus() == StatusTitulo.CANCELADO) {
            throw new RegraNegocioException("Não é possível baixar uma parcela CANCELADA.");
        }
        if (parcela.getValor() == null) {
            throw new RegraNegocioException("Parcela sem valor. Verifique o cadastro.");
        }

        TituloFinanceiro titulo = parcela.getTituloFinanceiro();
        if (titulo == null) {
            throw new RegraNegocioException("Parcela sem vínculo com TítuloFinanceiro.");
        }

        TipoMovimentacao tipoMov = (titulo.getTipo() == TipoTitulo.A_RECEBER)
                ? TipoMovimentacao.ENTRADA
                : TipoMovimentacao.SAIDA;

        LocalDate dataBaixa = (dto != null && dto.getDataBaixa() != null)
                ? dto.getDataBaixa()
                : LocalDate.now();

        String descricaoMov = (dto != null && dto.getDescricao() != null && !dto.getDescricao().isBlank())
                ? dto.getDescricao()
                : titulo.getDescricao();

        // 1) cria movimentação
        MovimentacaoCaixa mov = movimentacaoCaixaService.criarMovimentacao(tipoMov, parcela.getValor(), descricaoMov);

        // 2) atualiza parcela
        parcela.setDataBaixa(dataBaixa);
        parcela.setStatus(StatusTitulo.PAGO_RECEBIDO);
        parcela.setMovimentacaoCaixa(mov);

        ParcelaFinanceira parcelaSalva = parcelaFinanceiraRepository.save(parcela);

        // 3) atualiza status do título baseado nas parcelas
        boolean todasPagas = titulo.getParcelas().stream()
                .allMatch(p -> p.getStatus() == StatusTitulo.PAGO_RECEBIDO);

        titulo.setStatus(todasPagas ? StatusTitulo.PAGO_RECEBIDO : StatusTitulo.PENDENTE);
        tituloFinanceiroRepository.save(titulo);

        return parcelaSalva;
    }
}
