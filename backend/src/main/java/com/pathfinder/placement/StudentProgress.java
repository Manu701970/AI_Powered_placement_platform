package com.pathfinder.placement;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "student_progress")
public class StudentProgress {
    @Id
    @Column(name = "session_id", length = 36, nullable = false, updatable = false)
    private String studentUsn;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String completedProblems = "[]";

    @Column(columnDefinition = "TEXT", nullable = false)
    private String assessmentAnswers = "{}";

    @Column(columnDefinition = "TEXT")
    private String practiceSolutions = "{}";

    @Column(nullable = false)
    private Instant updatedAt;

    protected StudentProgress() {}

    public StudentProgress(
            String studentUsn,
            String completedProblems,
            String assessmentAnswers,
            String practiceSolutions) {
        this.studentUsn = studentUsn;
        this.completedProblems = completedProblems;
        this.assessmentAnswers = assessmentAnswers;
        this.practiceSolutions = practiceSolutions;
        this.updatedAt = Instant.now();
    }

    @PrePersist
    @PreUpdate
    void updateTimestamp() {
        updatedAt = Instant.now();
    }

    public String getStudentUsn() {
        return studentUsn;
    }

    public String getCompletedProblems() {
        return completedProblems;
    }

    public String getAssessmentAnswers() {
        return assessmentAnswers;
    }

    public String getPracticeSolutions() {
        return practiceSolutions == null ? "{}" : practiceSolutions;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
