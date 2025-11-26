FROM maven:3.9.8-eclipse-temurin-17 AS builder
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src

RUN mvn clean package -Dmaven.test.skip=true

FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=builder /app/target/bookstore.war /app/bookstore.war

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "bookstore.war"]