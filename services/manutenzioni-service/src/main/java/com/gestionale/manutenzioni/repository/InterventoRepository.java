package com.gestionale.manutenzioni.repository;

import com.gestionale.manutenzioni.entity.Intervento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface InterventoRepository extends JpaRepository<Intervento, String> {
    List<Intervento> findByValidataManFalse();
    List<Intervento> findByDataIntEffIsNullAndDataIntPrevBefore(LocalDate date);

    @Query("select count(i) from Intervento i where i.intId like concat(:prefix, '%')")
    long countByPrefix(@Param("prefix") String prefix);
}
