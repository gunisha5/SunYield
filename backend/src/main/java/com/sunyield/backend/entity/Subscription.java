package com.sunyield.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
public class Subscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    private LocalDateTime subscribedAt;
    private String paymentStatus; // e.g., PENDING, SUCCESS, FAILED
    private String paymentOrderId;
    private BigDecimal contributionAmount; // User's actual contribution amount
    private BigDecimal reservedCapacity; // Capacity reserved based on contribution
    private String subscriptionType; // FIXED (legacy) or FLEXIBLE (new)

    public Subscription() {}

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public LocalDateTime getSubscribedAt() { return subscribedAt; }
    public void setSubscribedAt(LocalDateTime subscribedAt) { this.subscribedAt = subscribedAt; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getPaymentOrderId() { return paymentOrderId; }
    public void setPaymentOrderId(String paymentOrderId) { this.paymentOrderId = paymentOrderId; }

    public BigDecimal getContributionAmount() { return contributionAmount; }
    public void setContributionAmount(BigDecimal contributionAmount) { this.contributionAmount = contributionAmount; }

    public BigDecimal getReservedCapacity() { return reservedCapacity; }
    public void setReservedCapacity(BigDecimal reservedCapacity) { this.reservedCapacity = reservedCapacity; }

    public String getSubscriptionType() { return subscriptionType; }
    public void setSubscriptionType(String subscriptionType) { this.subscriptionType = subscriptionType; }
} 