package com.gestionale.manutenzioni.repository;
import com.gestionale.manutenzioni.entity.Manutenzione;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ManutenzioneRepository extends JpaRepository<Manutenzione, Integer> {
    List<Manutenzione> findByFreqGiorniIsNotNull();
}
