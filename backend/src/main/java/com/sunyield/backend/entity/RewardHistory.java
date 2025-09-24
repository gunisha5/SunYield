package com.sunyield.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
public class RewardHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    private int month;
    private int year;
    private double kWh;
    private BigDecimal rewardAmount;
    private String status; // e.g., SUCCESS, DECLINED, CAPPED
    private String reason;
    private LocalDateTime createdAt;
    private LocalDate date; // Date when the energy reward was generated

    public RewardHistory() {}

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public int getMonth() { return month; }
    public void setMonth(int month) { this.month = month; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public double getKWh() { return kWh; }
    public void setKWh(double kWh) { this.kWh = kWh; }

    public BigDecimal getRewardAmount() { return rewardAmount; }
    public void setRewardAmount(BigDecimal rewardAmount) { this.rewardAmount = rewardAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
} 