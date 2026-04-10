package com.api.myfinn.service;

import com.api.myfinn.dto.DashboardResponseDTO;
import com.api.myfinn.dto.TransactionRequestDTO;
import com.api.myfinn.dto.TransactionResponseDTO;
import com.api.myfinn.model.Category;
import com.api.myfinn.model.Transaction;
import com.api.myfinn.model.User;
import com.api.myfinn.repository.CategoryRepository;
import com.api.myfinn.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    // ==========================================
    // BUSCAR DADOS DO DASHBOARD
    // ==========================================
    public DashboardResponseDTO getDashboardData(User loggedUser, int month, int year, int page, int size) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDateTime startDate = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime endDate = yearMonth.atEndOfMonth().atTime(23, 59, 59);

        List<Transaction> allMonthTransactions = transactionRepository.findByUserIdAndActiveTrueAndDateBetween(loggedUser.getId(), startDate, endDate);
        int income = allMonthTransactions.stream().filter(t -> t.getType().equals("income")).mapToInt(Transaction::getValueCents).sum();
        int outcome = allMonthTransactions.stream().filter(t -> t.getType().equals("outcome")).mapToInt(Transaction::getValueCents).sum();
        int balance = income - outcome;

        Pageable pageable = PageRequest.of(page, size);
        Page<Transaction> pagedTransactions = transactionRepository.findByUserIdAndActiveTrueAndDateBetweenOrderByDateDesc(loggedUser.getId(), startDate, endDate, pageable);
        Page<TransactionResponseDTO> transactionsPage = pagedTransactions.map(this::convertToResponseDTO);

        return new DashboardResponseDTO(income, outcome, balance, transactionsPage);
    }

    // ==========================================
    // CRIAR (COM PARCELAMENTO DE CARTÃO)
    // ==========================================
    public TransactionResponseDTO createTransaction(TransactionRequestDTO data, User loggedUser) {
        Category category = categoryRepository.findById(data.categoryId())
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada."));
        if (!category.getUser().getId().equals(loggedUser.getId())) {
            throw new IllegalArgumentException("Permissão negada.");
        }

        int qtdParcelas = (data.installments() != null && data.installments() > 0) ? data.installments() : 1;
        boolean isRec = data.isRecurring() != null && data.isRecurring();

        if (data.paymentMethod().equalsIgnoreCase("CREDIT") && qtdParcelas > 1) {
            int valorBase = data.valueCents() / qtdParcelas;
            int resto = data.valueCents() % qtdParcelas;
            Transaction primeiraParcelaSalva = null;

            for (int i = 0; i < qtdParcelas; i++) {
                Transaction t = new Transaction();
                t.setDescription(data.description() + " (" + (i + 1) + "/" + qtdParcelas + ")");
                t.setValueCents(i == 0 ? valorBase + resto : valorBase);
                t.setType(data.type());
                t.setDate(data.date().plusMonths(i));
                t.setIsPaid(i == 0 ? data.isPaid() : false); // Apenas a primeira parcela herda o status de pago
                t.setUser(loggedUser);
                t.setCategory(category);
                t.setPaymentMethod("CREDIT");
                t.setInstallments(qtdParcelas);
                t.setIsRecurring(false); // Parcelamento não é assinatura
                t.setActive(true);

                Transaction saved = transactionRepository.save(t);
                if (i == 0) primeiraParcelaSalva = saved;
            }
            return convertToResponseDTO(primeiraParcelaSalva);

        } else {
            Transaction t = new Transaction();
            t.setDescription(data.description());
            t.setValueCents(data.valueCents());
            t.setType(data.type());
            t.setDate(data.date());
            t.setIsPaid(data.isPaid());
            t.setUser(loggedUser);
            t.setCategory(category);
            t.setPaymentMethod(data.paymentMethod());
            t.setInstallments(1);
            t.setIsRecurring(isRec);
            t.setActive(true);
            return convertToResponseDTO(transactionRepository.save(t));
        }
    }

    // ==========================================
    // EDITAR
    // ==========================================
    public TransactionResponseDTO updateTransaction(UUID id, TransactionRequestDTO data, User loggedUser) {
        Transaction t = transactionRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Não encontrada."));
        if (!t.getUser().getId().equals(loggedUser.getId())) throw new IllegalArgumentException("Permissão negada.");
        Category c = categoryRepository.findById(data.categoryId()).orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada."));

        t.setDescription(data.description());
        t.setValueCents(data.valueCents());
        t.setType(data.type());
        t.setDate(data.date());
        t.setIsPaid(data.isPaid());
        t.setCategory(c);
        t.setPaymentMethod(data.paymentMethod());
        t.setIsRecurring(data.isRecurring() != null ? data.isRecurring() : false);
        return convertToResponseDTO(transactionRepository.save(t));
    }

    // ==========================================
    // ALTERNAR STATUS ("JÁ PAGUEI")
    // ==========================================
    public void togglePaymentStatus(UUID id, User loggedUser) {
        Transaction t = transactionRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Não encontrada."));
        if (!t.getUser().getId().equals(loggedUser.getId())) throw new IllegalArgumentException("Permissão negada.");
        t.setIsPaid(!t.getIsPaid());
        transactionRepository.save(t);
    }

    // ==========================================
    // EXCLUIR (SOFT DELETE)
    // ==========================================
    public void softDeleteTransaction(UUID id, User loggedUser) {
        Transaction t = transactionRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Não encontrada."));
        if (!t.getUser().getId().equals(loggedUser.getId())) throw new IllegalArgumentException("Permissão negada.");
        t.setActive(false);
        transactionRepository.save(t);
    }

    // ==========================================
    // ROBÔ DE ASSINATURAS
    // ==========================================
    public void checkAndCreateRecurring(User user, int month, int year) {
        YearMonth currentMonth = YearMonth.of(year, month);
        LocalDateTime startCurrent = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime endCurrent = currentMonth.atEndOfMonth().atTime(23, 59, 59);

        if (transactionRepository.existsByUserIdAndIsRecurringTrueAndDateBetween(user.getId(), startCurrent, endCurrent)) return;

        YearMonth lastMonth = currentMonth.minusMonths(1);
        LocalDateTime startLast = lastMonth.atDay(1).atStartOfDay();
        LocalDateTime endLast = lastMonth.atEndOfMonth().atTime(23, 59, 59);

        List<Transaction> lastMonthRecurring = transactionRepository.findByUserIdAndActiveTrueAndIsRecurringTrueAndDateBetween(user.getId(), startLast, endLast);

        for (Transaction oldT : lastMonthRecurring) {
            Transaction newT = new Transaction();
            newT.setDescription(oldT.getDescription());
            newT.setValueCents(oldT.getValueCents());
            newT.setType(oldT.getType());
            newT.setDate(oldT.getDate().plusMonths(1));
            newT.setIsPaid(false); // Sempre começa como não pago no mês novo
            newT.setCategory(oldT.getCategory());
            newT.setPaymentMethod(oldT.getPaymentMethod());
            newT.setInstallments(1);
            newT.setIsRecurring(true);
            newT.setActive(true);
            newT.setUser(user);
            transactionRepository.save(newT);
        }
    }

    // ==========================================
    // CONVERTER DTO
    // ==========================================
    private TransactionResponseDTO convertToResponseDTO(Transaction t) {
        return new TransactionResponseDTO(
                t.getId(), t.getDescription(), t.getValueCents(), t.getType(),
                t.getDate(), t.getIsPaid(), t.getCategory().getId(), t.getCategory().getName(),
                t.getPaymentMethod(), t.getInstallments(), t.getIsRecurring()
        );
    }
}