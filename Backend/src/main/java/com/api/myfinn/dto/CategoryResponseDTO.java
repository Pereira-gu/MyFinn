package com.api.myfinn.dto;

import java.util.UUID;

public record CategoryResponseDTO(UUID id, String name, String icon, String color) {
}