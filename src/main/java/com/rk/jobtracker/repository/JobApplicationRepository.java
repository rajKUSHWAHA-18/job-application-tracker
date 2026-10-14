package com.rk.jobtracker.repository;

import com.rk.jobtracker.model.ApplicationStatus;
import com.rk.jobtracker.model.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    @Query("""
        SELECT j FROM JobApplication j
        WHERE (:status IS NULL OR j.status = :status)
          AND (:search IS NULL OR LOWER(j.company) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(j.jobTitle) LIKE LOWER(CONCAT('%', :search, '%')))
        """)
    Page<JobApplication> searchApplications(
            @Param("search") String search,
            @Param("status") ApplicationStatus status,
            Pageable pageable);

    long countByStatus(ApplicationStatus status);
}
