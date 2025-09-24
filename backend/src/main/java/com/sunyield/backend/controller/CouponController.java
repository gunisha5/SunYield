package com.sunyield.backend.controller;

import com.sunyield.backend.entity.Coupon;
import com.sunyield.backend.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class CouponController {
    
    @Autowired
    private CouponService couponService;
    

    
    // User endpoints
    @PostMapping("/coupons/validate")
    public ResponseEntity<?> validateCoupon(@RequestBody Map<String, Object> request) {
        String code = (String) request.get("code");
        Double amount = Double.valueOf(request.get("amount").toString());
        
        boolean isValid = couponService.validateCoupon(code, amount);
        
        if (isValid) {
            double discount = couponService.applyCoupon(code, amount);
            return ResponseEntity.ok(Map.of(
                "valid", true,
                "discount", discount,
                "message", "Coupon applied successfully"
            ));
        } else {
            return ResponseEntity.ok(Map.of(
                "valid", false,
                "discount", 0.0,
                "message", "Invalid or expired coupon"
            ));
        }
    }
    
    @GetMapping("/coupons/active")
    public ResponseEntity<List<Coupon>> getActiveCoupons() {
        List<Coupon> coupons = couponService.getAllActiveCoupons();
        return ResponseEntity.ok(coupons);
    }
}
