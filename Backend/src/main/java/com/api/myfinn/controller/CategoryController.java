package com.api.myfinn.controller;

import com.api.myfinn.dto.CategoryRequestDTO;
import com.api.myfinn.dto.CategoryResponseDTO;
import com.api.myfinn.model.User;
import com.api.myfinn.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // ROTA PARA CRIAR CATEGORIA (POST /categories)
    @PostMapping
    public ResponseEntity<CategoryResponseDTO> createCategory(
            @RequestBody @Valid CategoryRequestDTO data,
            @AuthenticationPrincipal User loggedUser
    ) {
        CategoryResponseDTO createdCategory = categoryService.createCategory(data, loggedUser);
        return ResponseEntity.ok(createdCategory);
    }

    // ROTA PARA LISTAR CATEGORIAS (GET /categories)
    @GetMapping
    public ResponseEntity<List<CategoryResponseDTO>> getUserCategories(
            @AuthenticationPrincipal User loggedUser
    ) {
        List<CategoryResponseDTO> categories = categoryService.getUserCategories(loggedUser);
        return ResponseEntity.ok(categories);
    }
    // ROTA PARA EDITAR CATEGORIA
    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> updateCategory(
            @PathVariable UUID id,
            @RequestBody @Valid CategoryRequestDTO data,
            @AuthenticationPrincipal User loggedUser
    ) {
        CategoryResponseDTO updatedCategory = categoryService.updateCategory(id, data, loggedUser);
        return ResponseEntity.ok(updatedCategory);
    }

    // ROTA PARA EXCLUIR CATEGORIA (SOFT DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable UUID id,
            @AuthenticationPrincipal User loggedUser
    ) {
        categoryService.softDeleteCategory(id, loggedUser);
        return ResponseEntity.noContent().build();
    }
}