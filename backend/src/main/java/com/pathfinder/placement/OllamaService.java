package com.pathfinder.placement;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.net.http.HttpClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class OllamaService {
    private static final Logger logger = LoggerFactory.getLogger(OllamaService.class);

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String model;

    public OllamaService(
            ObjectMapper objectMapper,
            @Value("${ollama.base-url:http://localhost:11434}") String baseUrl,
            @Value("${ollama.model:qwen2.5:3b}") String model) {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(3))
                .build();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(Duration.ofMinutes(3));
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(requestFactory)
                .build();
        this.objectMapper = objectMapper;
        this.model = model;
    }

    public JsonNode completeJson(String systemPrompt, String userPrompt) {
        requireModel();
        Map<String, Object> request = Map.of(
                "model", model,
                "stream", false,
                "format", "json",
                "options", Map.of("temperature", 0.2),
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)));

        JsonNode response;
        try {
            response = restClient.post()
                    .uri("/api/chat")
                    .body(request)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException exception) {
            logger.warn("Ollama request failed ({})", exception.getClass().getSimpleName());
            throw new OllamaUnavailableException();
        }

        String content = response == null
                ? null
                : response.path("message").path("content").asText(null);
        if (!StringUtils.hasText(content)) {
            throw new OllamaUnavailableException();
        }
        try {
            return objectMapper.readTree(content);
        } catch (JsonProcessingException exception) {
            logger.warn("Ollama returned malformed JSON.");
            throw new OllamaUnavailableException();
        }
    }

    public Availability availability() {
        try {
            JsonNode response = restClient.get().uri("/api/tags").retrieve().body(JsonNode.class);
            if (response == null || !response.path("models").isArray()) {
                return new Availability(true, false, model);
            }
            boolean modelAvailable = false;
            for (JsonNode installedModel : response.path("models")) {
                String name = installedModel.path("name").asText();
                if (name.equals(model)) {
                    modelAvailable = true;
                    break;
                }
            }
            return new Availability(true, modelAvailable, model);
        } catch (RestClientException exception) {
            return new Availability(false, false, model);
        }
    }

    public void requireModel() {
        Availability availability = availability();
        if (!availability.ollamaAvailable()) {
            throw new OllamaUnavailableException();
        }
        if (!availability.modelAvailable()) {
            throw new OllamaModelMissingException(model);
        }
    }

    public record Availability(boolean ollamaAvailable, boolean modelAvailable, String model) {}

    public static class OllamaUnavailableException extends RuntimeException {
        public OllamaUnavailableException() {
            super("Ollama is not responding. Start Ollama and retry.");
        }
    }

    public static class OllamaModelMissingException extends RuntimeException {
        public OllamaModelMissingException(String model) {
            super("Ollama model " + model + " is not installed. Run: ollama pull " + model);
        }
    }
}
