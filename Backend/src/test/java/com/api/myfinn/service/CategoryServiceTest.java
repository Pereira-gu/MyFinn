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

        // CORREÇÃO: Adicionado o argumento 'true' para testarmos o novo campo isFixed
        CategoryRequestDTO pedido = new CategoryRequestDTO("Alimentação", "🍔", "#FF0000", true);

        // Usei setters aqui para a Entidade para evitar problemas com a ordem dos parâmetros do Construtor
        Category categoriaGuardada = new Category();
        categoriaGuardada.setId(UUID.randomUUID());
        categoriaGuardada.setName("Alimentação");
        categoriaGuardada.setIcon("🍔");
        categoriaGuardada.setColor("#FF0000");
        categoriaGuardada.setActive(true);
        categoriaGuardada.setIsFixed(true); // Simulando que o DB guardou como true
        categoriaGuardada.setUser(utilizadorLogado);

        Mockito.when(categoryRepository.save(Mockito.any(Category.class))).thenReturn(categoriaGuardada);
        CategoryResponseDTO resposta = categoryService.createCategory(pedido, utilizadorLogado);

        Assertions.assertNotNull(resposta.id());
        Assertions.assertEquals("Alimentação", resposta.name());

        // NOVO TESTE: Garantir que o DTO de resposta está a devolver a propriedade isFixed corretamente
        Assertions.assertTrue(resposta.isFixed());

        Mockito.verify(categoryRepository, Mockito.times(1)).save(Mockito.any(Category.class));
    }

    @Test
    void deveListarCategoriasDoUtilizadorComSucesso() {
        User utilizadorLogado = new User();
        UUID idUtilizador = UUID.randomUUID();
        utilizadorLogado.setId(idUtilizador);

        // Instanciando as entidades de forma segura com setters
        Category cat1 = new Category();
        cat1.setId(UUID.randomUUID());
        cat1.setName("Transporte");
        cat1.setIcon("🚗");
        cat1.setColor("#0000FF");
        cat1.setActive(true);
        cat1.setIsFixed(true); // Transporte = Fixo
        cat1.setUser(utilizadorLogado);

        Category cat2 = new Category();
        cat2.setId(UUID.randomUUID());
        cat2.setName("Lazer");
        cat2.setIcon("🎮");
        cat2.setColor("#00FF00");
        cat2.setActive(true);
        cat2.setIsFixed(false); // Lazer = Variável
        cat2.setUser(utilizadorLogado);

        Mockito.when(categoryRepository.findByUserIdAndActiveTrue(idUtilizador)).thenReturn(List.of(cat1, cat2));

        List<CategoryResponseDTO> listaResposta = categoryService.getUserCategories(utilizadorLogado);

        Assertions.assertEquals(2, listaResposta.size());
        Assertions.assertEquals("Transporte", listaResposta.get(0).name());

        // NOVO TESTE: Garantir que a lista diferencia fixas e variáveis
        Assertions.assertTrue(listaResposta.get(0).isFixed());
        Assertions.assertFalse(listaResposta.get(1).isFixed());
    }
}