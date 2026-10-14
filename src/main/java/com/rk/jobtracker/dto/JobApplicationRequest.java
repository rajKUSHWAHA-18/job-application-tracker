package com.rk.jobtracker.dto;

import com.rk.jobtracker.model.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record JobApplicationRequest(
        @NotBlank @Size(max = 120) String company,
        @NotBlank @Size(max = 120) String jobTitle,
        @Size(max = 40) String jobType,
        @Size(max = 120) String location,
        @NotNull ApplicationStatus status,
        @NotNull LocalDate applicationDate,
        LocalDate interviewDate,
        @Size(max = 500) String jobUrl,
        @Size(max = 2000) String notes
) {}
