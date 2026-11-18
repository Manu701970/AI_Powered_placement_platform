package com.pathfinder.placement;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@Validated
public class ProgressController {
    private final StudentProgressRepository repository;
    private final StudentAccountRepository studentAccountRepository;
    private final ObjectMapper objectMapper;

    public ProgressController(
            StudentProgressRepository repository,
            StudentAccountRepository studentAccountRepository,
            ObjectMapper objectMapper) {
        this.repository = repository;
        this.studentAccountRepository = studentAccountRepository;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/api/progress/{usn}")
    @Transactional(readOnly = true)
    public ProgressResponse getProgress(
            @PathVariable @Pattern(regexp = "^[A-Za-z0-9][A-Za-z0-9._-]{0,35}$") String usn) {
        String studentUsn = requireEnrolledStudent(usn);
        return repository.findById(studentUsn)
                .map(this::toResponse)
                .orElseGet(() -> new ProgressResponse(studentUsn, List.of(), Map.of(), Map.of()));
    }

    @PutMapping("/api/progress/{usn}")
    @Transactional
    public ProgressResponse saveProgress(
            @PathVariable @Pattern(regexp = "^[A-Za-z0-9][A-Za-z0-9._-]{0,35}$") String usn,
            @Valid @RequestBody ProgressRequest request) {
        String studentUsn = requireEnrolledStudent(usn);
        try {
            String completedProblems = objectMapper.writeValueAsString(request.completedProblems());
            String assessmentAnswers = objectMapper.writeValueAsString(request.assessmentAnswers());
            Map<String, String> practiceSolutions = request.practiceSolutions();
            if (practiceSolutions == null) {
                practiceSolutions = repository.findById(studentUsn)
                        .map(this::readPracticeSolutions)
                        .orElse(Map.of());
            }
            String serializedSolutions = objectMapper.writeValueAsString(practiceSolutions);
            if (serializedSolutions.getBytes(StandardCharsets.UTF_8).length > 60_000) {
                throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE,
                        "Practice drafts are too large to save. Shorten or remove a draft.");
            }
            StudentProgress saved = repository.save(
                    new StudentProgress(
                            studentUsn, completedProblems, assessmentAnswers, serializedSolutions));
            return toResponse(saved);
        } catch (JsonProcessingException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Progress could not be saved.");
        }
    }

    private String requireEnrolledStudent(String usn) {
        String normalizedUsn = StudentAccount.normalizeUsn(usn);
        if (!studentAccountRepository.existsById(normalizedUsn)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Sign in with this USN before saving progress.");
        }
        return normalizedUsn;
    }

    private ProgressResponse toResponse(StudentProgress progress) {
        try {
            List<Integer> completedProblems = objectMapper.readValue(
                    progress.getCompletedProblems(), new TypeReference<>() {});
            Map<String, String> assessmentAnswers = objectMapper.readValue(
                    progress.getAssessmentAnswers(), new TypeReference<>() {});
            Map<String, String> practiceSolutions = readPracticeSolutions(progress);
            return new ProgressResponse(
                    progress.getStudentUsn(), completedProblems, assessmentAnswers, practiceSolutions);
        } catch (JsonProcessingException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Saved progress could not be read.");
        }
    }

    private Map<String, String> readPracticeSolutions(StudentProgress progress) {
        try {
            return objectMapper.readValue(
                    progress.getPracticeSolutions(), new TypeReference<>() {});
        } catch (JsonProcessingException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Saved practice drafts could not be read.");
        }
    }

    public record ProgressRequest(
            @NotNull @Size(max = 100) List<@NotNull Integer> completedProblems,
            @NotNull @Size(max = 50) Map<
                    @Size(max = 80) String,
                    @Size(max = 120) String> assessmentAnswers,
            @Size(max = 15) Map<
                    @NotNull @Size(max = 10) String,
                    @NotNull @Size(max = 15_000) String> practiceSolutions) {}

    public record ProgressResponse(
            String usn,
            List<Integer> completedProblems,
            Map<String, String> assessmentAnswers,
            Map<String, String> practiceSolutions) {}
}
