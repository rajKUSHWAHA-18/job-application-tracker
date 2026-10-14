package com.rk.jobtracker.service;

import com.rk.jobtracker.dto.JobApplicationRequest;
import com.rk.jobtracker.model.ApplicationStatus;
import com.rk.jobtracker.model.JobApplication;
import com.rk.jobtracker.repository.JobApplicationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobApplicationServiceTest {
    @Mock
    private JobApplicationRepository repository;

    @InjectMocks
    private JobApplicationService service;

    @Test
    void createTrimsCompanyAndTitleBeforeSaving() {
        JobApplicationRequest request = new JobApplicationRequest(
                "  Example Co  ", "  Java Developer ", "Full-time", "Remote",
                ApplicationStatus.APPLIED, LocalDate.of(2026, 10, 14),
                null, null, null);
        when(repository.save(any(JobApplication.class))).thenAnswer(invocation -> invocation.getArgument(0));

        JobApplication saved = service.create(request);

        assertEquals("Example Co", saved.getCompany());
        assertEquals("Java Developer", saved.getJobTitle());
        assertEquals(ApplicationStatus.APPLIED, saved.getStatus());
        verify(repository).save(any(JobApplication.class));
    }

    @Test
    void findByIdThrowsWhenRecordDoesNotExist() {
        when(repository.findById(44L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.findById(44L));
    }
}
