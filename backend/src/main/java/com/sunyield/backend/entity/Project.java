package com.sunyield.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "project")
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;
    
    @Column(name = "location")
    private String location;
    
    @Column(name = "energy_capacity")
    private Double energyCapacity;
    @Column(name = "min_contribution")
    private BigDecimal minContribution; // Minimum contribution amount (e.g., ₹999)
    
    @Column(name = "efficiency")
    private String efficiency; // HIGH, MEDIUM, LOW
    
    @Column(name = "status")
    private String status; // e.g., ACTIVE, PAUSED
    
    @Column(name = "image_url")
    private String imageUrl; // Path to the uploaded image
    
    @Column(name = "description")
    private String description; // Project description
    
    @Column(name = "project_type")
    private String projectType; // SCHOOL, HOSPITAL, FACTORY, etc.
    
    @Column(name = "operational_validity_year")
    private Integer operationalValidityYear; // Operational validity year
    
    // Legacy field - keeping for backward compatibility
    @Column(name = "subscription_price")
    private BigDecimal subscriptionPrice;

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

    public BigDecimal getMinContribution() { return minContribution; }
    public void setMinContribution(BigDecimal minContribution) { this.minContribution = minContribution; }

    public String getEfficiency() { return efficiency; }
    public void setEfficiency(String efficiency) { this.efficiency = efficiency; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getProjectType() { return projectType; }
    public void setProjectType(String projectType) { this.projectType = projectType; }
    
    public Integer getOperationalValidityYear() { return operationalValidityYear; }
    public void setOperationalValidityYear(Integer operationalValidityYear) { this.operationalValidityYear = operationalValidityYear; }
    
    // Solar Capital fields - v2
} 