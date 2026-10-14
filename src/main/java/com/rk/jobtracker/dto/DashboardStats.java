package com.rk.jobtracker.dto;

public record DashboardStats(
        long total,
        long wishlist,
        long applied,
        long assessments,
        long interviews,
        long offers,
        long rejections
) {}
