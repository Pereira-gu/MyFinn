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

    // Soma otimizada direto no banco de dados
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
    //Soma apenas despesas (outcome) onde a categoria é isFixed = true
    @Query("SELECT COALESCE(SUM(t.valueCents), 0) FROM Transaction t " +
            "WHERE t.user.id = :userId " +
            "AND t.type = 'outcome' " +
            "AND t.category.isFixed = true " +
            "AND t.active = true " +
            "AND t.date BETWEEN :startDate AND :endDate")
    Long sumFixedExpensesByDateBetween(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
    //Busca Dinâmica (Blindada contra o erro "bytea" do PostgreSQL)
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.active = true " +
            "AND (CAST(:type AS string) IS NULL OR t.type = :type) " +
            "AND (CAST(:categoryId AS uuid) IS NULL OR t.category.id = :categoryId) " +
            "AND (CAST(:search AS string) IS NULL OR LOWER(t.description) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))")
    Page<Transaction> findTransactionsWithFilters(
            @Param("userId") UUID userId,
            @Param("type") String type,
            @Param("categoryId") UUID categoryId,
            @Param("search") String search,
            Pageable pageable
    );
}