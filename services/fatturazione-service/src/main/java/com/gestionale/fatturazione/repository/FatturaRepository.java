package com.gestionale.fatturazione.repository;

import com.gestionale.fatturazione.entity.Fattura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FatturaRepository extends JpaRepository<Fattura, String> {
    @Query("select count(f) from Fattura f where f.nFatt like concat(:prefix, '%')")
    long countByPrefix(@Param("prefix") String prefix);
    boolean existsByIntId(String intId);
}
