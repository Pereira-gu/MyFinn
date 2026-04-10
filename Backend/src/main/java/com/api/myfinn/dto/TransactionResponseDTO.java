package com.api.myfinn.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record TransactionResponseDTO(
        UUID id,
        String description,
        Integer valueCents,
        String type,
        LocalDateTime date,
        Boolean isPaid,
        UUID categoryId,
        String categoryName,
        String paymentMethod,
        Integer installments,
        Boolean isRecurring
) {}