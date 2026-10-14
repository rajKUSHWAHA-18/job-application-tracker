package com.rk.jobtracker.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "job_applications")
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String company;

    @Column(nullable = false, length = 120)
    private String jobTitle;

    @Column(length = 40)
    private String jobType;

    @Column(length = 120)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationStatus status = ApplicationStatus.WISHLIST;

    @Column(nullable = false)
    private LocalDate applicationDate = LocalDate.now();

    private LocalDate interviewDate;

    @Column(length = 500)
    private String jobUrl;

    @Column(length = 2000)
    private String notes;

    public JobApplication() {}

    public Long getId() { return id; }
    public String getCompany() { return company; }
    public String getJobTitle() { return jobTitle; }
    public String getJobType() { return jobType; }
    public String getLocation() { return location; }
    public ApplicationStatus getStatus() { return status; }
    public LocalDate getApplicationDate() { return applicationDate; }
    public LocalDate getInterviewDate() { return interviewDate; }
    public String getJobUrl() { return jobUrl; }
    public String getNotes() { return notes; }

    public void setId(Long id) { this.id = id; }
    public void setCompany(String company) { this.company = company; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public void setJobType(String jobType) { this.jobType = jobType; }
    public void setLocation(String location) { this.location = location; }
    public void setStatus(ApplicationStatus status) { this.status = status; }
    public void setApplicationDate(LocalDate applicationDate) { this.applicationDate = applicationDate; }
    public void setInterviewDate(LocalDate interviewDate) { this.interviewDate = interviewDate; }
    public void setJobUrl(String jobUrl) { this.jobUrl = jobUrl; }
    public void setNotes(String notes) { this.notes = notes; }
}
