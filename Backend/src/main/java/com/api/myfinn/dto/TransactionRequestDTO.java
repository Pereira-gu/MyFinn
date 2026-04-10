package com.api.myfinn.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.UUID;

public record TransactionRequestDTO(
        @NotBlank(message = "A descrição é obrigatória")
        String description,

        @NotNull(message = "O valor é obrigatório")
        Integer valueCents,

        @NotBlank(message = "O tipo é obrigatório")
        String type,

        @NotNull(message = "A data é obrigatória")
        LocalDateTime date,

        @NotNull(message = "O status é obrigatório")
        Boolean isPaid,

        @NotNull(message = "A categoria é obrigatória")
        UUID categoryId,

        @NotBlank(message = "O método de pagamento é obrigatório")

        String paymentMethod,
        Integer installments,
        Boolean isRecurring
) {}