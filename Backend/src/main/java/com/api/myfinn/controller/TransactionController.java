package com.api.myfinn.controller;

import com.api.myfinn.dto.DashboardResponseDTO;
import com.api.myfinn.dto.TransactionRequestDTO;
import com.api.myfinn.dto.TransactionResponseDTO;
import com.api.myfinn.model.User;
import com.api.myfinn.service.TransactionService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/transactions") // 👈 Tem que ficar assim!
@Slf4j
public class TransactionController {

    @Autowired
    private TransactionService transactionService;


    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponseDTO> getDashboard(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @AuthenticationPrincipal User loggedUser
    ) {
        if (month == null) month = LocalDate.now().getMonthValue();
        if (year == null) year = LocalDate.now().getYear();

        transactionService.checkAndCreateRecurring(loggedUser, month, year);
        DashboardResponseDTO dashboardData = transactionService.getDashboard(month, year, page, size, loggedUser);
        return ResponseEntity.ok(dashboardData);
    }

    @GetMapping
    public ResponseEntity<Page<TransactionResponseDTO>> getTransactionsHistory(
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User loggedUser
    ) {
        // Logamos a busca para termos rastreabilidade!
        log.info("Buscando extrato. Filtros -> Tipo: {}, Categoria: {}, Busca: {}, Pagina: {}", type, categoryId, search, page);

        Page<TransactionResponseDTO> transactions = transactionService.getTransactionsHistory(
                categoryId, type, search, page, size, loggedUser
        );

        return ResponseEntity.ok(transactions);
    }

    @PostMapping
    public ResponseEntity<TransactionResponseDTO> createTransaction(
            @RequestBody @Valid TransactionRequestDTO data,
            @AuthenticationPrincipal User loggedUser
    ) {
        return ResponseEntity.ok(transactionService.createTransaction(data, loggedUser));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponseDTO> updateTransaction(
            @PathVariable UUID id,
            @RequestBody @Valid TransactionRequestDTO data,
            @AuthenticationPrincipal User loggedUser
    ) {
        return ResponseEntity.ok(transactionService.updateTransaction(id, data, loggedUser));
    }

    @PatchMapping("/{id}/pay")
    public ResponseEntity<Void> togglePaymentStatus(
            @PathVariable UUID id,
            @AuthenticationPrincipal User loggedUser
    ) {
        transactionService.togglePaymentStatus(id, loggedUser);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @PathVariable UUID id,
            @AuthenticationPrincipal User loggedUser
    ) {
        transactionService.softDeleteTransaction(id, loggedUser);
        return ResponseEntity.noContent().build();
    }

}