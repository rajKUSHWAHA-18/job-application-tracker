package com.rk.jobtracker.controller;

import com.rk.jobtracker.dto.DashboardStats;
import com.rk.jobtracker.dto.JobApplicationRequest;
import com.rk.jobtracker.model.ApplicationStatus;
import com.rk.jobtracker.model.JobApplication;
import com.rk.jobtracker.service.JobApplicationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {
    private final JobApplicationService service;

    public JobApplicationController(JobApplicationService service) {
        this.service = service;
    }

    @GetMapping
    public Page<JobApplication> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return service.findAll(search, status, page, size);
    }

    @GetMapping("/{id}")
    public JobApplication get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public JobApplication create(@Valid @RequestBody JobApplicationRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public JobApplication update(@PathVariable Long id, @Valid @RequestBody JobApplicationRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/stats")
    public DashboardStats stats() {
        return service.stats();
    }

    @GetMapping("/statuses")
    public Map<String, String> statuses() {
        Map<String, String> result = new java.util.LinkedHashMap<>();
        for (ApplicationStatus status : ApplicationStatus.values()) {
            result.put(status.name(), label(status));
        }
        return result;
    }

    private String label(ApplicationStatus status) {
        String lower = status.name().toLowerCase().replace('_', ' ');
        return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
    }
}
