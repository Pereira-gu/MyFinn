package com.api.myfinn.service;

import com.api.myfinn.dto.CategoryRequestDTO;
import com.api.myfinn.dto.CategoryResponseDTO;
import com.api.myfinn.model.Category;
import com.api.myfinn.model.User;
import com.api.myfinn.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public CategoryResponseDTO createCategory(CategoryRequestDTO data, User loggedUser) {
        Category category = new Category();
        category.setName(data.name());
        category.setIcon(data.icon());
        category.setColor(data.color());
        category.setUser(loggedUser);
        Category savedCategory = categoryRepository.save(category);
        return new CategoryResponseDTO(savedCategory.getId(), savedCategory.getName(), savedCategory.getIcon(), savedCategory.getColor()
        );
    }

    public List<CategoryResponseDTO> getUserCategories(User loggedUser) {
        List<Category> categories = categoryRepository.findByUserIdAndActiveTrue(loggedUser.getId());
        return categories.stream()
                .map(cat -> new CategoryResponseDTO(cat.getId(), cat.getName(), cat.getIcon(), cat.getColor()))
                .collect(Collectors.toList());
    }

    public CategoryResponseDTO updateCategory(UUID id, CategoryRequestDTO data, User loggedUser) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada."));
        if (!category.getUser().getId().equals(loggedUser.getId())) {
            throw new IllegalArgumentException("Você não tem permissão para editar esta categoria.");
        }
        category.setName(data.name());
        category.setIcon(data.icon());
        category.setColor(data.color());

        return convertToResponseDTO(categoryRepository.save(category));
    }
    public void softDeleteCategory(UUID id, User loggedUser) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada."));
        if (!category.getUser().getId().equals(loggedUser.getId())) {
            throw new IllegalArgumentException("Você não tem permissão para excluir esta categoria.");
        }
        category.setActive(false);
        categoryRepository.save(category);
    }

    private CategoryResponseDTO convertToResponseDTO(Category category) {
        return new CategoryResponseDTO(
                category.getId(),
                category.getName(),
                category.getIcon(),
                category.getColor()
        );
    }
}