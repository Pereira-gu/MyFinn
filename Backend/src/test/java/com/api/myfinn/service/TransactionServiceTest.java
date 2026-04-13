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
import java.util.List;
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

    @Test
    void deveCriarTransacaoComSucesso() {
        User usuarioLogado = new User();
        usuarioLogado.setId(UUID.randomUUID());
        UUID categoryId = UUID.randomUUID();
        // Correção: Adicionado o argumento 'true' para o campo 'active'
        Category categoria = new Category(categoryId, "Salário", "💰", "#00FF00", true, usuarioLogado);

        TransactionRequestDTO pedido = new TransactionRequestDTO(
                "Pagamento", 500000, "income", LocalDateTime.now(), true, categoryId, "CASH", 1, false
        );

        // Correção: Adicionado o argumento 'true' para o campo 'active'
        Transaction transacaoSalva = new Transaction(
                UUID.randomUUID(), "Pagamento", 500000, "income", pedido.date(), true, true, usuarioLogado, categoria, "CASH", 1, false
        );

        Mockito.when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(categoria));
        Mockito.when(transactionRepository.save(Mockito.any(Transaction.class))).thenReturn(transacaoSalva);

        TransactionResponseDTO resposta = transactionService.createTransaction(pedido, usuarioLogado);

        Assertions.assertNotNull(resposta.id());
        Assertions.assertEquals("Salário", resposta.categoryName());
        Mockito.verify(transactionRepository, Mockito.times(1)).save(Mockito.any(Transaction.class));
    }

    @Test
    void deveCriarParcelamentoDeCartaoComSucesso() {
        User usuarioLogado = new User();
        usuarioLogado.setId(UUID.randomUUID());
        UUID categoryId = UUID.randomUUID();
        // Correção: Adicionado o argumento 'true' para o campo 'active'
        Category categoria = new Category(categoryId, "Eletrónicos", "💻", "#000", true, usuarioLogado);

        TransactionRequestDTO pedido = new TransactionRequestDTO(
                "Monitor", 10000, "outcome", LocalDateTime.of(2026, 4, 1, 10, 0),
                true, categoryId, "CREDIT", 3, false
        );

        Mockito.when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(categoria));
        Mockito.when(transactionRepository.save(Mockito.any(Transaction.class))).thenAnswer(i -> i.getArguments()[0]);

        TransactionResponseDTO resposta = transactionService.createTransaction(pedido, usuarioLogado);

        Mockito.verify(transactionRepository, Mockito.times(3)).save(Mockito.any(Transaction.class));
        Assertions.assertEquals(3334, resposta.valueCents());
    }

    @Test
    void deveDuplicarTransacoesRecorrentesParaOMesAtual() {
        User user = new User();
        user.setId(UUID.randomUUID());

        Mockito.when(transactionRepository.existsByUserIdAndIsRecurringTrueAndDateBetween(
                Mockito.eq(user.getId()), Mockito.any(), Mockito.any())).thenReturn(false);

        // Correção: Adicionado o argumento 'true' para o campo 'active'
        Category cat = new Category(UUID.randomUUID(), "Assinatura", "📺", "#000", true, user);
        Transaction recorrentePassada = new Transaction();
        recorrentePassada.setDescription("Netflix");
        recorrentePassada.setValueCents(3990);
        recorrentePassada.setIsRecurring(true);
        recorrentePassada.setCategory(cat);
        recorrentePassada.setDate(LocalDateTime.of(2026, 3, 20, 10, 0));

        Mockito.when(transactionRepository.findByUserIdAndActiveTrueAndIsRecurringTrueAndDateBetween(
                Mockito.eq(user.getId()), Mockito.any(), Mockito.any())).thenReturn(List.of(recorrentePassada));

        transactionService.checkAndCreateRecurring(user, 4, 2026);

        Mockito.verify(transactionRepository, Mockito.atLeastOnce()).save(Mockito.any(Transaction.class));
    }
}