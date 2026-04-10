package com.api.myfinn.dto;

import org.springframework.data.domain.Page;

public record DashboardResponseDTO(
        Integer incomeCents,
        Integer outcomeCents,
        Integer balanceCents,
        Page<TransactionResponseDTO> transactions // O Spring Boot cuida de empacotar as páginas!
) {}