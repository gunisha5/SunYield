package com.sunyield.backend.controller;

import com.sunyield.backend.entity.Project;
import com.sunyield.backend.entity.Subscription;
import com.sunyield.backend.entity.User;
import com.sunyield.backend.entity.RewardHistory;
import com.sunyield.backend.repository.ProjectRepository;
import com.sunyield.backend.repository.SubscriptionRepository;
import com.sunyield.backend.repository.UserRepository;
import com.sunyield.backend.repository.RewardHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/energy")
public class EnergyController {
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private SubscriptionRepository subscriptionRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RewardHistoryRepository rewardHistoryRepository;

    // Admin: Record monthly kWh for a project and calculate rewards
    @PostMapping("/record")
    public ResponseEntity<?> recordMonthlyKwh(@RequestParam Long projectId, @RequestParam int month, @RequestParam int year, @RequestParam double kWh) {
        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) return ResponseEntity.badRequest().body("Project not found");
        Project project = projectOpt.get();

        // Find all users subscribed to this project
        List<Subscription> subscriptions = subscriptionRepository.findAll();
        double rewardRate = 1.5; // INR per kWh
        double underperformanceThreshold = 10.0; // Example threshold
        double rewardCap = 1000.0; // Example cap in INR

        for (Subscription sub : subscriptions) {
            if (!sub.getProject().getId().equals(projectId) || !"SUCCESS".equals(sub.getPaymentStatus())) continue;
            User user = sub.getUser();
            RewardHistory rh = new RewardHistory();
            rh.setUser(user);
            rh.setProject(project);
            rh.setMonth(month);
            rh.setYear(year);
            rh.setDate(java.time.LocalDate.of(year, month, 1)); // Set date to first day of the month
            rh.setKWh(kWh);
            BigDecimal reward = BigDecimal.valueOf(kWh * rewardRate);
            rh.setRewardAmount(reward);
            rh.setStatus("SUCCESS");
            rh.setReason(null);
            // Underperformance logic
            if (kWh < underperformanceThreshold) {
                rh.setStatus("DECLINED");
                rh.setReason("Project underperformed");
            }
            // Capping logic
            if (reward.doubleValue() > rewardCap) {
                rh.setRewardAmount(BigDecimal.valueOf(rewardCap));
                rh.setStatus("CAPPED");
                rh.setReason("Reward capped at max limit");
            }
            rewardHistoryRepository.save(rh);
        }
        return ResponseEntity.ok("Rewards calculated and logged for all subscribed users.");
    }

    // User: View reward history
    @GetMapping("/rewards/history")
    public ResponseEntity<?> getRewardHistory() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email;
        Object principal = auth.getPrincipal();
        if (principal instanceof com.sunyield.backend.entity.User) {
            email = ((com.sunyield.backend.entity.User) principal).getEmail();
        } else {
            email = principal.toString();
        }
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(401).body("User not found");
        List<RewardHistory> rewards = rewardHistoryRepository.findAll();
        // Filter for this user
        rewards.removeIf(rh -> !rh.getUser().getId().equals(userOpt.get().getId()));
        return ResponseEntity.ok(rewards);
    }
} 