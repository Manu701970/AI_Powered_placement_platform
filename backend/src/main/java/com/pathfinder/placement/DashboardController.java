package com.pathfinder.placement;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DashboardController {
    private final StudentAccountRepository studentAccountRepository;

    public DashboardController(StudentAccountRepository studentAccountRepository) {
        this.studentAccountRepository = studentAccountRepository;
    }

    @GetMapping("/api/dashboard/student-count")
    public StudentCountResponse getStudentCount() {
        return new StudentCountResponse(studentAccountRepository.count());
    }

    public record StudentCountResponse(long count) {}
}
