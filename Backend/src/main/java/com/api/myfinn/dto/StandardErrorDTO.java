package com.api.myfinn.dto;

import java.time.LocalDateTime;

// Este é o formato padrão que o nosso Frontend vai receber sempre que algo correr mal
public record StandardErrorDTO(
        LocalDateTime timestamp, // Data e hora exata do erro
        Integer status,          // Código do erro (ex: 400 para erro do cliente, 500 para erro do servidor)
        String error,            // Tipo de erro curto (ex: "Bad Request")
        String message,          // A mensagem amigável (ex: "Você não tem permissão...")
        String path              // A rota onde o erro aconteceu (ex: "/transactions")
) {
}