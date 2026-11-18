package com.pathfinder.placement;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class StudentAuthController {
    private final StudentAccountRepository repository;

    public StudentAuthController(StudentAccountRepository repository) {
        this.repository = repository;
    }

    @PostMapping("/api/auth/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        String usn = StudentAccount.normalizeUsn(request.usn());
        repository.findById(usn).orElseGet(() -> repository.save(new StudentAccount(usn)));
        return new LoginResponse(usn);
    }

    public record LoginRequest(
            @NotBlank
            @Size(max = 36)
            @Pattern(regexp = "^[A-Za-z0-9][A-Za-z0-9._-]{0,35}$")
            String usn) {}

    public record LoginResponse(String usn) {}
}
