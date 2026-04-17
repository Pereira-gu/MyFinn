package com.api.myfinn.dto;

import jakarta.validation.constraints.NotBlank;

public record CategoryRequestDTO(
        @NotBlank String name,
        @NotBlank String icon,
        @NotBlank String color,
        Boolean isFixed
) {
        public Boolean getIsFixedOrDefault() {
                return isFixed != null ? isFixed : false;
        }
}