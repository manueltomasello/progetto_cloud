package com.gestionale.anagrafiche.repository;
import com.gestionale.anagrafiche.entity.ArticoloConsumabile;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ArticoloRepository extends JpaRepository<ArticoloConsumabile, Integer> {}
