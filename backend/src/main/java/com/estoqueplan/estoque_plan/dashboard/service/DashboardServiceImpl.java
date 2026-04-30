package com.estoqueplan.estoque_plan.dashboard.service;

import com.estoqueplan.estoque_plan.dashboard.dto.DashboardComercialDTO;
import com.estoqueplan.estoque_plan.dashboard.dto.DashboardEstoqueDTO;
import com.estoqueplan.estoque_plan.dashboard.dto.DashboardFinanceiroDTO;
import com.estoqueplan.estoque_plan.dashboard.dto.MovimentacaoResumoDTO;
import com.estoqueplan.estoque_plan.dashboard.dto.ProdutoBaixoEstoqueDTO;
import com.estoqueplan.estoque_plan.dashboard.dto.TopClienteDTO;
import com.estoqueplan.estoque_plan.dashboard.dto.TopProdutoVendidoDTO;
import com.estoqueplan.estoque_plan.exception.RegraNegocioException;
import com.estoqueplan.estoque_plan.financeiro.model.MovimentacaoCaixa;
import com.estoqueplan.estoque_plan.model.Produto;
import com.estoqueplan.estoque_plan.financeiro.repository.ParcelaFinanceiraRepository;
import com.estoqueplan.estoque_plan.financeiro.repository.MovimentacaoCaixaRepository;
import com.estoqueplan.estoque_plan.repository.ItemVendaRepository;
import com.estoqueplan.estoque_plan.repository.ProdutoRepository;
import com.estoqueplan.estoque_plan.repository.VendaRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final ProdutoRepository produtoRepository;
    private final VendaRepository vendaRepository;
    private final ItemVendaRepository itemVendaRepository;
    private final ParcelaFinanceiraRepository parcelaFinanceiraRepository;
    private final MovimentacaoCaixaRepository movimentacaoCaixaRepository;

    public DashboardServiceImpl(
            ProdutoRepository produtoRepository,
            VendaRepository vendaRepository,
            ItemVendaRepository itemVendaRepository,
            ParcelaFinanceiraRepository parcelaFinanceiraRepository,
            MovimentacaoCaixaRepository movimentacaoCaixaRepository
    ) {
        this.produtoRepository = produtoRepository;
        this.vendaRepository = vendaRepository;
        this.itemVendaRepository = itemVendaRepository;
        this.parcelaFinanceiraRepository = parcelaFinanceiraRepository;
        this.movimentacaoCaixaRepository = movimentacaoCaixaRepository;
    }

    @Override
    public DashboardEstoqueDTO obterIndicadoresEstoque(LocalDate inicio, LocalDate fim) {
        validarPeriodo(inicio, fim);

        Long totalProdutosCadastrados = produtoRepository.countProdutosAtivos();
        Long quantidadeTotalEmEstoque = produtoRepository.sumQuantidadeDisponivelProdutosAtivos();
        Long produtosComBaixoEstoque = produtoRepository.countProdutosBaixoEstoque();
        Long produtosSemEstoque = produtoRepository.countProdutosSemEstoque();
        BigDecimal valorTotalEstoquePorCusto = produtoRepository.sumValorEstoquePorCusto();

        List<ProdutoBaixoEstoqueDTO> listaBaixoEstoque = produtoRepository.findProdutosBaixoEstoque()
                .stream()
                .map(this::toProdutoBaixoEstoqueDTO)
                .toList();

        List<ProdutoBaixoEstoqueDTO> listaZerados = produtoRepository.findProdutosSemEstoque()
                .stream()
                .map(this::toProdutoBaixoEstoqueDTO)
                .toList();

        DashboardEstoqueDTO dto = new DashboardEstoqueDTO();
        dto.setTotalProdutosCadastrados(totalProdutosCadastrados != null ? totalProdutosCadastrados : 0L);
        dto.setQuantidadeTotalEmEstoque(quantidadeTotalEmEstoque != null ? quantidadeTotalEmEstoque : 0L);
        dto.setProdutosComBaixoEstoque(produtosComBaixoEstoque != null ? produtosComBaixoEstoque : 0L);
        dto.setProdutosSemEstoque(produtosSemEstoque != null ? produtosSemEstoque : 0L);
        dto.setValorTotalEstoquePorCusto(valorTotalEstoquePorCusto != null ? valorTotalEstoquePorCusto : BigDecimal.ZERO);
        dto.setProdutosBaixoEstoque(listaBaixoEstoque);
        dto.setProdutosZerados(listaZerados);

        return dto;
    }

    @Override
    public DashboardComercialDTO obterIndicadoresComerciais(LocalDate inicio, LocalDate fim) {
        validarPeriodo(inicio, fim);

        LocalDate dataInicio = resolverInicio(inicio);
        LocalDate dataFim = resolverFim(fim);

        LocalDateTime inicioDateTime = dataInicio.atStartOfDay();
        LocalDateTime fimDateTime = dataFim.atTime(LocalTime.MAX);

        BigDecimal totalVendidoPeriodo = vendaRepository.sumTotalVendidoPeriodo(inicioDateTime, fimDateTime);
        Long quantidadeVendasPeriodo = vendaRepository.countVendasPeriodo(inicioDateTime, fimDateTime);

        if (totalVendidoPeriodo == null) {
            totalVendidoPeriodo = BigDecimal.ZERO;
        }

        if (quantidadeVendasPeriodo == null) {
            quantidadeVendasPeriodo = 0L;
        }

        BigDecimal ticketMedio = BigDecimal.ZERO;
        if (quantidadeVendasPeriodo > 0) {
            ticketMedio = totalVendidoPeriodo.divide(
                    BigDecimal.valueOf(quantidadeVendasPeriodo),
                    2,
                    RoundingMode.HALF_UP
            );
        }

        List<TopProdutoVendidoDTO> topProdutosVendidos = itemVendaRepository
                .findTopProdutosVendidosPeriodo(inicioDateTime, fimDateTime)
                .stream()
                .limit(5)
                .toList();

        List<TopClienteDTO> topClientes = vendaRepository
                .findTopClientesPeriodo(inicioDateTime, fimDateTime)
                .stream()
                .limit(5)
                .toList();

        DashboardComercialDTO dto = new DashboardComercialDTO();
        dto.setTotalVendidoPeriodo(totalVendidoPeriodo);
        dto.setQuantidadeVendasPeriodo(quantidadeVendasPeriodo);
        dto.setTicketMedio(ticketMedio);
        dto.setTopProdutosVendidos(topProdutosVendidos);
        dto.setTopClientes(topClientes);

        return dto;
    }

    @Override
    public DashboardFinanceiroDTO obterIndicadoresFinanceiros(LocalDate inicio, LocalDate fim) {
        validarPeriodo(inicio, fim);

        LocalDate dataInicio = resolverInicio(inicio);
        LocalDate dataFim = resolverFim(fim);

        LocalDateTime inicioDateTime = dataInicio.atStartOfDay();
        LocalDateTime fimDateTime = dataFim.atTime(LocalTime.MAX);

        BigDecimal totalReceberAberto = parcelaFinanceiraRepository.sumReceberAberto();
        BigDecimal totalPagarAberto = parcelaFinanceiraRepository.sumPagarAberto();
        Long parcelasVencidas = parcelaFinanceiraRepository.countParcelasVencidas();
        BigDecimal recebidoPeriodo = parcelaFinanceiraRepository.sumRecebidoPeriodo(dataInicio, dataFim);
        BigDecimal pagoPeriodo = parcelaFinanceiraRepository.sumPagoPeriodo(dataInicio, dataFim);

        List<MovimentacaoCaixa> ultimasMovimentacoesEntidade =
                movimentacaoCaixaRepository.findTop5ByOrderByDataHoraDesc();

        BigDecimal saldoAtualCaixa = ultimasMovimentacoesEntidade.stream()
                .findFirst()
                .map(MovimentacaoCaixa::getSaldoApos)
                .orElse(BigDecimal.ZERO);

        BigDecimal totalEntradasPeriodo = movimentacaoCaixaRepository.sumEntradasPeriodo(inicioDateTime, fimDateTime);
        BigDecimal totalSaidasPeriodo = movimentacaoCaixaRepository.sumSaidasPeriodo(inicioDateTime, fimDateTime);

        List<MovimentacaoResumoDTO> ultimasMovimentacoes = ultimasMovimentacoesEntidade.stream()
                .map(m -> new MovimentacaoResumoDTO(
                        m.getId(),
                        m.getTipo().name(),
                        m.getDescricao(),
                        m.getDataHora(),
                        m.getValor()
                ))
                .toList();

        DashboardFinanceiroDTO dto = new DashboardFinanceiroDTO();
        dto.setTotalReceberAberto(totalReceberAberto != null ? totalReceberAberto : BigDecimal.ZERO);
        dto.setTotalPagarAberto(totalPagarAberto != null ? totalPagarAberto : BigDecimal.ZERO);
        dto.setParcelasVencidas(parcelasVencidas != null ? parcelasVencidas : 0L);
        dto.setRecebidoPeriodo(recebidoPeriodo != null ? recebidoPeriodo : BigDecimal.ZERO);
        dto.setPagoPeriodo(pagoPeriodo != null ? pagoPeriodo : BigDecimal.ZERO);
        dto.setSaldoAtualCaixa(saldoAtualCaixa);
        dto.setTotalEntradasPeriodo(totalEntradasPeriodo != null ? totalEntradasPeriodo : BigDecimal.ZERO);
        dto.setTotalSaidasPeriodo(totalSaidasPeriodo != null ? totalSaidasPeriodo : BigDecimal.ZERO);
        dto.setUltimasMovimentacoes(ultimasMovimentacoes);

        return dto;
    }

    private ProdutoBaixoEstoqueDTO toProdutoBaixoEstoqueDTO(Produto produto) {
        return new ProdutoBaixoEstoqueDTO(
                produto.getId(),
                produto.getDescricao(),
                produto.getQuantidadeDisponivel(),
                produto.getEstoqueMinimo()
        );
    }

    private void validarPeriodo(LocalDate inicio, LocalDate fim) {
        if (inicio != null && fim != null && inicio.isAfter(fim)) {
            throw new RegraNegocioException("A data inicial não pode ser maior que a data final.");
        }
    }

    private LocalDate resolverInicio(LocalDate inicio) {
        return inicio != null ? inicio : LocalDate.now().withDayOfMonth(1);
    }

    private LocalDate resolverFim(LocalDate fim) {
        return fim != null ? fim : LocalDate.now();
    }
}