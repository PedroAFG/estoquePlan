package com.estoqueplan.estoque_plan.repository;

import com.estoqueplan.estoque_plan.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    List<Produto> findByAtivoTrue();
    List<Produto> findByAtivoFalse();
    boolean existsByCategoriaId(Long categoriaId); //lógica pra inativar categoria no CategoriaService


}


