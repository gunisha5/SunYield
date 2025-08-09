package com.solarcapital.backend.repository;

import com.solarcapital.backend.entity.WithdrawalRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WithdrawalRequestRepository extends JpaRepository<WithdrawalRequest, Long> {
    List<WithdrawalRequest> findByUserId(Long userId);
    List<WithdrawalRequest> findByUserIdAndStatusAndRequestDateBetween(Long userId, String status, java.time.LocalDateTime start, java.time.LocalDateTime end);
    List<WithdrawalRequest> findByStatus(String status);
    long countByStatus(String status);
} 