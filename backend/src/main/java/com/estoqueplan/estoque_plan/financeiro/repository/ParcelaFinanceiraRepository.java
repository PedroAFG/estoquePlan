package com.estoqueplan.estoque_plan.financeiro.repository;

import com.estoqueplan.estoque_plan.financeiro.model.ParcelaFinanceira;
import com.estoqueplan.estoque_plan.financeiro.model.enums.StatusTitulo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ParcelaFinanceiraRepository extends JpaRepository<ParcelaFinanceira, Long> {

    List<ParcelaFinanceira> findByStatusOrderByVencimentoAsc(StatusTitulo status);

    Optional<ParcelaFinanceira> findTopByStatusOrderByVencimentoAsc(StatusTitulo status);

    @Query("""
       select coalesce(sum(p.valor), 0)
       from ParcelaFinanceira p
       join p.tituloFinanceiro t
       where t.tipo = com.estoqueplan.estoque_plan.financeiro.model.enums.TipoTitulo.A_RECEBER
         and p.status in ('PENDENTE','ATRASADO')
       """)
    BigDecimal sumReceberAberto();

    @Query("""
       select coalesce(sum(p.valor), 0)
       from ParcelaFinanceira p
       join p.tituloFinanceiro t
       where t.tipo = com.estoqueplan.estoque_plan.financeiro.model.enums.TipoTitulo.A_PAGAR
         and p.status in ('PENDENTE','ATRASADO')
       """)
    BigDecimal sumPagarAberto();

    @Query("""
       select count(p)
       from ParcelaFinanceira p
       where p.vencimento < CURRENT_DATE
         and p.status not in ('PAGO_RECEBIDO','CANCELADO')
       """)
    Long countParcelasVencidas();

    @Query("""
       select coalesce(sum(p.valor), 0)
       from ParcelaFinanceira p
       join p.tituloFinanceiro t
       where t.tipo = com.estoqueplan.estoque_plan.financeiro.model.enums.TipoTitulo.A_RECEBER
         and p.status = 'PAGO_RECEBIDO'
         and p.dataBaixa between :inicio and :fim
       """)
    BigDecimal sumRecebidoPeriodo(LocalDate inicio, LocalDate fim);

    @Query("""
       select coalesce(sum(p.valor), 0)
       from ParcelaFinanceira p
       join p.tituloFinanceiro t
       where t.tipo = com.estoqueplan.estoque_plan.financeiro.model.enums.TipoTitulo.A_PAGAR
         and p.status = 'PAGO_RECEBIDO'
         and p.dataBaixa between :inicio and :fim
       """)
    BigDecimal sumPagoPeriodo(LocalDate inicio, LocalDate fim);

}
