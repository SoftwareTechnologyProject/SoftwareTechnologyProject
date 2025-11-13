# --- Giai đoạn build ---
FROM maven:3.9.8-eclipse-temurin-17 AS builder
WORKDIR /app

# Copy file cấu hình Maven & source code
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src

# Build ra WAR file
RUN mvn clean package -DskipTests

# --- Giai đoạn chạy ---
FROM eclipse-temurin:17-jdk
WORKDIR /app

# Copy file WAR từ build stage sang
COPY --from=builder /app/target/bookstore.war /app/bookstore.war

# Cổng ứng dụng
EXPOSE 8080

# Chạy ứng dụng
ENTRYPOINT ["java", "-jar", "bookstore.war"]