package com.api.myfinn.controller;

import com.api.myfinn.dto.DashboardResponseDTO;
import com.api.myfinn.dto.TransactionRequestDTO;
import com.api.myfinn.dto.TransactionResponseDTO;
import com.api.myfinn.model.User;
import com.api.myfinn.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/transactions")
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