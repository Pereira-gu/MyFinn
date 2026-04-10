package com.api.myfinn.exception;

import com.api.myfinn.dto.StandardErrorDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

// Esta anotação transforma esta classe num "Radar" global para intercetar exceções
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. Interceta os nossos erros manuais (ex: "Categoria não encontrada")
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<StandardErrorDTO> handleIllegalArgumentException(IllegalArgumentException ex, HttpServletRequest request) {

        StandardErrorDTO error = new StandardErrorDTO(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(), // 400
                "Bad Request",
                ex.getMessage(), // Pega na mensagem que escrevemos no 'throw new IllegalArgumentException(...)'
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // 2. Interceta os erros das anotações @NotBlank e @NotNull nos DTOs
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<StandardErrorDTO> handleValidationExceptions(MethodArgumentNotValidException ex, HttpServletRequest request) {

        // Vai buscar a primeira mensagem de erro da lista de validações que falharam
        String errorMessage = ex.getBindingResult().getFieldErrors().get(0).getDefaultMessage();

        StandardErrorDTO error = new StandardErrorDTO(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(), // 400
                "Validation Error",
                errorMessage, // Ex: "A descrição é obrigatória"
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}