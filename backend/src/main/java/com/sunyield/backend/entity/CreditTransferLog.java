package com.sunyield.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
public class CreditTransferLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User fromUser;

    @ManyToOne
    private User toUser; // null for donations/reinvestments

    @ManyToOne
    private Project project; // null for gifts

    private BigDecimal amount;
    private String type; // REINVEST, DONATE, GIFT
    private LocalDateTime date;
    private String notes;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getFromUser() { return fromUser; }
    public void setFromUser(User fromUser) { this.fromUser = fromUser; }
    public User getToUser() { return toUser; }
    public void setToUser(User toUser) { this.toUser = toUser; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
} 