package com.api.myfinn.repository;

import com.api.myfinn.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    List<Transaction> findByUserIdAndActiveTrueAndDateBetween(UUID userId, LocalDateTime startDate, LocalDateTime endDate);

    Page<Transaction> findByUserIdAndActiveTrueAndDateBetweenOrderByDateDesc(UUID userId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    boolean existsByUserIdAndIsRecurringTrueAndDateBetween(UUID userId, LocalDateTime startDate, LocalDateTime endDate);

    List<Transaction> findByUserIdAndActiveTrueAndIsRecurringTrueAndDateBetween(UUID userId, LocalDateTime startDate, LocalDateTime endDate);

    // 👇 NOVA QUERY: Soma otimizada direto no banco de dados (Retorna Long por padrão do JPA)
    @Query("SELECT COALESCE(SUM(t.valueCents), 0) FROM Transaction t " +
            "WHERE t.user.id = :userId " +
            "AND t.type = :type " +
            "AND t.active = true " +
            "AND t.date BETWEEN :startDate AND :endDate")
    Long sumTransactionsByTypeAndDateBetween(
            @Param("userId") UUID userId,
            @Param("type") String type,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}