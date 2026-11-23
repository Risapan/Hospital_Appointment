# ---- Build stage: compile the Spring Boot jar ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Download dependencies first so they are cached until pom.xml changes.
COPY pom.xml .
RUN mvn -q -B dependency:go-offline

COPY src ./src
# Tests need a running MongoDB/browser, so they run in CI (GitHub Actions / Jenkins), not in the image build.
RUN mvn -q -B package -DskipTests

# ---- Run stage: small JRE image ----
FROM eclipse-temurin:21-jre
WORKDIR /app

# curl is used by the docker-compose health check.
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/* \
 && useradd --system --uid 1001 --home-dir /app spring

COPY --from=build /app/target/*.jar app.jar
USER spring

ENV SERVER_PORT=8081 \
    JAVA_OPTS=""
EXPOSE 8081
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
