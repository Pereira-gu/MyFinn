package com.api.myfinn.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails { // <-- A MUDANÇA ESTÁ AQUI: implements UserDetails

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, name = "password_hash")
    private String passwordHash;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // ==========================================================================
    // MÉTODOS OBRIGATÓRIOS DO SPRING SECURITY (Interface UserDetails)
    // ==========================================================================

    // Define as "permissões" do usuário (ex: ADMIN, USER). Por enquanto todos são usuários comuns.
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    // O Spring Security precisa saber qual campo guarda a senha
    @Override
    public String getPassword() {
        return this.passwordHash;
    }

    // O Spring Security precisa saber qual campo usamos para fazer login (no nosso caso, o email)
    @Override
    public String getUsername() {
        return this.email;
    }

    // A conta não está expirada? (Sempre retorna true para o nosso projeto)
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    // A conta não está bloqueada?
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    // As credenciais (senha) não estão expiradas?
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    // O usuário está ativo?
    @Override
    public boolean isEnabled() {
        return true;
    }
}