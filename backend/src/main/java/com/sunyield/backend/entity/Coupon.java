package com.sunyield.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
public class Coupon {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String code;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType;
    
    @Column(nullable = false)
    private Double discountValue;
    
    @Column(name = "min_amount")
    private Double minAmount;
    
    @Column(name = "max_discount")
    private Double maxDiscount;
    
    @Column(name = "max_usage")
    private Integer maxUsage;
    
    @Column(name = "current_usage")
    private Integer currentUsage = 0;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "valid_from")
    private LocalDateTime validFrom;
    
    @Column(name = "valid_until")
    private LocalDateTime validUntil;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum DiscountType {
        PERCENTAGE,
        FIXED
    }
    
    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        return isActive && 
               (validFrom == null || now.isAfter(validFrom)) &&
               (validUntil == null || now.isBefore(validUntil)) &&
               (maxUsage == null || currentUsage < maxUsage);
    }
    
    public double calculateDiscount(double originalAmount) {
        if (!isValid() || originalAmount < (minAmount != null ? minAmount : 0)) {
            return 0;
        }
        
        double discount = 0;
        if (discountType == DiscountType.PERCENTAGE) {
            discount = originalAmount * (discountValue / 100);
            if (maxDiscount != null) {
                discount = Math.min(discount, maxDiscount);
            }
        } else {
            discount = discountValue;
        }
        
        return Math.min(discount, originalAmount);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public DiscountType getDiscountType() {
        return discountType;
    }

    public void setDiscountType(DiscountType discountType) {
        this.discountType = discountType;
    }

    public Double getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(Double discountValue) {
        this.discountValue = discountValue;
    }

    public Double getMinAmount() {
        return minAmount;
    }

    public void setMinAmount(Double minAmount) {
        this.minAmount = minAmount;
    }

    public Double getMaxDiscount() {
        return maxDiscount;
    }

    public void setMaxDiscount(Double maxDiscount) {
        this.maxDiscount = maxDiscount;
    }

    public Integer getMaxUsage() {
        return maxUsage;
    }

    public void setMaxUsage(Integer maxUsage) {
        this.maxUsage = maxUsage;
    }

    public Integer getCurrentUsage() {
        return currentUsage;
    }

    public void setCurrentUsage(Integer currentUsage) {
        this.currentUsage = currentUsage;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getValidFrom() {
        return validFrom;
    }

    public void setValidFrom(LocalDateTime validFrom) {
        this.validFrom = validFrom;
    }

    public LocalDateTime getValidUntil() {
        return validUntil;
    }

    public void setValidUntil(LocalDateTime validUntil) {
        this.validUntil = validUntil;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
