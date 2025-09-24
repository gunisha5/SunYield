package com.sunyield.backend.repository;

import com.sunyield.backend.entity.KYC;
import com.sunyield.backend.entity.KYCStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface KYCRepository extends JpaRepository<KYC, Long> {
    KYC findByUserId(Long userId);
    List<KYC> findByStatus(KYCStatus status);
    long countByStatus(KYCStatus status);
}