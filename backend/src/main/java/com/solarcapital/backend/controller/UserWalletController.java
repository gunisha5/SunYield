package com.solarcapital.backend.controller;

import com.solarcapital.backend.entity.User;
import com.solarcapital.backend.entity.RewardHistory;
import com.solarcapital.backend.entity.CreditTransferLog;
import com.solarcapital.backend.entity.Subscription;
import com.solarcapital.backend.repository.UserRepository;
import com.solarcapital.backend.repository.RewardHistoryRepository;
import com.solarcapital.backend.repository.CreditTransferLogRepository;
import com.solarcapital.backend.repository.SubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.solarcapital.backend.service.EmailService;

@RestController
@RequestMapping("/api/wallet")
public class UserWalletController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RewardHistoryRepository rewardHistoryRepository;
    
    @Autowired
    private CreditTransferLogRepository creditTransferLogRepository;
    
    @Autowired
    private SubscriptionRepository subscriptionRepository;
    
    @Autowired
    private EmailService emailService;
    
    // Get wallet data for dashboard
    @GetMapping
    public ResponseEntity<?> getWallet() {
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
            System.out.println("[DEBUG] Wallet request for user: " + user.getEmail());
            
            // Calculate wallet data
            BigDecimal balance = calculateBalance(user);
            BigDecimal totalEarnings = calculateTotalEarnings(user);
            BigDecimal totalInvested = calculateTotalInvested(user);
            
            System.out.println("[DEBUG] Calculated values - Balance: " + balance + ", Earnings: " + totalEarnings + ", Invested: " + totalInvested);
            
            Map<String, Object> wallet = new HashMap<>();
            wallet.put("id", 1); // Mock ID
            wallet.put("user", user);
            wallet.put("balance", balance.doubleValue());
            wallet.put("totalEarnings", totalEarnings.doubleValue());
            wallet.put("totalInvested", totalInvested.doubleValue());
            
            System.out.println("[DEBUG] Wallet response: " + wallet);
            
            return ResponseEntity.ok(wallet);
        } catch (Exception e) {
            System.err.println("[ERROR] Exception in getWallet: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error calculating wallet: " + e.getMessage());
        }
    }
    
    // Add funds to wallet
    @PostMapping("/add-funds")
    public ResponseEntity<?> addFunds(@RequestBody Map<String, Object> request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("User not authenticated");
        }
        
        User user = (User) authentication.getPrincipal();
        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        
        // Create credit transfer log
        CreditTransferLog transfer = new CreditTransferLog();
        transfer.setFromUser(null); // System/admin transfer
        transfer.setToUser(user);
        transfer.setAmount(amount);
        transfer.setType("ADD_FUNDS");
        transfer.setDate(java.time.LocalDateTime.now());
        transfer.setNotes("Funds added by user");
        
        creditTransferLogRepository.save(transfer);
        
        // Send email notification to user
        String emailSubject = "Funds Added to Your Wallet";
        String emailBody = String.format(
            "Dear %s,\n\n" +
            "Your wallet has been credited with ₹%s.\n\n" +
            "Transaction Details:\n" +
            "- Amount: ₹%s\n" +
            "- Type: User Added Funds\n" +
            "- Date: %s\n" +
            "- Notes: Funds added by user\n\n" +
            "Your new wallet balance will be updated in your dashboard. You can now use these funds to invest in solar projects or withdraw them.\n\n" +
            "Thank you for choosing Solar Capital!\n\n" +
            "Best regards,\nSolar Capital Team",
            user.getFullName(),
            amount.toString(),
            amount.toString(),
            java.time.LocalDateTime.now().toString()
        );
        
        emailService.sendEmail(user.getEmail(), emailSubject, emailBody);
        
        System.out.println("[DEBUG] User added funds: " + user.getEmail() + " - ₹" + amount);
        
        // Return updated wallet
        return getWallet();
    }
    
    // Get comprehensive wallet history including all transactions and rewards
    @GetMapping("/history")
    public ResponseEntity<?> getWalletHistory() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("User not authenticated");
        }
        
        User user = (User) authentication.getPrincipal();
        
        try {
            // Get all credit transfer transactions
            List<CreditTransferLog> fromTransactions = creditTransferLogRepository.findByFromUserId(user.getId());
            List<CreditTransferLog> toTransactions = creditTransferLogRepository.findByToUserId(user.getId());
            
            // Get all reward history
            List<RewardHistory> rewards = rewardHistoryRepository.findAll().stream()
                .filter(reward -> reward.getUser().getId().equals(user.getId()))
                .collect(java.util.stream.Collectors.toList());
            
            // Use a Set to track unique transaction IDs to prevent duplicates
            java.util.Set<Long> processedTransactionIds = new java.util.HashSet<>();
            List<Map<String, Object>> history = new java.util.ArrayList<>();
            
            // Add outgoing transactions
            for (CreditTransferLog transaction : fromTransactions) {
                if (!processedTransactionIds.contains(transaction.getId())) {
                    Map<String, Object> entry = new java.util.HashMap<>();
                    entry.put("id", transaction.getId());
                    entry.put("type", "TRANSACTION");
                    entry.put("transactionType", transaction.getType());
                    entry.put("amount", transaction.getAmount().doubleValue());
                    entry.put("date", transaction.getDate());
                    entry.put("notes", transaction.getNotes());
                    entry.put("direction", "OUTGOING");
                    entry.put("project", transaction.getProject() != null ? transaction.getProject().getName() : null);
                    history.add(entry);
                    processedTransactionIds.add(transaction.getId());
                }
            }
            
            // Add incoming transactions
            for (CreditTransferLog transaction : toTransactions) {
                if (!processedTransactionIds.contains(transaction.getId())) {
                    Map<String, Object> entry = new java.util.HashMap<>();
                    entry.put("id", transaction.getId());
                    entry.put("type", "TRANSACTION");
                    entry.put("transactionType", transaction.getType());
                    entry.put("amount", transaction.getAmount().doubleValue());
                    entry.put("date", transaction.getDate());
                    entry.put("notes", transaction.getNotes());
                    entry.put("direction", "INCOMING");
                    entry.put("project", transaction.getProject() != null ? transaction.getProject().getName() : null);
                    history.add(entry);
                    processedTransactionIds.add(transaction.getId());
                }
            }
            
            // Add reward transactions
            for (RewardHistory reward : rewards) {
                Map<String, Object> entry = new java.util.HashMap<>();
                entry.put("id", reward.getId());
                entry.put("type", "REWARD");
                entry.put("transactionType", "ENERGY_REWARD");
                entry.put("amount", reward.getRewardAmount() != null ? reward.getRewardAmount().doubleValue() : 0.0);
                entry.put("date", java.time.LocalDateTime.of(reward.getYear(), reward.getMonth(), 1, 0, 0));
                entry.put("notes", reward.getReason());
                entry.put("direction", "INCOMING");
                entry.put("project", reward.getProject() != null ? reward.getProject().getName() : null);
                entry.put("kwh", reward.getKWh());
                entry.put("status", reward.getStatus());
                history.add(entry);
            }
            
            // Sort by date descending (most recent first)
            history.sort((a, b) -> {
                java.time.LocalDateTime dateA = (java.time.LocalDateTime) a.get("date");
                java.time.LocalDateTime dateB = (java.time.LocalDateTime) b.get("date");
                return dateB.compareTo(dateA);
            });
            
            return ResponseEntity.ok(history);
            
        } catch (Exception e) {
            System.err.println("[ERROR] Exception in getWalletHistory: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching wallet history: " + e.getMessage());
        }
    }
    
    private BigDecimal calculateBalance(User user) {
        BigDecimal balance = BigDecimal.ZERO;
        
        // Add rewards (earnings)
        List<RewardHistory> rewards = rewardHistoryRepository.findAll();
        for (RewardHistory reward : rewards) {
            if (reward.getUser().getId().equals(user.getId()) && "SUCCESS".equals(reward.getStatus())) {
                if (reward.getRewardAmount() != null) {
                    balance = balance.add(reward.getRewardAmount());
                }
            }
        }
        
        // Add incoming transfers (admin credits, etc.)
        List<CreditTransferLog> incomingTransfers = creditTransferLogRepository.findByToUserId(user.getId());
        for (CreditTransferLog transfer : incomingTransfers) {
            if ("ADMIN_CREDIT".equals(transfer.getType()) || "ADD_FUNDS".equals(transfer.getType()) || "GIFT".equals(transfer.getType())) {
                balance = balance.add(transfer.getAmount());
            }
        }
        
        // Subtract outflows (investments, withdrawals, engagement activities)
        List<CreditTransferLog> outflows = creditTransferLogRepository.findByFromUserId(user.getId());
        for (CreditTransferLog outflow : outflows) {
            if ("INVESTMENT".equals(outflow.getType()) || "SUBSCRIPTION".equals(outflow.getType()) || 
                "WITHDRAWAL".equals(outflow.getType()) || "REINVEST".equals(outflow.getType()) || 
                "DONATE".equals(outflow.getType()) || "GIFT".equals(outflow.getType())) {
                balance = balance.subtract(outflow.getAmount());
            }
        }
        
        return balance;
    }
    
    private BigDecimal calculateTotalEarnings(User user) {
        BigDecimal totalEarnings = BigDecimal.ZERO;
        
        List<RewardHistory> rewards = rewardHistoryRepository.findAll();
        for (RewardHistory reward : rewards) {
            if (reward.getUser().getId().equals(user.getId()) && "SUCCESS".equals(reward.getStatus())) {
                if (reward.getRewardAmount() != null) {
                    totalEarnings = totalEarnings.add(reward.getRewardAmount());
                }
            }
        }
        
        return totalEarnings;
    }
    
    private BigDecimal calculateTotalInvested(User user) {
        BigDecimal totalInvested = BigDecimal.ZERO;
        
        // Calculate total invested from successful subscriptions
        List<Subscription> successfulSubscriptions = subscriptionRepository.findByUser(user);
        for (Subscription subscription : successfulSubscriptions) {
            if ("SUCCESS".equals(subscription.getPaymentStatus())) {
                totalInvested = totalInvested.add(subscription.getProject().getSubscriptionPrice());
            }
        }
        
        return totalInvested;
    }
} 