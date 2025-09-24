package com.sunyield.backend.repository;

import com.sunyield.backend.entity.Subscription;
import com.sunyield.backend.entity.User;
import com.sunyield.backend.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findByUser(User user);
    List<Subscription> findByProject(Project project);
    List<Subscription> findByPaymentStatus(String paymentStatus);
} 