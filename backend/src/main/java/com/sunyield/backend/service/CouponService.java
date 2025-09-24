package com.sunyield.backend.service;

import com.sunyield.backend.entity.Coupon;
import com.sunyield.backend.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CouponService {
    
    @Autowired
    private CouponRepository couponRepository;
    
    public List<Coupon> getAllActiveCoupons() {
        return couponRepository.findByIsActiveTrue();
    }
    
    public Optional<Coupon> getCouponByCode(String code) {
        return couponRepository.findByCodeIgnoreCase(code);
    }
    
    public Coupon createCoupon(Coupon coupon) {
        if (couponRepository.existsByCodeIgnoreCase(coupon.getCode())) {
            throw new RuntimeException("Coupon code already exists");
        }
        return couponRepository.save(coupon);
    }
    
    public Coupon updateCoupon(Long id, Coupon couponDetails) {
        Coupon coupon = couponRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Coupon not found"));
        
        coupon.setName(couponDetails.getName());
        coupon.setDescription(couponDetails.getDescription());
        coupon.setDiscountType(couponDetails.getDiscountType());
        coupon.setDiscountValue(couponDetails.getDiscountValue());
        coupon.setMinAmount(couponDetails.getMinAmount());
        coupon.setMaxDiscount(couponDetails.getMaxDiscount());
        coupon.setMaxUsage(couponDetails.getMaxUsage());
        coupon.setIsActive(couponDetails.getIsActive());
        coupon.setValidFrom(couponDetails.getValidFrom());
        coupon.setValidUntil(couponDetails.getValidUntil());
        
        return couponRepository.save(coupon);
    }
    
    public void deleteCoupon(Long id) {
        couponRepository.deleteById(id);
    }
    
    public boolean validateCoupon(String code, double amount) {
        Optional<Coupon> couponOpt = getCouponByCode(code);
        if (couponOpt.isEmpty()) {
            return false;
        }
        
        Coupon coupon = couponOpt.get();
        return coupon.isValid() && amount >= (coupon.getMinAmount() != null ? coupon.getMinAmount() : 0);
    }
    
    public double applyCoupon(String code, double amount) {
        Optional<Coupon> couponOpt = getCouponByCode(code);
        if (couponOpt.isEmpty()) {
            return 0;
        }
        
        Coupon coupon = couponOpt.get();
        if (!validateCoupon(code, amount)) {
            return 0;
        }
        
        double discount = coupon.calculateDiscount(amount);
        
        // Increment usage count
        coupon.setCurrentUsage(coupon.getCurrentUsage() + 1);
        couponRepository.save(coupon);
        
        return discount;
    }
    
    public void incrementCouponUsage(String code) {
        Optional<Coupon> couponOpt = getCouponByCode(code);
        if (couponOpt.isPresent()) {
            Coupon coupon = couponOpt.get();
            coupon.setCurrentUsage(coupon.getCurrentUsage() + 1);
            couponRepository.save(coupon);
        }
    }
}

