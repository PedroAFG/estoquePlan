package com.estoqueplan.estoque_plan.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import com.estoqueplan.estoque_plan.dto.ItemVendaDTO;
import com.estoqueplan.estoque_plan.dto.VendaDTO;
import com.estoqueplan.estoque_plan.model.ItemVenda;
import com.estoqueplan.estoque_plan.model.Produto;
import com.estoqueplan.estoque_plan.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.estoqueplan.estoque_plan.repository.VendaRepository;
import com.estoqueplan.estoque_plan.model.Venda;

@Service
public class VendaService {
    @Autowired
    private VendaRepository vendaRepository;
    @Autowired
    private ClienteService clienteService;
    @Autowired
    private ProdutoRepository produtoRepository;
    // Adicione outros repos conforme precisar

    public VendaDTO salvarVenda(VendaDTO vendaDTO) {
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

        // Para cada item, cria ItemVenda e adiciona na venda
        List<ItemVenda> itens = new ArrayList<>();
        BigDecimal valorTotal = BigDecimal.ZERO;

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
            item.setTotal(itemDTO.getPrecoUnitario().multiply(
                    BigDecimal.valueOf(itemDTO.getQuantidade()))
            );
            valorTotal = valorTotal.add(item.getTotal());
            itens.add(item);
        }

        //abaixo, o calculo total da venda inicia com validação e "prevenção" de NullPointer, ou seja,
        //SE o desconto NÃO for nulo, use o valor dele.
        //SE for nulo, use ZERO (BigDecimal.ZERO) para não afetar o resultado da conta e não causar erro.
        BigDecimal desconto = venda.getDesconto() != null ? venda.getDesconto() : BigDecimal.ZERO;
        BigDecimal adicional = venda.getAdicional() != null ? venda.getAdicional() : BigDecimal.ZERO;
        BigDecimal frete = venda.getFrete() != null ? venda.getFrete() : BigDecimal.ZERO;

        venda.setValorTotal(valorTotal.subtract(desconto).add(adicional).add(frete));
        venda.setItens(itens);

        Venda novaVenda = vendaRepository.save(venda);

        // Converter de volta pra DTO antes de retornar (pode usar mapper manual ou MapStruct)
        return converterVendaParaDTO(novaVenda);
    }

    public List<VendaDTO> listarTodasVendas() {
        List<Venda> vendas = vendaRepository.findAll();
        return vendas.stream().map(this::converterVendaParaDTO).collect(Collectors.toList());
    }

    public Optional<VendaDTO> encontrarVendaPorId(Long id) {
        return vendaRepository.findById(id).map(this::converterVendaParaDTO);
    }

    public void deletarVendaPorId(Long id) {
        if (!vendaRepository.existsById(id)) {
            throw new RuntimeException("Venda não encontrada para o ID: " + id);
        }
        vendaRepository.deleteById(id);
    }

    // Métodos auxiliares para converter entre Entity e DTO
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
        return dto;
    }

    public List<VendaDTO> encontrarVendasPorValor(BigDecimal valorTotal) {
        List<Venda> vendas = vendaRepository.findByValorTotal(valorTotal);
        return vendas.stream().map(this::converterVendaParaDTO).collect(Collectors.toList());
    }

    public List<VendaDTO> encontrarVendasPorData(String data) {
        LocalDate dataVenda = LocalDate.parse(data); // Se o campo for LocalDate
        List<Venda> vendas = vendaRepository.findByDataDaVendaBetween(
                dataVenda.atStartOfDay(),
                dataVenda.plusDays(1).atStartOfDay()
        );
        return vendas.stream().map(this::converterVendaParaDTO).collect(Collectors.toList());
    }
}

