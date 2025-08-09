package com.solarcapital.backend.controller;

import com.solarcapital.backend.entity.*;
import com.solarcapital.backend.repository.*;
import com.solarcapital.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/engagement")
public class EngagementController {
    @Autowired
    private CreditTransferLogRepository creditTransferLogRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private RewardHistoryRepository rewardHistoryRepository;
    @Autowired
    private EmailService emailService;

    // Helper: get current authenticated user
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        return (User) authentication.getPrincipal();
    }

    // Helper: get user's available credits (same logic as UserWalletController)
    private BigDecimal getUserAvailableCredits(User user) {
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

    // GET /api/engagement/stats
    @GetMapping("/stats")
    public ResponseEntity<?> getEngagementStats() {
        try {
            User user = getCurrentUser();
            
            // Get user's engagement statistics
            List<CreditTransferLog> outgoingTransactions = creditTransferLogRepository.findByFromUserId(user.getId());
            List<CreditTransferLog> incomingTransactions = creditTransferLogRepository.findByToUserId(user.getId());
            
            BigDecimal totalReinvested = outgoingTransactions.stream()
                .filter(t -> "REINVEST".equals(t.getType()))
                .map(CreditTransferLog::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal totalDonated = outgoingTransactions.stream()
                .filter(t -> "DONATE".equals(t.getType()))
                .map(CreditTransferLog::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal totalGifted = outgoingTransactions.stream()
                .filter(t -> "GIFT".equals(t.getType()))
                .map(CreditTransferLog::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal totalReceived = incomingTransactions.stream()
                .filter(t -> "GIFT".equals(t.getType()))
                .map(CreditTransferLog::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalReinvested", totalReinvested.doubleValue());
            stats.put("totalDonated", totalDonated.doubleValue());
            stats.put("totalGifted", totalGifted.doubleValue());
            stats.put("totalReceived", totalReceived.doubleValue());
            stats.put("availableCredits", getUserAvailableCredits(user).doubleValue());
            stats.put("totalTransactions", outgoingTransactions.size() + incomingTransactions.size());
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("[ERROR] Exception in getEngagementStats: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching engagement stats: " + e.getMessage());
        }
    }

    // POST /api/engagement/reinvest
    @PostMapping("/reinvest")
    public ResponseEntity<?> reinvest(@RequestBody Map<String, Object> request) {
        try {
            User user = getCurrentUser();
            Long projectId = Long.valueOf(request.get("projectId").toString());
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            
            Optional<Project> projectOpt = projectRepository.findById(projectId);
            if (projectOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Project not found");
            }
            
            Project project = projectOpt.get();
            BigDecimal availableCredits = getUserAvailableCredits(user);
            
            if (availableCredits.compareTo(amount) < 0) {
                return ResponseEntity.badRequest().body("Insufficient credits. Available: ₹" + availableCredits + ", Requested: ₹" + amount);
            }
            
            // Log transfer
            CreditTransferLog log = new CreditTransferLog();
            log.setFromUser(user);
            log.setProject(project);
            log.setAmount(amount);
            log.setType("REINVEST");
            log.setDate(LocalDateTime.now());
            log.setNotes("Reinvested in project " + project.getName());
            creditTransferLogRepository.save(log);
            
            // Send email notification
            String emailSubject = "Reinvestment Successful - " + project.getName();
            String emailBody = String.format(
                "Dear %s,\n\n" +
                "Your reinvestment has been processed successfully!\n\n" +
                "Reinvestment Details:\n" +
                "- Project: %s\n" +
                "- Amount: ₹%s\n" +
                "- Date: %s\n\n" +
                "Your reinvestment will help expand solar energy generation and increase your future rewards.\n\n" +
                "Thank you for your continued support!\n\n" +
                "Best regards,\nSolar Capital Team",
                user.getFullName(),
                project.getName(),
                amount.toString(),
                LocalDateTime.now().toString()
            );
            
            emailService.sendEmail(user.getEmail(), emailSubject, emailBody);
            
            System.out.println("[DEBUG] User " + user.getEmail() + " reinvested ₹" + amount + " in project " + project.getName());
            
            return ResponseEntity.ok("Reinvested ₹" + amount + " in project " + project.getName());
        } catch (Exception e) {
            System.err.println("[ERROR] Exception in reinvest: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error processing reinvestment: " + e.getMessage());
        }
    }

    // POST /api/engagement/donate
    @PostMapping("/donate")
    public ResponseEntity<?> donate(@RequestBody Map<String, Object> request) {
        try {
            User user = getCurrentUser();
            Long projectId = Long.valueOf(request.get("projectId").toString());
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            
            Optional<Project> projectOpt = projectRepository.findById(projectId);
            if (projectOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Project not found");
            }
            
            Project project = projectOpt.get();
            BigDecimal availableCredits = getUserAvailableCredits(user);
            
            if (availableCredits.compareTo(amount) < 0) {
                return ResponseEntity.badRequest().body("Insufficient credits. Available: ₹" + availableCredits + ", Requested: ₹" + amount);
            }
            
            // Log transfer (from donor)
            CreditTransferLog log = new CreditTransferLog();
            log.setFromUser(user);
            log.setProject(project);
            log.setAmount(amount);
            log.setType("DONATE");
            log.setDate(LocalDateTime.now());
            log.setNotes("Donated to project " + project.getName());
            creditTransferLogRepository.save(log);
            
            // Send email notification to donor
            String emailSubject = "Donation Successful - " + project.getName();
            String emailBody = String.format(
                "Dear %s,\n\n" +
                "Your donation has been processed successfully!\n\n" +
                "Donation Details:\n" +
                "- Project: %s\n" +
                "- Amount: ₹%s\n" +
                "- Date: %s\n\n" +
                "Your generous donation will help expand solar energy infrastructure and support sustainable development.\n\n" +
                "Thank you for making a difference!\n\n" +
                "Best regards,\nSolar Capital Team",
                user.getFullName(),
                project.getName(),
                amount.toString(),
                LocalDateTime.now().toString()
            );
            
            emailService.sendEmail(user.getEmail(), emailSubject, emailBody);
            
            System.out.println("[DEBUG] User " + user.getEmail() + " donated ₹" + amount + " to project " + project.getName());
            
            return ResponseEntity.ok("Donated ₹" + amount + " to project " + project.getName());
        } catch (Exception e) {
            System.err.println("[ERROR] Exception in donate: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error processing donation: " + e.getMessage());
        }
    }

    // POST /api/engagement/gift
    @PostMapping("/gift")
    public ResponseEntity<?> gift(@RequestBody Map<String, Object> request) {
        try {
            User user = getCurrentUser();
            String recipientEmail = request.get("recipientEmail").toString();
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            
            Optional<User> recipientOpt = userRepository.findByEmail(recipientEmail);
            if (recipientOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Recipient not found");
            }
            
            User recipient = recipientOpt.get();
            BigDecimal availableCredits = getUserAvailableCredits(user);
            
            if (availableCredits.compareTo(amount) < 0) {
                return ResponseEntity.badRequest().body("Insufficient credits. Available: ₹" + availableCredits + ", Requested: ₹" + amount);
            }
            
            // Log transfer (single entry representing the gift transaction)
            CreditTransferLog log = new CreditTransferLog();
            log.setFromUser(user);
            log.setToUser(recipient);
            log.setAmount(amount);
            log.setType("GIFT");
            log.setDate(LocalDateTime.now());
            log.setNotes("Gift transaction between " + user.getEmail() + " and " + recipient.getEmail());
            creditTransferLogRepository.save(log);
            
            // Send email notification to sender
            String senderEmailSubject = "Gift Sent Successfully";
            String senderEmailBody = String.format(
                "Dear %s,\n\n" +
                "Your gift has been sent successfully!\n\n" +
                "Gift Details:\n" +
                "- Recipient: %s\n" +
                "- Amount: ₹%s\n" +
                "- Date: %s\n\n" +
                "The recipient has been notified of your generous gift.\n\n" +
                "Thank you for spreading solar energy!\n\n" +
                "Best regards,\nSolar Capital Team",
                user.getFullName(),
                recipient.getFullName(),
                amount.toString(),
                LocalDateTime.now().toString()
            );
            
            emailService.sendEmail(user.getEmail(), senderEmailSubject, senderEmailBody);
            
            // Send email notification to recipient
            String recipientEmailSubject = "Gift Received - Solar Capital";
            String recipientEmailBody = String.format(
                "Dear %s,\n\n" +
                "You have received a gift!\n\n" +
                "Gift Details:\n" +
                "- From: %s\n" +
                "- Amount: ₹%s\n" +
                "- Date: %s\n\n" +
                "The amount has been added to your wallet balance. You can use these funds to invest in solar projects or withdraw them.\n\n" +
                "Thank you for being part of the solar energy community!\n\n" +
                "Best regards,\nSolar Capital Team",
                recipient.getFullName(),
                user.getFullName(),
                amount.toString(),
                LocalDateTime.now().toString()
            );
            
            emailService.sendEmail(recipient.getEmail(), recipientEmailSubject, recipientEmailBody);
            
            System.out.println("[DEBUG] User " + user.getEmail() + " gifted ₹" + amount + " to " + recipient.getEmail());
            
            return ResponseEntity.ok("Gifted ₹" + amount + " to " + recipient.getEmail());
        } catch (Exception e) {
            System.err.println("[ERROR] Exception in gift: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error processing gift: " + e.getMessage());
        }
    }

    // GET /api/engagement/history
    @GetMapping("/history")
    public ResponseEntity<?> getEngagementHistory() {
        try {
            User user = getCurrentUser();
            
            List<CreditTransferLog> outflows = creditTransferLogRepository.findByFromUserId(user.getId());
            List<CreditTransferLog> inflows = creditTransferLogRepository.findByToUserId(user.getId());
            
            // Use a Set to track unique transaction IDs to prevent duplicates
            java.util.Set<Long> processedTransactionIds = new java.util.HashSet<>();
            List<Map<String, Object>> engagementTransactions = new java.util.ArrayList<>();
            
            // Add outgoing engagement transactions (reinvest, donate, gifts sent)
            for (CreditTransferLog transaction : outflows) {
                if (("REINVEST".equals(transaction.getType()) || "DONATE".equals(transaction.getType()) || "GIFT".equals(transaction.getType())) 
                    && !processedTransactionIds.contains(transaction.getId())) {
                    
                    Map<String, Object> transactionMap = new java.util.HashMap<>();
                    transactionMap.put("id", transaction.getId());
                    transactionMap.put("type", transaction.getType());
                    transactionMap.put("amount", transaction.getAmount().doubleValue());
                    transactionMap.put("date", transaction.getDate());
                    transactionMap.put("notes", transaction.getNotes());
                    transactionMap.put("project", transaction.getProject() != null ? Map.of("name", transaction.getProject().getName()) : null);
                    transactionMap.put("direction", "OUTGOING");
                    transactionMap.put("fromUser", Map.of("email", transaction.getFromUser().getEmail(), "fullName", transaction.getFromUser().getFullName()));
                    if (transaction.getToUser() != null) {
                        transactionMap.put("toUser", Map.of("email", transaction.getToUser().getEmail(), "fullName", transaction.getToUser().getFullName()));
                    }
                    
                    engagementTransactions.add(transactionMap);
                    processedTransactionIds.add(transaction.getId());
                }
            }
            
            // Add incoming gift transactions (gifts received)
            for (CreditTransferLog transaction : inflows) {
                if ("GIFT".equals(transaction.getType()) && !processedTransactionIds.contains(transaction.getId())) {
                    
                    Map<String, Object> transactionMap = new java.util.HashMap<>();
                    transactionMap.put("id", transaction.getId());
                    transactionMap.put("type", transaction.getType());
                    transactionMap.put("amount", transaction.getAmount().doubleValue());
                    transactionMap.put("date", transaction.getDate());
                    transactionMap.put("notes", transaction.getNotes());
                    transactionMap.put("project", transaction.getProject() != null ? Map.of("name", transaction.getProject().getName()) : null);
                    transactionMap.put("direction", "INCOMING");
                    transactionMap.put("fromUser", Map.of("email", transaction.getFromUser().getEmail(), "fullName", transaction.getFromUser().getFullName()));
                    if (transaction.getToUser() != null) {
                        transactionMap.put("toUser", Map.of("email", transaction.getToUser().getEmail(), "fullName", transaction.getToUser().getFullName()));
                    }
                    
                    engagementTransactions.add(transactionMap);
                    processedTransactionIds.add(transaction.getId());
                }
            }
            
            // Sort by date descending
            engagementTransactions.sort((a, b) -> {
                java.time.LocalDateTime dateA = (java.time.LocalDateTime) a.get("date");
                java.time.LocalDateTime dateB = (java.time.LocalDateTime) b.get("date");
                return dateB.compareTo(dateA);
            });
            
            return ResponseEntity.ok(engagementTransactions);
        } catch (Exception e) {
            System.err.println("[ERROR] Exception in getEngagementHistory: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching engagement history: " + e.getMessage());
        }
    }
} 