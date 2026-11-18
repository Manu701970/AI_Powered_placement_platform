package com.pathfinder.placement;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class PlacementApiApplicationTests {
    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private StudentAccountRepository studentAccountRepository;

    @Test
    void healthReportsApiAndOllamaStatus() {
        ResponseEntity<JsonNode> response = restTemplate.getForEntity("/api/health", JsonNode.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().path("ok").asBoolean()).isTrue();
        assertThat(response.getBody().path("ollamaAvailable").isBoolean()).isTrue();
        assertThat(response.getBody().path("modelAvailable").isBoolean()).isTrue();
    }

    @Test
    void firstLoginNormalizesAndStoresUsn() {
        ResponseEntity<JsonNode> loggedIn = restTemplate.postForEntity(
                "/api/auth/login", Map.of("usn", "test1234"), JsonNode.class);

        assertThat(loggedIn.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(loggedIn.getBody().path("usn").asText()).isEqualTo("TEST1234");
        assertThat(studentAccountRepository.existsById("TEST1234")).isTrue();
    }

    @Test
    void dashboardCountsUniqueStudentsRatherThanLoginAttempts() {
        ResponseEntity<JsonNode> initialCount = restTemplate.getForEntity(
                "/api/dashboard/student-count", JsonNode.class);
        String usn = "C" + UUID.randomUUID().toString().replace("-", "");
        restTemplate.postForEntity("/api/auth/login", Map.of("usn", usn), JsonNode.class);
        restTemplate.postForEntity("/api/auth/login", Map.of("usn", usn), JsonNode.class);
        ResponseEntity<JsonNode> updatedCount = restTemplate.getForEntity(
                "/api/dashboard/student-count", JsonNode.class);

        assertThat(initialCount.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(updatedCount.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(updatedCount.getBody().path("count").asLong())
                .isEqualTo(initialCount.getBody().path("count").asLong() + 1);
    }

    @Test
    void progressCanBeSavedAndLoadedByUsn() {
        String usn = "TEST1234";
        studentAccountRepository.save(new StudentAccount(usn));
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
        Map<String, Object> progress = Map.of(
                "completedProblems", List.of(1, 4, 9),
                "assessmentAnswers", Map.of("hashing", "Storing pairs with fast lookups"),
                "practiceSolutions", Map.of("1", "class Solution { }"));

        ResponseEntity<JsonNode> saved = restTemplate.exchange(
                "/api/progress/" + usn,
                org.springframework.http.HttpMethod.PUT,
                new HttpEntity<>(progress, headers),
                JsonNode.class);
        Map<String, Object> legacyProgress = Map.of(
                "completedProblems", List.of(1, 4, 9),
                "assessmentAnswers", Map.of("hashing", "Storing pairs with fast lookups"));
        restTemplate.exchange(
                "/api/progress/" + usn,
                org.springframework.http.HttpMethod.PUT,
                new HttpEntity<>(legacyProgress, headers),
                JsonNode.class);
        ResponseEntity<JsonNode> loaded = restTemplate.getForEntity(
                "/api/progress/" + usn, JsonNode.class);

        assertThat(saved.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(loaded.getBody().path("completedProblems").toString()).isEqualTo("[1,4,9]");
        assertThat(loaded.getBody().path("assessmentAnswers").path("hashing").asText())
                .isEqualTo("Storing pairs with fast lookups");
        assertThat(loaded.getBody().path("practiceSolutions").path("1").asText())
                .isEqualTo("class Solution { }");
    }

    @Test
    void progressCannotBeReadForUnregisteredUsn() {
        ResponseEntity<JsonNode> response = restTemplate.getForEntity(
                "/api/progress/UNKNOWN1", JsonNode.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}
