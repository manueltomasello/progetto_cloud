package com.gestionale.auth.repository;

import com.gestionale.auth.entity.Operatore;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OperatoreRepository extends JpaRepository<Operatore, Integer> {
    Optional<Operatore> findByUsername(String username);
}
