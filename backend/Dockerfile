
# Build stage
FROM maven:3.9.15-eclipse-temurin-25 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn -B package

# Runtime stage
FROM eclipse-temurin:25-jre

WORKDIR /app

COPY --from=build /app/target/placement-api-0.1.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=65.0", "-XX:+UseSerialGC", "-jar", "app.jar"]
