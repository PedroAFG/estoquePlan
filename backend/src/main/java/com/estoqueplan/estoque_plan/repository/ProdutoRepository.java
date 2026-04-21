package com.estoqueplan.estoque_plan.repository;

import com.estoqueplan.estoque_plan.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    List<Produto> findByAtivoTrue();
    List<Produto> findByAtivoFalse();
    boolean existsByCategoriaId(Long categoriaId); //lógica pra inativar categoria no CategoriaService

    //Dashboard
    @Query("select count(p) from Produto p where p.ativo = true")
    Long countProdutosAtivos();

    @Query("select coalesce(sum(p.quantidadeDisponivel), 0) from Produto p where p.ativo = true")
    Long sumQuantidadeDisponivelProdutosAtivos();

    @Query("""
       select count(p)
       from Produto p
       where p.ativo = true
         and p.quantidadeDisponivel = 0
       """)
    Long countProdutosSemEstoque();

    @Query("""
       select count(p)
       from Produto p
       where p.ativo = true
         and p.quantidadeDisponivel > 0
         and p.quantidadeDisponivel <= p.estoqueMinimo
       """)
    Long countProdutosBaixoEstoque();

    @Query("""
       select coalesce(sum(p.custo * p.quantidadeDisponivel), 0)
       from Produto p
       where p.ativo = true
       """)
    BigDecimal sumValorEstoquePorCusto();

    @Query("""
       select p
       from Produto p
       where p.ativo = true
         and p.quantidadeDisponivel > 0
         and p.quantidadeDisponivel <= p.estoqueMinimo
       order by p.quantidadeDisponivel asc, p.descricao asc
       """)
    List<Produto> findProdutosBaixoEstoque();

    @Query("""
       select p
       from Produto p
       where p.ativo = true
         and p.quantidadeDisponivel = 0
       order by p.descricao asc
       """)
    List<Produto> findProdutosSemEstoque();

}


