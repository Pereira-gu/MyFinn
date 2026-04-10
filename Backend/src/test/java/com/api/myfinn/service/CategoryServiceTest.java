package com.api.myfinn.service;

import com.api.myfinn.dto.CategoryRequestDTO;
import com.api.myfinn.dto.CategoryResponseDTO;
import com.api.myfinn.model.Category;
import com.api.myfinn.model.User;
import com.api.myfinn.repository.CategoryRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    @Test
    void deveCriarCategoriaComSucesso() {
        User utilizadorLogado = new User();
        utilizadorLogado.setId(UUID.randomUUID());
        utilizadorLogado.setEmail("teste@myfinn.com");
        CategoryRequestDTO pedido = new CategoryRequestDTO("Alimentação", "🍔", "#FF0000");
        Category categoriaGuardada = new Category(UUID.randomUUID(), "Alimentação", "🍔", "#FF0000", utilizadorLogado);
        Mockito.when(categoryRepository.save(Mockito.any(Category.class))).thenReturn(categoriaGuardada);
        CategoryResponseDTO resposta = categoryService.createCategory(pedido, utilizadorLogado);
        Assertions.assertNotNull(resposta.id(), "O ID da categoria não deve ser nulo após a criação");
        Assertions.assertEquals("Alimentação", resposta.name(), "O nome da categoria deve corresponder ao pedido");
        Mockito.verify(categoryRepository, Mockito.times(1)).save(Mockito.any(Category.class));
    }

    @Test
    void deveListarCategoriasDoUtilizadorComSucesso() {
        User utilizadorLogado = new User();
        UUID idUtilizador = UUID.randomUUID();
        utilizadorLogado.setId(idUtilizador);
        Category cat1 = new Category(UUID.randomUUID(), "Transporte", "🚗", "#0000FF", utilizadorLogado);
        Category cat2 = new Category(UUID.randomUUID(), "Lazer", "🎮", "#00FF00", utilizadorLogado);
        Mockito.when(categoryRepository.findByUserId(idUtilizador)).thenReturn(List.of(cat1, cat2));
        List<CategoryResponseDTO> listaResposta = categoryService.getUserCategories(utilizadorLogado);
        Assertions.assertEquals(2, listaResposta.size(), "A lista deve conter exatamente 2 categorias");
        Assertions.assertEquals("Transporte", listaResposta.get(0).name());
        Assertions.assertEquals("Lazer", listaResposta.get(1).name());
    }
}