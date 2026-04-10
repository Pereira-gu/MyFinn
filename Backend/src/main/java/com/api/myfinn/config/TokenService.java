package com.api.myfinn.config;

import com.api.myfinn.model.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class TokenService {

    // Lê a senha secreta que acabamos de colocar no application.properties
    @Value("${api.security.token.secret}")
    private String secret;

    // Método para fabricar o Token
    public String generateToken(User user) {
        return Jwts.builder()
                .setSubject(user.getEmail()) // O "dono" do crachá será identificado pelo email
                .setIssuedAt(new Date(System.currentTimeMillis())) // Data e hora atual (momento da criação)
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 2)) // Validade: 2 horas
                .signWith(getSignInKey(), SignatureAlgorithm.HS256) // Assina com a nossa chave secreta
                .compact(); // Transforma tudo numa String de texto (o Token final)
    }

    // Método para ler o Token apresentado pelo usuário e pegar o email dele
    public String validateToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSignInKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject(); // Retorna o email se estiver tudo certo
        } catch (Exception e) {
            return ""; // Se o token for falso, tiver sido alterado ou estiver vencido, retorna vazio
        }
    }

    // Método auxiliar para transformar a nossa frase do application.properties numa chave criptográfica
    private Key getSignInKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
}