package com.sunyield.backend.dto;

import java.math.BigDecimal;

public class ProjectDTO {
    private Long id;
    private String name;
    private String location;
    private Double energyCapacity;
    private BigDecimal minContribution;
    private String efficiency;
    private String projectType;
    private Integer operationalValidityYear;
    private String description;
    private BigDecimal subscriptionPrice; // Legacy field
    private String status;
    private String imageUrl;

    // Constructors
    public ProjectDTO() {}

    public ProjectDTO(Long id, String name, String location, Double energyCapacity, 
                     BigDecimal minContribution, String efficiency, String projectType, 
                     String description, BigDecimal subscriptionPrice, String status, String imageUrl) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.energyCapacity = energyCapacity;
        this.minContribution = minContribution;
        this.efficiency = efficiency;
        this.projectType = projectType;
        this.description = description;
        this.subscriptionPrice = subscriptionPrice;
        this.status = status;
        this.imageUrl = imageUrl;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Double getEnergyCapacity() { return energyCapacity; }
    public void setEnergyCapacity(Double energyCapacity) { this.energyCapacity = energyCapacity; }

    public BigDecimal getMinContribution() { return minContribution; }
    public void setMinContribution(BigDecimal minContribution) { this.minContribution = minContribution; }

    public String getEfficiency() { return efficiency; }
    public void setEfficiency(String efficiency) { this.efficiency = efficiency; }

    public String getProjectType() { return projectType; }
    public void setProjectType(String projectType) { this.projectType = projectType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getSubscriptionPrice() { return subscriptionPrice; }
    public void setSubscriptionPrice(BigDecimal subscriptionPrice) { this.subscriptionPrice = subscriptionPrice; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
