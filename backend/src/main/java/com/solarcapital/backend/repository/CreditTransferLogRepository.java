package com.solarcapital.backend.repository;

import com.solarcapital.backend.entity.CreditTransferLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CreditTransferLogRepository extends JpaRepository<CreditTransferLog, Long> {
    List<CreditTransferLog> findByFromUserId(Long userId);
    List<CreditTransferLog> findByToUserId(Long userId);
    List<CreditTransferLog> findByProjectId(Long projectId);
    List<CreditTransferLog> findByFromUserIdAndTypeAndNotesContaining(Long userId, String type, String notes);
} 