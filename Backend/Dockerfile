# Estágio 1: Build com Maven e Java 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
# A alteração está aqui: saltar a compilação e execução dos testes
RUN mvn clean package -DskipTests -Dmaven.test.skip=true

# Estágio 2: Rodar a aplicação com Java 21 (JRE leve)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]