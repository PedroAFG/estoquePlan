package com.estoqueplan.estoque_plan.repository;

import com.estoqueplan.estoque_plan.dashboard.dto.TopClienteDTO;
import com.estoqueplan.estoque_plan.model.Venda;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.estoqueplan.estoque_plan.model.enums.StatusVenda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VendaRepository extends JpaRepository<Venda, Long> {

    List<Venda> findByStatus(StatusVenda status);

    List<Venda> findByStatusAndValorTotal(StatusVenda status, BigDecimal valorTotal);

    List<Venda> findByStatusAndDataDaVendaBetween(StatusVenda status, LocalDateTime inicio, LocalDateTime fim);

    boolean existsByClienteId(Long clienteId);

    @Query("""
           select coalesce(sum(v.valorTotal), 0)
           from Venda v
           where v.status = com.estoqueplan.estoque_plan.model.enums.StatusVenda.ATIVA
             and v.dataDaVenda between :inicio and :fim
           """)
    BigDecimal sumTotalVendidoPeriodo(@Param("inicio") LocalDateTime inicio,
                                      @Param("fim") LocalDateTime fim);

    @Query("""
           select count(v)
           from Venda v
           where v.status = com.estoqueplan.estoque_plan.model.enums.StatusVenda.ATIVA
             and v.dataDaVenda between :inicio and :fim
           """)
    Long countVendasPeriodo(@Param("inicio") LocalDateTime inicio,
                            @Param("fim") LocalDateTime fim);

    @Query("""
           select new com.estoqueplan.estoque_plan.dashboard.dto.TopClienteDTO(
               c.id,
               c.nome,
               coalesce(sum(v.valorTotal), 0),
               count(v.id)
           )
           from Venda v
           join v.cliente c
           where v.status = com.estoqueplan.estoque_plan.model.enums.StatusVenda.ATIVA
             and v.dataDaVenda between :inicio and :fim
           group by c.id, c.nome
           order by coalesce(sum(v.valorTotal), 0) desc
           """)
    List<TopClienteDTO> findTopClientesPeriodo(@Param("inicio") LocalDateTime inicio,
                                               @Param("fim") LocalDateTime fim);

}