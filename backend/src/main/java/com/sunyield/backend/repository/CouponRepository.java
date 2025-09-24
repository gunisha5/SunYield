package com.sunyield.backend.repository;

import com.sunyield.backend.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    
    Optional<Coupon> findByCodeIgnoreCase(String code);
    
    List<Coupon> findByIsActiveTrue();
    
    boolean existsByCodeIgnoreCase(String code);
    
    List<Coupon> findByIsActiveTrueAndValidUntilAfter(java.time.LocalDateTime now);
}

