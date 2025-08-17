package com.solarcapital.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String location;
    private Double energyCapacity;
    private BigDecimal subscriptionPrice;
    private String status; // e.g., ACTIVE, PAUSED
    private String imageUrl; // Path to the uploaded image

    public Project() {}

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Double getEnergyCapacity() { return energyCapacity; }
    public void setEnergyCapacity(Double energyCapacity) { this.energyCapacity = energyCapacity; }

    public BigDecimal getSubscriptionPrice() { return subscriptionPrice; }
    public void setSubscriptionPrice(BigDecimal subscriptionPrice) { this.subscriptionPrice = subscriptionPrice; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
} 