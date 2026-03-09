package com.mediconnect.consultation.repository;
import com.mediconnect.consultation.entity.DiseaseSymptomId;
import com.mediconnect.consultation.entity.DiseaseSymptomLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;
public interface DiseaseSymptomLinkRepository extends JpaRepository<DiseaseSymptomLink, DiseaseSymptomId> {
    @Query("SELECT dsl.id.diseaseId, SUM(dsl.probability) as score FROM DiseaseSymptomLink dsl WHERE dsl.id.symptomId IN :symptomIds GROUP BY dsl.id.diseaseId ORDER BY score DESC")
    List<Object[]> findTopDiseasesBySymptoms(@Param("symptomIds") List<UUID> symptomIds);
}
