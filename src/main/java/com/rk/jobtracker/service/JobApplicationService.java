package com.rk.jobtracker.service;

import com.rk.jobtracker.dto.DashboardStats;
import com.rk.jobtracker.dto.JobApplicationRequest;
import com.rk.jobtracker.exception.ResourceNotFoundException;
import com.rk.jobtracker.model.ApplicationStatus;
import com.rk.jobtracker.model.JobApplication;
import com.rk.jobtracker.repository.JobApplicationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class JobApplicationService {
    private final JobApplicationRepository repository;

    public JobApplicationService(JobApplicationRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public Page<JobApplication> findAll(String search, ApplicationStatus status, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        String normalizedSearch = (search == null || search.isBlank()) ? null : search.trim();
        return repository.searchApplications(
                normalizedSearch, status,
                PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "applicationDate").and(Sort.by(Sort.Direction.DESC, "id"))));
    }

    @Transactional(readOnly = true)
    public JobApplication findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Application not found: " + id));
    }

    public JobApplication create(JobApplicationRequest request) {
        JobApplication application = new JobApplication();
        apply(application, request);
        return repository.save(application);
    }

    public JobApplication update(Long id, JobApplicationRequest request) {
        JobApplication application = findById(id);
        apply(application, request);
        return repository.save(application);
    }

    public void delete(Long id) {
        JobApplication application = findById(id);
        repository.delete(application);
    }

    @Transactional(readOnly = true)
    public DashboardStats stats() {
        return new DashboardStats(
                repository.count(),
                repository.countByStatus(ApplicationStatus.WISHLIST),
                repository.countByStatus(ApplicationStatus.APPLIED),
                repository.countByStatus(ApplicationStatus.ASSESSMENT),
                repository.countByStatus(ApplicationStatus.INTERVIEW),
                repository.countByStatus(ApplicationStatus.OFFER),
                repository.countByStatus(ApplicationStatus.REJECTED)
        );
    }

    private void apply(JobApplication target, JobApplicationRequest request) {
        target.setCompany(request.company().trim());
        target.setJobTitle(request.jobTitle().trim());
        target.setJobType(clean(request.jobType()));
        target.setLocation(clean(request.location()));
        target.setStatus(request.status());
        target.setApplicationDate(request.applicationDate());
        target.setInterviewDate(request.interviewDate());
        target.setJobUrl(clean(request.jobUrl()));
        target.setNotes(clean(request.notes()));
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
