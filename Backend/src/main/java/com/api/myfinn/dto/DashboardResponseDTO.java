package com.api.myfinn.dto;

import org.springframework.data.domain.Page;

public record DashboardResponseDTO(
        Integer incomeCents,
        Integer outcomeCents,
        Integer balanceCents,
        Integer previousMonthIncomeCents,
        Integer previousMonthOutcomeCents,
        HealthMetricsDTO healthMetrics, // 👇 NOVO CAMPO INJETADO AQUI
        Page<TransactionResponseDTO> transactions
) {}