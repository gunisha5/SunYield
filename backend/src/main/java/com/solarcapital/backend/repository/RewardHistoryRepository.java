package com.solarcapital.backend.repository;

import com.solarcapital.backend.entity.RewardHistory;
import com.solarcapital.backend.entity.User;
import com.solarcapital.backend.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RewardHistoryRepository extends JpaRepository<RewardHistory, Long> {
    List<RewardHistory> findByUser(User user);
    List<RewardHistory> findByProjectAndMonthAndYear(Project project, int month, int year);
} 