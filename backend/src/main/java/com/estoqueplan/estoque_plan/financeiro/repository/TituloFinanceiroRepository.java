package com.estoqueplan.estoque_plan.financeiro.repository;

import com.estoqueplan.estoque_plan.financeiro.model.TituloFinanceiro;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface TituloFinanceiroRepository extends JpaRepository<TituloFinanceiro, Long> {

    Optional<TituloFinanceiro> findByVendaId(Long vendaId);

    @Query("""
                select distinct t
                from TituloFinanceiro t
                left join fetch t.parcelas
                where t.status <> com.estoqueplan.estoque_plan.financeiro.model.enums.StatusTitulo.CANCELADO
            """)
    List<TituloFinanceiro> findAllNaoCanceladosComParcelas();
}
