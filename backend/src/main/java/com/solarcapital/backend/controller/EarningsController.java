package com.solarcapital.backend.controller;

import com.solarcapital.backend.entity.*;
import com.solarcapital.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/earnings")
public class EarningsController {
    
    @Autowired
    private RewardHistoryRepository rewardHistoryRepository;
    
    @Autowired
    private SubscriptionRepository subscriptionRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // Get user's total earnings summary
    @GetMapping("/summary")
    public ResponseEntity<?> getEarningsSummary() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("User not authenticated");
            }
            
            Object principal = authentication.getPrincipal();
            if (!(principal instanceof User)) {
                return ResponseEntity.status(401).body("Invalid user principal");
            }
            
            User user = (User) principal;
            System.out.println("[DEBUG] Earnings summary for user: " + user.getEmail() + ", ID: " + user.getId());
            
            // Get all successful subscriptions for the user - use user-specific query
            List<Subscription> subscriptions = subscriptionRepository.findByUser(user).stream()
                    .filter(s -> "SUCCESS".equals(s.getPaymentStatus()))
                    .collect(Collectors.toList());
            
            // Get all reward history for the user - use user-specific query
            List<RewardHistory> rewards = rewardHistoryRepository.findByUser(user).stream()
                    .filter(r -> "SUCCESS".equals(r.getStatus()))
                    .collect(Collectors.toList());
            
            System.out.println("[DEBUG] Found " + subscriptions.size() + " subscriptions and " + rewards.size() + " rewards for user: " + user.getEmail());
            
            // Calculate totals
            BigDecimal totalInvestment = subscriptions.stream()
                    .map(s -> s.getProject().getSubscriptionPrice())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal totalEarnings = rewards.stream()
                    .map(RewardHistory::getRewardAmount)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Calculate monthly income (average of last 3 months)
            BigDecimal monthlyIncome = BigDecimal.ZERO;
            if (rewards.size() > 0) {
                // Get recent rewards (last 3 months)
                List<RewardHistory> recentRewards = rewards.stream()
                        .filter(r -> {
                            int currentMonth = LocalDateTime.now().getMonthValue();
                            int currentYear = LocalDateTime.now().getYear();
                            return (r.getYear() == currentYear && r.getMonth() >= currentMonth - 2) ||
                                   (r.getYear() == currentYear - 1 && r.getMonth() >= 10);
                        })
                        .collect(Collectors.toList());
                
                if (recentRewards.size() > 0) {
                    monthlyIncome = recentRewards.stream()
                            .map(RewardHistory::getRewardAmount)
                            .filter(Objects::nonNull)
                            .reduce(BigDecimal.ZERO, BigDecimal::add)
                            .divide(BigDecimal.valueOf(Math.max(1, recentRewards.size())), 2, BigDecimal.ROUND_HALF_UP);
                }
            }
            
            // Calculate investment recovery percentage (how much of investment has been earned back)
            double recoveryPercentage = totalInvestment.compareTo(BigDecimal.ZERO) > 0 
                    ? totalEarnings.divide(totalInvestment, 4, BigDecimal.ROUND_HALF_UP).doubleValue() * 100 
                    : 0.0;
            
            // Calculate annualized return rate (projected)
            double annualizedReturn = 0.0;
            if (subscriptions.size() > 0) {
                // Calculate average months invested
                long totalMonthsInvested = subscriptions.stream()
                        .mapToLong(s -> {
                            long monthsSinceSubscription = java.time.temporal.ChronoUnit.MONTHS.between(
                                s.getSubscribedAt(), 
                                java.time.LocalDateTime.now()
                            );
                            return Math.max(1, monthsSinceSubscription);
                        })
                        .sum();
                
                double avgMonthsInvested = (double) totalMonthsInvested / subscriptions.size();
                
                if (avgMonthsInvested > 0 && totalInvestment.compareTo(BigDecimal.ZERO) > 0) {
                    // Project future earnings based on current monthly rate
                    BigDecimal projectedTotalEarnings = monthlyIncome.multiply(BigDecimal.valueOf(12));
                    BigDecimal projectedProfit = projectedTotalEarnings.subtract(totalInvestment);
                    annualizedReturn = projectedProfit.divide(totalInvestment, 4, BigDecimal.ROUND_HALF_UP)
                            .doubleValue() * (12.0 / avgMonthsInvested) * 100;
                }
            }
            
            Map<String, Object> summary = new HashMap<>();
            summary.put("totalInvestment", totalInvestment);
            summary.put("totalEarnings", totalEarnings);
            summary.put("monthlyIncome", monthlyIncome);
            summary.put("recoveryPercentage", recoveryPercentage);
            summary.put("annualizedReturn", annualizedReturn);
            summary.put("totalSubscriptions", subscriptions.size());
            summary.put("totalRewards", rewards.size());
            
            return ResponseEntity.ok(summary);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error calculating earnings: " + e.getMessage());
        }
    }
    
    // Get project-wise earnings breakdown
    @GetMapping("/project-breakdown")
    public ResponseEntity<?> getProjectEarningsBreakdown() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("User not authenticated");
            }
            
            Object principal = authentication.getPrincipal();
            if (!(principal instanceof User)) {
                return ResponseEntity.status(401).body("Invalid user principal");
            }
            
            User user = (User) principal;
            System.out.println("[DEBUG] Project earnings breakdown for user: " + user.getEmail() + ", ID: " + user.getId());
            
            // Get all successful subscriptions for the user - use user-specific query
            List<Subscription> subscriptions = subscriptionRepository.findByUser(user).stream()
                    .filter(s -> "SUCCESS".equals(s.getPaymentStatus()))
                    .collect(Collectors.toList());
            
            // Get all reward history for the user - use user-specific query
            List<RewardHistory> rewards = rewardHistoryRepository.findByUser(user).stream()
                    .filter(r -> "SUCCESS".equals(r.getStatus()))
                    .collect(Collectors.toList());
            
            System.out.println("[DEBUG] Found " + subscriptions.size() + " subscriptions and " + rewards.size() + " rewards for user: " + user.getEmail());
            
            // Group by project
            Map<Long, Map<String, Object>> projectEarnings = new HashMap<>();
            
            // Process subscriptions
            for (Subscription subscription : subscriptions) {
                Long projectId = subscription.getProject().getId();
                BigDecimal investmentAmount = subscription.getProject().getSubscriptionPrice();
                
                if (!projectEarnings.containsKey(projectId)) {
                    Map<String, Object> projectData = new HashMap<>();
                    projectData.put("projectId", projectId);
                    projectData.put("projectName", subscription.getProject().getName());
                    projectData.put("projectLocation", subscription.getProject().getLocation());
                    projectData.put("energyCapacity", subscription.getProject().getEnergyCapacity());
                    projectData.put("investmentAmount", BigDecimal.ZERO);
                    projectData.put("totalEarnings", BigDecimal.ZERO);
                    projectData.put("totalKwh", 0.0);
                    projectData.put("subscriptionDate", subscription.getSubscribedAt());
                    projectEarnings.put(projectId, projectData);
                }
                
                Map<String, Object> projectData = projectEarnings.get(projectId);
                BigDecimal currentInvestment = (BigDecimal) projectData.get("investmentAmount");
                projectData.put("investmentAmount", currentInvestment.add(investmentAmount));
            }
            
            // Process rewards
            for (RewardHistory reward : rewards) {
                Long projectId = reward.getProject().getId();
                
                if (projectEarnings.containsKey(projectId)) {
                    Map<String, Object> projectData = projectEarnings.get(projectId);
                    BigDecimal currentEarnings = (BigDecimal) projectData.get("totalEarnings");
                    double currentKwh = (Double) projectData.get("totalKwh");
                    
                    projectData.put("totalEarnings", currentEarnings.add(reward.getRewardAmount()));
                    projectData.put("totalKwh", currentKwh + reward.getKWh());
                }
            }
            
            // Calculate recovery percentages and sort by earnings
            List<Map<String, Object>> result = new ArrayList<>();
            for (Map<String, Object> projectData : projectEarnings.values()) {
                BigDecimal investmentAmount = (BigDecimal) projectData.get("investmentAmount");
                BigDecimal totalEarnings = (BigDecimal) projectData.get("totalEarnings");
                
                // Calculate recovery percentage (how much of investment has been earned back)
                double recoveryPercentage = investmentAmount.compareTo(BigDecimal.ZERO) > 0 
                        ? totalEarnings.divide(investmentAmount, 4, BigDecimal.ROUND_HALF_UP).doubleValue() * 100 
                        : 0.0;
                
                // Calculate monthly earnings rate
                BigDecimal monthlyEarnings = BigDecimal.ZERO;
                if (totalEarnings.compareTo(BigDecimal.ZERO) > 0) {
                    // Estimate monthly rate based on total earnings and time
                    // This is a simplified calculation
                    monthlyEarnings = totalEarnings.divide(BigDecimal.valueOf(6), 2, BigDecimal.ROUND_HALF_UP); // Assume 6 months average
                }
                
                projectData.put("recoveryPercentage", recoveryPercentage);
                projectData.put("monthlyEarnings", monthlyEarnings);
                result.add(projectData);
            }
            
            // Sort by total earnings (highest first)
            result.sort((a, b) -> ((BigDecimal) b.get("totalEarnings")).compareTo((BigDecimal) a.get("totalEarnings")));
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error calculating project earnings: " + e.getMessage());
        }
    }
    
    // Get earnings by period (month, quarter, year)
    @GetMapping("/period/{period}")
    public ResponseEntity<?> getEarningsByPeriod(@PathVariable String period) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("User not authenticated");
            }
            
            Object principal = authentication.getPrincipal();
            if (!(principal instanceof User)) {
                return ResponseEntity.status(401).body("Invalid user principal");
            }
            
            User user = (User) principal;
            System.out.println("[DEBUG] Period earnings for user: " + user.getEmail() + ", period: " + period);
            
            // Get current date
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime startDate;
            
            switch (period.toLowerCase()) {
                case "month":
                    startDate = now.minusMonths(1);
                    break;
                case "quarter":
                    startDate = now.minusMonths(3);
                    break;
                case "year":
                    startDate = now.minusYears(1);
                    break;
                default:
                    return ResponseEntity.badRequest().body("Invalid period. Use 'month', 'quarter', or 'year'");
            }
            
            // Get rewards for the period - use user-specific query
            List<RewardHistory> periodRewards = rewardHistoryRepository.findByUser(user).stream()
                    .filter(r -> "SUCCESS".equals(r.getStatus()))
                    .filter(r -> {
                        // Filter by date (simplified - you might want to add date field to RewardHistory)
                        return true; // For now, return all rewards
                    })
                    .collect(Collectors.toList());
            
            BigDecimal periodEarnings = periodRewards.stream()
                    .map(RewardHistory::getRewardAmount)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            Map<String, Object> result = new HashMap<>();
            result.put("period", period);
            result.put("earnings", periodEarnings);
            result.put("rewardCount", periodRewards.size());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error calculating period earnings: " + e.getMessage());
        }
    }
} 