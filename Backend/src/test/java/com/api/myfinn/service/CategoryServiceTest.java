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
        CategoryRequestDTO pedido = new CategoryRequestDTO("Alimentação", "🍔", "#FF0000");
        // Correção: Adicionado o argumento 'true' para o campo 'active'
        Category categoriaGuardada = new Category(UUID.randomUUID(), "Alimentação", "🍔", "#FF0000", true, utilizadorLogado);

        Mockito.when(categoryRepository.save(Mockito.any(Category.class))).thenReturn(categoriaGuardada);
        CategoryResponseDTO resposta = categoryService.createCategory(pedido, utilizadorLogado);

        Assertions.assertNotNull(resposta.id());
        Assertions.assertEquals("Alimentação", resposta.name());
        Mockito.verify(categoryRepository, Mockito.times(1)).save(Mockito.any(Category.class));
    }

    @Test
    void deveListarCategoriasDoUtilizadorComSucesso() {
        User utilizadorLogado = new User();
        UUID idUtilizador = UUID.randomUUID();
        utilizadorLogado.setId(idUtilizador);

        // Correção: Adicionado o argumento 'true' para o campo 'active'
        Category cat1 = new Category(UUID.randomUUID(), "Transporte", "🚗", "#0000FF", true, utilizadorLogado);
        Category cat2 = new Category(UUID.randomUUID(), "Lazer", "🎮", "#00FF00", true, utilizadorLogado);

        // Correção: Alterado de findByUserId para findByUserIdAndActiveTrue
        Mockito.when(categoryRepository.findByUserIdAndActiveTrue(idUtilizador)).thenReturn(List.of(cat1, cat2));

        List<CategoryResponseDTO> listaResposta = categoryService.getUserCategories(utilizadorLogado);

        Assertions.assertEquals(2, listaResposta.size());
        Assertions.assertEquals("Transporte", listaResposta.get(0).name());
    }
}