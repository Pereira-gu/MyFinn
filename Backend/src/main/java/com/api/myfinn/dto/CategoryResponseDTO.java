package com.api.myfinn.dto;

import com.api.myfinn.model.Category;

import java.util.UUID;

public record CategoryResponseDTO(
        UUID id,
        String name,
        String icon,
        String color,
        Boolean isFixed // 👇 Novo campo enviado de volta
) {
    // Construtor que converte da Entidade para o DTO
    public CategoryResponseDTO(Category category) {
        this(
                category.getId(),
                category.getName(),
                category.getIcon(),
                category.getColor(),
                category.getIsFixed()
        );
    }
}