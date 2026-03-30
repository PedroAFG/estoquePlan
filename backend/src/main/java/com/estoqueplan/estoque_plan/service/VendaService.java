package com.estoqueplan.estoque_plan.service;

import com.estoqueplan.estoque_plan.dto.ItemVendaDTO;
import com.estoqueplan.estoque_plan.dto.VendaDTO;
import com.estoqueplan.estoque_plan.financeiro.repository.TituloFinanceiroRepository;
import com.estoqueplan.estoque_plan.financeiro.service.TituloFinanceiroService;
import com.estoqueplan.estoque_plan.model.ItemVenda;
import com.estoqueplan.estoque_plan.model.Produto;
import com.estoqueplan.estoque_plan.model.Venda;
import com.estoqueplan.estoque_plan.model.enums.StatusVenda;
import com.estoqueplan.estoque_plan.repository.ProdutoRepository;
import com.estoqueplan.estoque_plan.repository.VendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.estoqueplan.estoque_plan.financeiro.model.TituloFinanceiro;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class VendaService {

    @Autowired
    private TituloFinanceiroRepository tituloFinanceiroRepository;

    @Autowired
    private VendaRepository vendaRepository;

    @Autowired
    private ClienteService clienteService;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private TituloFinanceiroService tituloFinanceiroService;

    @Transactional
    public VendaDTO salvarVenda(VendaDTO vendaDTO) {
        validarVenda(vendaDTO);

        Venda venda = new Venda();

        if (vendaDTO.getClienteId() != null) {
            venda.setCliente(clienteService.encontrarPorId(vendaDTO.getClienteId())
                    .orElseThrow(() -> new RuntimeException("Cliente não encontrado")));
        }

        venda.setRua(vendaDTO.getRua());
        venda.setBairro(vendaDTO.getBairro());
        venda.setFone(vendaDTO.getFone());
        venda.setObservacao(vendaDTO.getObservacao());
        venda.setDataDaVenda(LocalDateTime.now());
        venda.setDesconto(vendaDTO.getDesconto());
        venda.setAdicional(vendaDTO.getAdicional());
        venda.setFrete(vendaDTO.getFrete());

        List<ItemVenda> itens = new ArrayList<>();
        BigDecimal valorTotalItens = BigDecimal.ZERO;

        for (ItemVendaDTO itemDTO : vendaDTO.getItens()) {
            if (itemDTO.getProdutoId() == null) {
                throw new RuntimeException("ProdutoId do item é obrigatório.");
            }

            if (itemDTO.getQuantidade() == null || itemDTO.getQuantidade() <= 0) {
                throw new RuntimeException("Quantidade do item deve ser maior que zero.");
            }

            if (itemDTO.getPrecoUnitario() == null || itemDTO.getPrecoUnitario().compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("Preço unitário do item deve ser maior que zero.");
            }

            ItemVenda item = new ItemVenda();
            item.setVenda(venda);

            Produto produto = produtoRepository.findById(itemDTO.getProdutoId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

            item.setProduto(produto);
            item.setQuantidade(itemDTO.getQuantidade());
            item.setUnidade(itemDTO.getUnidade());
            item.setBitola(itemDTO.getBitola());
            item.setComprimento(itemDTO.getComprimento());
            item.setPrecoUnitario(itemDTO.getPrecoUnitario());

            BigDecimal totalItem = itemDTO.getPrecoUnitario()
                    .multiply(BigDecimal.valueOf(itemDTO.getQuantidade()));

            item.setTotal(totalItem);

            valorTotalItens = valorTotalItens.add(totalItem);
            itens.add(item);
        }

        BigDecimal desconto = venda.getDesconto() != null ? venda.getDesconto() : BigDecimal.ZERO;
        BigDecimal adicional = venda.getAdicional() != null ? venda.getAdicional() : BigDecimal.ZERO;
        BigDecimal frete = venda.getFrete() != null ? venda.getFrete() : BigDecimal.ZERO;

        BigDecimal valorFinalVenda = valorTotalItens
                .subtract(desconto)
                .add(adicional)
                .add(frete);

        if (valorFinalVenda.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("O valor final da venda deve ser maior que zero.");
        }

        venda.setValorTotal(valorFinalVenda);
        venda.setItens(itens);

        Venda novaVenda = vendaRepository.save(venda);

        tituloFinanceiroService.criarTituloPorVenda(
                novaVenda,
                vendaDTO.getCategoriaFinanceiraId(),
                vendaDTO.getFormaPagamentoId(),
                vendaDTO.getNumeroParcelas(),
                vendaDTO.getPrimeiroVencimento(),
                vendaDTO.getIntervaloDias(),
                vendaDTO.getDescricaoTitulo()
        );

        return converterVendaParaDTO(novaVenda);
    }

    @Transactional
    public VendaDTO atualizarVenda(Long id, VendaDTO vendaDTO) {
        Venda venda = vendaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venda não encontrada para o ID: " + id));

        if (venda.getStatus() == StatusVenda.CANCELADA) {
            throw new RuntimeException("Não é possível alterar uma venda cancelada");
        }

        if (vendaDTO.getClienteId() != null) {
            venda.setCliente(clienteService.encontrarPorId(vendaDTO.getClienteId())
                    .orElseThrow(() -> new RuntimeException("Cliente não encontrado")));
        } else {
            venda.setCliente(null);
        }

        venda.setRua(vendaDTO.getRua());
        venda.setBairro(vendaDTO.getBairro());
        venda.setFone(vendaDTO.getFone());
        venda.setObservacao(vendaDTO.getObservacao());
        venda.setDesconto(vendaDTO.getDesconto());
        venda.setAdicional(vendaDTO.getAdicional());
        venda.setFrete(vendaDTO.getFrete());

        venda.getItens().clear();

        List<ItemVenda> novosItens = new ArrayList<>();
        BigDecimal valorTotalItens = BigDecimal.ZERO;

        if (vendaDTO.getItens() == null || vendaDTO.getItens().isEmpty()) {
            throw new RuntimeException("A venda precisa ter pelo menos 1 item");
        }

        for (ItemVendaDTO itemDTO : vendaDTO.getItens()) {
            ItemVenda item = new ItemVenda();
            item.setVenda(venda);

            Produto produto = produtoRepository.findById(itemDTO.getProdutoId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

            item.setProduto(produto);
            item.setQuantidade(itemDTO.getQuantidade());
            item.setUnidade(itemDTO.getUnidade());
            item.setBitola(itemDTO.getBitola());
            item.setComprimento(itemDTO.getComprimento());
            item.setPrecoUnitario(itemDTO.getPrecoUnitario());

            BigDecimal totalItem = itemDTO.getPrecoUnitario()
                    .multiply(BigDecimal.valueOf(itemDTO.getQuantidade()));

            item.setTotal(totalItem);

            valorTotalItens = valorTotalItens.add(totalItem);
            novosItens.add(item);
        }

        venda.getItens().addAll(novosItens);

        BigDecimal desconto = venda.getDesconto() != null ? venda.getDesconto() : BigDecimal.ZERO;
        BigDecimal adicional = venda.getAdicional() != null ? venda.getAdicional() : BigDecimal.ZERO;
        BigDecimal frete = venda.getFrete() != null ? venda.getFrete() : BigDecimal.ZERO;

        venda.setValorTotal(valorTotalItens.subtract(desconto).add(adicional).add(frete));

        Venda vendaSalva = vendaRepository.save(venda);
        return converterVendaParaDTO(vendaSalva);
    }

    public List<VendaDTO> listarTodasVendas() {
        List<Venda> vendas = vendaRepository.findAll();
        return vendas.stream().map(this::converterVendaParaDTO).collect(Collectors.toList());
    }

    public Optional<VendaDTO> encontrarVendaPorId(Long id) {
        return vendaRepository.findById(id).map(this::converterVendaParaDTO);
    }

    public void cancelarVenda(Long id, String motivo) {
        Venda venda = vendaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venda não encontrada para o ID: " + id));

        if (venda.getStatus() == StatusVenda.CANCELADA) {
            return;
        }

        venda.setStatus(StatusVenda.CANCELADA);
        venda.setCanceladaEm(LocalDateTime.now());
        venda.setMotivoCancelamento(motivo);

        vendaRepository.save(venda);
    }

    private void validarVenda(VendaDTO vendaDTO) {
        if (vendaDTO == null) {
            throw new RuntimeException("Os dados da venda não podem ser nulos.");
        }

        if (vendaDTO.getItens() == null || vendaDTO.getItens().isEmpty()) {
            throw new RuntimeException("A venda precisa ter pelo menos 1 item.");
        }

        if (vendaDTO.getCategoriaFinanceiraId() == null) {
            throw new RuntimeException("categoriaFinanceiraId é obrigatório.");
        }

        if (vendaDTO.getFormaPagamentoId() == null) {
            throw new RuntimeException("formaPagamentoId é obrigatório.");
        }

        if (vendaDTO.getNumeroParcelas() != null && vendaDTO.getNumeroParcelas() <= 0) {
            throw new RuntimeException("numeroParcelas deve ser maior que zero.");
        }

        if (vendaDTO.getIntervaloDias() != null && vendaDTO.getIntervaloDias() <= 0) {
            throw new RuntimeException("intervaloDias deve ser maior que zero.");
        }
    }

    private VendaDTO converterVendaParaDTO(Venda venda) {
        VendaDTO dto = new VendaDTO();
        dto.setId(venda.getId());

        if (venda.getCliente() != null) {
            dto.setClienteId(venda.getCliente().getId());
            dto.setNomeCliente(venda.getCliente().getNome());
        }

        dto.setRua(venda.getRua());
        dto.setBairro(venda.getBairro());
        dto.setFone(venda.getFone());
        dto.setObservacao(venda.getObservacao());
        dto.setDataDaVenda(venda.getDataDaVenda());
        dto.setValorTotal(venda.getValorTotal());
        dto.setAdicional(venda.getAdicional());
        dto.setFrete(venda.getFrete());
        dto.setDesconto(venda.getDesconto());
        dto.setStatus(venda.getStatus());

        dto.setItens(
                venda.getItens().stream().map(item -> {
                    ItemVendaDTO itemDTO = new ItemVendaDTO();
                    itemDTO.setProdutoId(item.getProduto().getId());
                    itemDTO.setDescricaoProduto(item.getProduto().getDescricao());
                    itemDTO.setQuantidade(item.getQuantidade());
                    itemDTO.setUnidade(item.getUnidade());
                    itemDTO.setBitola(item.getBitola());
                    itemDTO.setComprimento(item.getComprimento());
                    itemDTO.setPrecoUnitario(item.getPrecoUnitario());
                    itemDTO.setTotal(item.getTotal());
                    return itemDTO;
                }).collect(Collectors.toList())
        );

        tituloFinanceiroRepository.findByVendaId(venda.getId()).ifPresent(titulo -> {
            dto.setCategoriaFinanceiraId(
                    titulo.getCategoria() != null ? titulo.getCategoria().getId() : null
            );

            dto.setDescricaoTitulo(titulo.getDescricao());

            if (titulo.getParcelas() != null && !titulo.getParcelas().isEmpty()) {
                dto.setFormaPagamentoId(
                        titulo.getParcelas().get(0).getFormaPagamento() != null
                                ? titulo.getParcelas().get(0).getFormaPagamento().getId()
                                : null
                );

                dto.setNumeroParcelas(titulo.getParcelas().size());
                dto.setPrimeiroVencimento(titulo.getParcelas().get(0).getVencimento());

                if (titulo.getParcelas().size() > 1) {
                    dto.setIntervaloDias(
                            (int) java.time.temporal.ChronoUnit.DAYS.between(
                                    titulo.getParcelas().get(0).getVencimento(),
                                    titulo.getParcelas().get(1).getVencimento()
                            )
                    );
                }
            }
        });

        return dto;
    }

    public List<VendaDTO> encontrarVendasPorValor(StatusVenda status, BigDecimal valorTotal) {
        List<Venda> vendas = vendaRepository.findByStatusAndValorTotal(status, valorTotal);
        return vendas.stream().map(this::converterVendaParaDTO).collect(Collectors.toList());
    }

    public List<VendaDTO> encontrarVendasPorData(StatusVenda status, String data) {
        LocalDate dataVenda = LocalDate.parse(data);
        List<Venda> vendas = vendaRepository.findByStatusAndDataDaVendaBetween(
                status,
                dataVenda.atStartOfDay(),
                dataVenda.plusDays(1).atStartOfDay()
        );
        return vendas.stream().map(this::converterVendaParaDTO).collect(Collectors.toList());
    }
}