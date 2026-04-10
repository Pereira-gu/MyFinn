package com.api.myfinn.config;

import com.api.myfinn.model.Category;
import com.api.myfinn.model.Transaction;
import com.api.myfinn.model.User;
import com.api.myfinn.repository.CategoryRepository;
import com.api.myfinn.repository.TransactionRepository;
import com.api.myfinn.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Arrays;

@Configuration
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Só cria os dados se a base de dados estiver VAZIA!
        if (userRepository.count() == 0) {
            System.out.println("🌱 A semear dados iniciais para o Portfólio...");

            // 1. Criar o Utilizador "Demo"
            User demoUser = new User();
            demoUser.setName("Visitante Demo");
            demoUser.setEmail("demo@myfinn.com");
            demoUser.setPasswordHash(passwordEncoder.encode("123456")); // Senha encriptada!
            userRepository.save(demoUser);

            // 2. Criar Categorias Bonitas e Coloridas
            Category catSalario = new Category();
            catSalario.setName("Salário"); catSalario.setIcon("💰"); catSalario.setColor("#22c55e"); catSalario.setActive(true); catSalario.setUser(demoUser);

            Category catMoradia = new Category();
            catMoradia.setName("Moradia"); catMoradia.setIcon("🏠"); catMoradia.setColor("#eab308"); catMoradia.setActive(true); catMoradia.setUser(demoUser);

            Category catAlimentacao = new Category();
            catAlimentacao.setName("Alimentação"); catAlimentacao.setIcon("🍔"); catAlimentacao.setColor("#ef4444"); catAlimentacao.setActive(true); catAlimentacao.setUser(demoUser);

            Category catTransporte = new Category();
            catTransporte.setName("Transporte"); catTransporte.setIcon("🚗"); catTransporte.setColor("#3b82f6"); catTransporte.setActive(true); catTransporte.setUser(demoUser);

            Category catLazer = new Category();
            catLazer.setName("Lazer"); catLazer.setIcon("🎬"); catLazer.setColor("#a855f7"); catLazer.setActive(true); catLazer.setUser(demoUser);

            categoryRepository.saveAll(Arrays.asList(catSalario, catMoradia, catAlimentacao, catTransporte, catLazer));

            // 3. Criar Transações Inteligentes (Sempre com base no mês atual!)
            LocalDateTime hoje = LocalDateTime.now();

            // Entrada: Salário do mês atual
            salvarTransacao("Salário Mensal", 350000, "income", hoje.withDayOfMonth(5), true, catSalario, "CASH", 1, false, demoUser);

            // Saídas: Despesas normais do dia-a-dia
            salvarTransacao("Supermercado", 25000, "outcome", hoje.withDayOfMonth(10), true, catAlimentacao, "DEBIT", 1, false, demoUser);
            salvarTransacao("Uber para o trabalho", 1550, "outcome", hoje.withDayOfMonth(12), true, catTransporte, "CREDIT", 1, false, demoUser);
            salvarTransacao("Jantar fora", 4500, "outcome", hoje.withDayOfMonth(15), true, catAlimentacao, "DEBIT", 1, false, demoUser);
            salvarTransacao("Combustível", 6000, "outcome", hoje.withDayOfMonth(18), false, catTransporte, "CREDIT", 1, false, demoUser); // Pendente!

            // Saída: Assinatura (Mês passado e Mês atual para o robô reconhecer)
            salvarTransacao("Netflix", 3990, "outcome", hoje.minusMonths(1).withDayOfMonth(20), true, catLazer, "CREDIT", 1, true, demoUser);
            salvarTransacao("Netflix", 3990, "outcome", hoje.withDayOfMonth(20), true, catLazer, "CREDIT", 1, true, demoUser);

            // Saída: Compra Parcelada (Ex: Um Computador em 3x de 300,00)
            salvarTransacao("Computador Novo (1/3)", 30000, "outcome", hoje.minusMonths(1).withDayOfMonth(10), true, catLazer, "CREDIT", 3, false, demoUser);
            salvarTransacao("Computador Novo (2/3)", 30000, "outcome", hoje.withDayOfMonth(10), true, catLazer, "CREDIT", 3, false, demoUser);
            salvarTransacao("Computador Novo (3/3)", 30000, "outcome", hoje.plusMonths(1).withDayOfMonth(10), false, catLazer, "CREDIT", 3, false, demoUser);

            System.out.println("✅ Dados gerados com sucesso! Utilizador de teste: demo@myfinn.com | Senha: 123456");
        }
    }

    // Função auxiliar para deixar o código mais limpo
    private void salvarTransacao(String desc, Integer valor, String tipo, LocalDateTime data, Boolean pago, Category cat, String metodo, Integer parcelas, Boolean recorrente, User user) {
        Transaction t = new Transaction();
        t.setDescription(desc);
        t.setValueCents(valor);
        t.setType(tipo);
        t.setDate(data);
        t.setIsPaid(pago);
        t.setCategory(cat);
        t.setPaymentMethod(metodo);
        t.setInstallments(parcelas);
        t.setIsRecurring(recorrente);
        t.setActive(true);
        t.setUser(user);
        transactionRepository.save(t);
    }
}