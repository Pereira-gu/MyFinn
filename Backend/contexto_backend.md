# Contexto Técnico - Backend (MyFinn)

## 1. Arquitetura e Tecnologias
- **Framework:** Spring Boot 3.x com Java 17.
- **Segurança:** Spring Security + JWT (JSON Web Token).
- **Banco de Dados:** PostgreSQL (via JPA/Hibernate).
- **Ambiente:** Dockerizado (Dockerfile e docker-compose.yml na raiz).

## 2. Modelagem de Dados (Entidades)
- **User:** Gerencia autenticação e papéis (`Role`).
- **Category:** Classificações customizadas por usuário.
- **Transaction:** - Armazena valores em centavos (`valueCents`) para precisão.
    - Suporta tipos `income` e `outcome`.
    - Possui lógica de `isPaid` e `isRecurring`.
    - Implementa exclusão lógica (`active = false`).

## 3. Regras de Negócio Críticas
- **Gestão de Parcelas:** Ao criar uma transação com `CREDIT` e número de parcelas > 1, o sistema gera automaticamente as transações futuras, ajustando eventuais restos da divisão na primeira parcela.
- **Recorrência:** Existe um serviço que verifica transações pendentes de repetição baseadas no mês anterior e as cria para o mês atual.
- **Dashboard:** O backend é responsável por consolidar o saldo total, receitas e despesas do mês, garantindo que o cálculo seja feito sobre a base de dados total e não apenas nos dados paginados.

## 4. Estrutura de Integração
- **Base URL:** `/api` (ou conforme configurado no application.properties).
- **Autenticação:** Header `Authorization: Bearer <token>`.
- **Tratamento de Erros:** Padronizado via `GlobalExceptionHandler` retornando o DTO `StandardErrorDTO`.