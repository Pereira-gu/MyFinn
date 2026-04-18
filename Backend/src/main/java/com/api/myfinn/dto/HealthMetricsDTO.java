package com.api.myfinn.dto;

public record HealthMetricsDTO(
        Double retentionRate,
        Integer burnRateCents,
        Double incomeMoM,
        Double outcomeMoM,
        Double commitmentRate
) {}