package com.api.myfinn.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

@SpringBootTest
@AutoConfigureMockMvc
class TransactionControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void deveRetornar403AoCriarTransacaoSemAutenticacao() throws Exception {
        // Tenta enviar POST sem token JWT. Deve ser barrado pelo SecurityConfigurations
        mockMvc.perform(MockMvcRequestBuilders.post("/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"description\": \"Tentativa\", \"valueCents\": 1000, \"type\": \"outcome\"}"))
                .andExpect(MockMvcResultMatchers.status().isForbidden());
    }

    @Test
    void deveRetornar403AoAcessarDashboardComTokenInvalido() throws Exception {
        // Envia token malformado para testar o SecurityFilter
        mockMvc.perform(MockMvcRequestBuilders.get("/transactions/dashboard")
                        .header("Authorization", "Bearer token_expirado_ou_invalido"))
                .andExpect(MockMvcResultMatchers.status().isForbidden());
    }
}