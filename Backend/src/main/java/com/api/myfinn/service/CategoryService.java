package com.api.myfinn.service;

import com.api.myfinn.dto.CategoryRequestDTO;
import com.api.myfinn.dto.CategoryResponseDTO;
import com.api.myfinn.model.Category;
import com.api.myfinn.model.User;
import com.api.myfinn.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Transactional
    public CategoryResponseDTO createCategory(CategoryRequestDTO data, User loggedUser) {
        Category category = new Category();
        category.setName(data.name());
        category.setIcon(data.icon());
        category.setColor(data.color());

        // NOVO: Lê o isFixed do DTO. Se vier nulo (frontend antigo), garante que é false.
        category.setIsFixed(data.isFixed() != null ? data.isFixed() : false);

        category.setUser(loggedUser);
        Category savedCategory = categoryRepository.save(category);

        // Usamos o método auxiliar aqui para ficar mais limpo
        return convertToResponseDTO(savedCategory);
    }

    public List<CategoryResponseDTO> getUserCategories(User loggedUser) {
        List<Category> categories = categoryRepository.findByUserIdAndActiveTrue(loggedUser.getId());
        return categories.stream()
                // Usamos a referência do método auxiliar para mapear automaticamente
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponseDTO updateCategory(UUID id, CategoryRequestDTO data, User loggedUser) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada."));

        if (!category.getUser().getId().equals(loggedUser.getId())) {
            throw new IllegalArgumentException("Você não tem permissão para editar esta categoria.");
        }

        category.setName(data.name());
        category.setIcon(data.icon());
        category.setColor(data.color());

        // NOVO: Permite atualizar o status de 'fixo' ao editar a categoria
        category.setIsFixed(data.isFixed() != null ? data.isFixed() : false);

        return convertToResponseDTO(categoryRepository.save(category));
    }

    @Transactional
    public void softDeleteCategory(UUID id, User loggedUser) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada."));

        if (!category.getUser().getId().equals(loggedUser.getId())) {
            throw new IllegalArgumentException("Você não tem permissão para excluir esta categoria.");
        }
        category.setActive(false);
        categoryRepository.save(category);
    }

    // NOVO: Adicionado o 5º parâmetro (isFixed) para bater com o novo Record
    private CategoryResponseDTO convertToResponseDTO(Category category) {
        return new CategoryResponseDTO(
                category.getId(),
                category.getName(),
                category.getIcon(),
                category.getColor(),
                category.getIsFixed() // 👇 Novo campo enviado ao Frontend!
        );
    }
}