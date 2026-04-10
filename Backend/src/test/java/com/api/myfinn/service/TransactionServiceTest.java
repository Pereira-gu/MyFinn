package com.api.myfinn.service;

import com.api.myfinn.dto.TransactionRequestDTO;
import com.api.myfinn.dto.TransactionResponseDTO;
import com.api.myfinn.model.Category;
import com.api.myfinn.model.Transaction;
import com.api.myfinn.model.User;
import com.api.myfinn.repository.CategoryRepository;
import com.api.myfinn.repository.TransactionRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {
    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private TransactionService transactionService;

    // TESTE 1: O Caminho Feliz
    @Test
    void deveCriarTransacaoComSucesso() {
        User usuarioLogado = new User();
        usuarioLogado.setId(UUID.randomUUID());
        UUID categoryId = UUID.randomUUID();
        Category categoria = new Category(categoryId, "Salário", "💰", "#00FF00", usuarioLogado);
        TransactionRequestDTO pedido = new TransactionRequestDTO(
                "Pagamento da empresa",
                500000,
                "income",
                LocalDateTime.now(),
                true,
                categoryId
        );

        Transaction transacaoSalva = new Transaction(
                UUID.randomUUID(), "Pagamento da empresa", 500000, "income", pedido.date(), true, usuarioLogado, categoria
        );

        Mockito.when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(categoria));
        Mockito.when(transactionRepository.save(Mockito.any(Transaction.class))).thenReturn(transacaoSalva);
        TransactionResponseDTO resposta = transactionService.createTransaction(pedido, usuarioLogado);
        Assertions.assertNotNull(resposta.id(), "O ID da transação não deve ser nulo");
        Assertions.assertEquals("Pagamento da empresa", resposta.description());
        Assertions.assertEquals(500000, resposta.valueCents());
        Assertions.assertEquals("Salário", resposta.categoryName(), "Deveria ter trazido o nome da categoria atrelada");
        Mockito.verify(transactionRepository, Mockito.times(1)).save(Mockito.any(Transaction.class));
    }

    // TESTE 2: A Nossa Regra de Segurança!
    @Test
    void naoDeveCriarTransacaoSeCategoriaForDeOutroUsuario() {
        User usuarioLogado = new User();
        usuarioLogado.setId(UUID.randomUUID());
        User hacker = new User();
        hacker.setId(UUID.randomUUID());
        UUID categoryId = UUID.randomUUID();
        Category categoriaDoHacker = new Category(categoryId, "Lazer", "🎮", "#FF0000", hacker);
        TransactionRequestDTO pedido = new TransactionRequestDTO(
                "Tentativa de golpe", 25000, "outcome", LocalDateTime.now(), true, categoryId
        );

        Mockito.when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(categoriaDoHacker));
        IllegalArgumentException excecao = Assertions.assertThrows(IllegalArgumentException.class, () -> {
            transactionService.createTransaction(pedido, usuarioLogado);
        });
        Assertions.assertEquals("Você não tem permissão para usar esta categoria.", excecao.getMessage());
        Mockito.verify(transactionRepository, Mockito.never()).save(Mockito.any(Transaction.class));
    }
}