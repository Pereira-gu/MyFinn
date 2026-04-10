package com.api.myfinn.config;

import com.api.myfinn.model.User;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class TokenServiceTest {

    @Autowired
    private TokenService tokenService;

    @Test
    void deveGerarEValidarTokenComSucesso() {
        User usuarioFalso = new User();
        usuarioFalso.setEmail("elonmusk@myfinn.com");

        String tokenGerado = tokenService.generateToken(usuarioFalso);
        String emailRecuperado = tokenService.validateToken(tokenGerado);

        Assertions.assertNotNull(tokenGerado, "O token não deveria ser nulo!");
        Assertions.assertEquals("elonmusk@myfinn.com", emailRecuperado, "O email recuperado do token está diferente do original!");
    }

    @Test
    void deveRetornarVazioQuandoOTokenForInvalido() {
        String tokenFalso = "um.token.totalmente.inventado.e.invalido";

        String emailRecuperado = tokenService.validateToken(tokenFalso);

        Assertions.assertEquals("", emailRecuperado, "Um token falso deve retornar uma string vazia!");
    }
}