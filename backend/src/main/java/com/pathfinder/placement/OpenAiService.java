package com.pathfinder.placement;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.multipart.MultipartFile;

@Service
public class OpenAiService {
    private static final Logger logger = LoggerFactory.getLogger(OpenAiService.class);

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String chatModel;
    private final String transcriptionModel;

    public OpenAiService(
            ObjectMapper objectMapper,
            @Value("${openai.api-key:}") String apiKey,
            @Value("${openai.chat-model:gpt-4o-mini}") String chatModel,
            @Value("${openai.transcription-model:gpt-4o-mini-transcribe}") String transcriptionModel) {
        this.restClient = RestClient.builder()
                .baseUrl("https://api.openai.com/v1")
                .build();
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.chatModel = chatModel;
        this.transcriptionModel = transcriptionModel;
    }

    public JsonNode completeJson(String systemPrompt, String userPrompt) {
        requireApiKey();
        Map<String, Object> request = Map.of(
                "model", chatModel,
                "temperature", 0.2,
                "response_format", Map.of("type", "json_object"),
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)));

        JsonNode response;
        try {
            response = restClient.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException exception) {
            logger.warn("OpenAI chat request failed ({})", exception.getClass().getSimpleName());
            throw new OpenAiUnavailableException();
        }

        String content = response == null
                ? null
                : response.path("choices").path(0).path("message").path("content").asText(null);
        if (!StringUtils.hasText(content)) {
            throw new OpenAiUnavailableException();
        }
        try {
            return objectMapper.readTree(content);
        } catch (JsonProcessingException exception) {
            logger.warn("OpenAI returned malformed JSON feedback.");
            throw new OpenAiUnavailableException();
        }
    }

    public String transcribe(MultipartFile audio) {
        requireApiKey();
        String mediaType = audio.getContentType().split(";", 2)[0].trim().toLowerCase();
        String extension = switch (mediaType) {
            case "audio/mp4" -> "m4a";
            case "audio/mpeg", "audio/mpga" -> "mp3";
            case "audio/wav", "audio/x-wav" -> "wav";
            case "audio/ogg" -> "ogg";
            default -> "webm";
        };
        ByteArrayResource audioResource;
        try {
            audioResource = new ByteArrayResource(audio.getBytes()) {
                @Override
                public String getFilename() {
                    return "interview-answer." + extension;
                }
            };
        } catch (java.io.IOException exception) {
            throw new OpenAiUnavailableException();
        }

        MultipartBodyBuilder body = new MultipartBodyBuilder();
        body.part("file", audioResource)
                .contentType(MediaType.parseMediaType(mediaType));
        body.part("model", transcriptionModel);
        body.part("response_format", "json");

        try {
            JsonNode response = restClient.post()
                    .uri("/audio/transcriptions")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body.build())
                    .retrieve()
                    .body(JsonNode.class);
            String text = response == null ? null : response.path("text").asText(null);
            if (!StringUtils.hasText(text)) {
                throw new OpenAiUnavailableException();
            }
            return text.trim();
        } catch (RestClientException exception) {
            logger.warn("OpenAI audio transcription failed ({})", exception.getClass().getSimpleName());
            throw new OpenAiUnavailableException();
        }
    }

    public void requireApiKey() {
        if (!StringUtils.hasText(apiKey)) {
            throw new OpenAiNotConfiguredException();
        }
    }

    public boolean isConfigured() {
        return StringUtils.hasText(apiKey);
    }

    public static class OpenAiNotConfiguredException extends RuntimeException {
        public OpenAiNotConfiguredException() {
            super("OpenAI is not configured. Add OPENAI_API_KEY to backend/.env and restart the API.");
        }
    }

    public static class OpenAiUnavailableException extends RuntimeException {
        public OpenAiUnavailableException() {
            super("OpenAI could not complete the request. Check the API key, model access, and connection.");
        }
    }
}
