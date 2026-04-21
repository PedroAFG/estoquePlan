package com.estoqueplan.estoque_plan.repository;

import com.estoqueplan.estoque_plan.dashboard.dto.TopProdutoVendidoDTO;
import com.estoqueplan.estoque_plan.model.ItemVenda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ItemVendaRepository extends JpaRepository<ItemVenda, Long> {

    @Query("""
           select new com.estoqueplan.estoque_plan.dashboard.dto.TopProdutoVendidoDTO(
               p.id,
               p.descricao,
               coalesce(sum(i.quantidade), 0),
               coalesce(sum(i.total), 0)
           )
           from ItemVenda i
           join i.produto p
           join i.venda v
           where v.status = com.estoqueplan.estoque_plan.model.enums.StatusVenda.ATIVA
             and v.dataDaVenda between :inicio and :fim
           group by p.id, p.descricao
           order by coalesce(sum(i.quantidade), 0) desc, coalesce(sum(i.total), 0) desc
           """)
    List<TopProdutoVendidoDTO> findTopProdutosVendidosPeriodo(@Param("inicio") LocalDateTime inicio,
                                                              @Param("fim") LocalDateTime fim);
}

