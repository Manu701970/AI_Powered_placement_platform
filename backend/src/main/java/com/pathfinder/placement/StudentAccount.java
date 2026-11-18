package com.pathfinder.placement;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.Locale;

@Entity
@Table(name = "student_account")
public class StudentAccount {
    @Id
    @Column(length = 36, nullable = false)
    private String usn;

    protected StudentAccount() {}

    public StudentAccount(String usn) {
        this.usn = normalizeUsn(usn);
    }

    public static String normalizeUsn(String usn) {
        return usn.strip().toUpperCase(Locale.ROOT);
    }
}
