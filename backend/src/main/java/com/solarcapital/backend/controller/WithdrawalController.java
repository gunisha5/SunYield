package com.solarcapital.backend.controller;

import com.solarcapital.backend.entity.User;
import com.solarcapital.backend.entity.WithdrawalRequest;
import com.solarcapital.backend.entity.CreditTransferLog;
import com.solarcapital.backend.repository.UserRepository;
import com.solarcapital.backend.repository.WithdrawalRequestRepository;
import com.solarcapital.backend.repository.CreditTransferLogRepository;
import com.solarcapital.backend.repository.RewardHistoryRepository;
import com.solarcapital.backend.repository.SystemConfigRepository;
import com.solarcapital.backend.service.EmailService;
import com.solarcapital.backend.service.SmsService;
import com.solarcapital.backend.service.NotificationService;
import com.solarcapital.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import com.solarcapital.backend.entity.RewardHistory;
import com.solarcapital.backend.entity.SystemConfig;

@RestController
@RequestMapping("/api/withdrawal")
public class WithdrawalController {
    @Autowired
    private WithdrawalRequestRepository withdrawalRequestRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private EmailService emailService;
    @Autowired
    private SmsService smsService;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private CreditTransferLogRepository creditTransferLogRepository;
    @Autowired
    private RewardHistoryRepository rewardHistoryRepository;
    @Autowired
    private SystemConfigRepository systemConfigRepository;
    // @Autowired private CashfreeService cashfreeService; // To be implemented

    // Helper: get monthly withdrawal cap from database
    private BigDecimal getMonthlyWithdrawalCap() {
        Optional<SystemConfig> config = systemConfigRepository.findByConfigKey("MONTHLY_WITHDRAWAL_CAP");
        if (config.isPresent()) {
            try {
                return new BigDecimal(config.get().getConfigValue());
            } catch (NumberFormatException e) {
                System.err.println("[ERROR] Invalid monthly cap value: " + config.get().getConfigValue());
            }
        }
        // Default fallback
        return new BigDecimal("3000");
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
        
        System.out.println("[DEBUG] Balance calculation for user " + user.getEmail() + ":");
        System.out.println("  - Rewards: " + rewards.stream().filter(r -> r.getUser().getId().equals(user.getId()) && "SUCCESS".equals(r.getStatus())).mapToDouble(r -> r.getRewardAmount() != null ? r.getRewardAmount().doubleValue() : 0).sum());
        System.out.println("  - Incoming transfers: " + incomingTransfers.stream().filter(t -> "ADMIN_CREDIT".equals(t.getType()) || "ADD_FUNDS".equals(t.getType()) || "GIFT".equals(t.getType())).mapToDouble(t -> t.getAmount().doubleValue()).sum());
        System.out.println("  - Outflows: " + outflows.stream().filter(o -> "INVESTMENT".equals(o.getType()) || "SUBSCRIPTION".equals(o.getType()) || "WITHDRAWAL".equals(o.getType()) || "REINVEST".equals(o.getType()) || "DONATE".equals(o.getType()) || "GIFT".equals(o.getType())).mapToDouble(o -> o.getAmount().doubleValue()).sum());
        System.out.println("  - Final balance: " + balance);
        
        return balance;
    }

    @PostMapping("/request")
    public ResponseEntity<?> requestWithdrawal(@RequestBody Map<String, Object> request) {
        try {
            org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("User not authenticated");
            }
            
            Object principal = authentication.getPrincipal();
            if (!(principal instanceof User)) {
                return ResponseEntity.status(401).body("Invalid user principal");
            }
            
            User user = (User) principal;
            
            // Get amount from request
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            
            // Check KYC status (required for withdrawal)
            if (user.getKycStatus() == null || !"APPROVED".equalsIgnoreCase(user.getKycStatus().name())) {
                System.out.println("[DEBUG] KYC Status: " + user.getKycStatus());
                return ResponseEntity.badRequest().body("KYC approval required for withdrawal. Current status: " + user.getKycStatus());
            }
            
            // Calculate total withdrawals for this month
            YearMonth now = YearMonth.now();
            LocalDateTime start = now.atDay(1).atStartOfDay();
            LocalDateTime end = now.atEndOfMonth().atTime(23,59,59);
            List<WithdrawalRequest> monthlyWithdrawals = withdrawalRequestRepository.findByUserIdAndStatusAndRequestDateBetween(
                user.getId(), "PAID", start, end);
            BigDecimal totalThisMonth = monthlyWithdrawals.stream().map(WithdrawalRequest::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            
            System.out.println("[DEBUG] Monthly withdrawals: " + totalThisMonth + ", Requested: " + amount + ", Cap: " + getMonthlyWithdrawalCap());
            
            if (totalThisMonth.add(amount).compareTo(getMonthlyWithdrawalCap()) > 0) {
                return ResponseEntity.badRequest().body("Monthly withdrawal cap exceeded. Monthly limit: ₹" + getMonthlyWithdrawalCap() + ", Already withdrawn: ₹" + totalThisMonth);
            }
            
            // Check wallet balance
            BigDecimal availableCredits = getUserAvailableCredits(user);
            System.out.println("[DEBUG] Available credits: " + availableCredits + ", Requested: " + amount);
            
            if (availableCredits.compareTo(amount) < 0) {
                return ResponseEntity.badRequest().body("Insufficient wallet balance. Available: ₹" + availableCredits + ", Requested: ₹" + amount);
            }
            
            // Create withdrawal request
            WithdrawalRequest req = new WithdrawalRequest();
            req.setUser(user);
            req.setAmount(amount);
            req.setRequestDate(LocalDateTime.now());
            req.setStatus("PAID"); // Direct processing
            req.setPayoutMethod("UPI"); // Default to UPI
            req.setUpiId("user@upi"); // Default UPI ID
            req.setPaymentReferenceId("CF" + System.currentTimeMillis()); // Simulated reference
            
            WithdrawalRequest saved = withdrawalRequestRepository.save(req);
            
            // Deduct from wallet by logging outflow
            CreditTransferLog log = new CreditTransferLog();
            log.setFromUser(user);
            log.setAmount(amount);
            log.setType("WITHDRAWAL");
            log.setDate(LocalDateTime.now());
            log.setNotes("Withdrawal processed. Ref: " + saved.getPaymentReferenceId());
            creditTransferLogRepository.save(log);
            
            // Send email notification to user
            String emailSubject = "Withdrawal Processed Successfully";
            String emailBody = String.format(
                "Dear %s,\n\n" +
                "Your withdrawal request has been processed successfully!\n\n" +
                "Withdrawal Details:\n" +
                "- Amount: ₹%s\n" +
                "- Payment Method: %s\n" +
                "- Reference ID: %s\n" +
                "- Date: %s\n" +
                "- Status: PAID\n\n" +
                "The amount has been deducted from your wallet balance and will be transferred to your account shortly.\n\n" +
                "Thank you for using Solar Capital!\n\n" +
                "Best regards,\nSolar Capital Team",
                user.getFullName(),
                amount.toString(),
                saved.getPayoutMethod(),
                saved.getPaymentReferenceId(),
                saved.getRequestDate().toString()
            );
            
            emailService.sendEmail(user.getEmail(), emailSubject, emailBody);
            
            System.out.println("[DEBUG] Withdrawal processed: " + saved.getPaymentReferenceId());
            return ResponseEntity.ok("Withdrawal processed successfully. Reference: " + saved.getPaymentReferenceId());
        } catch (Exception e) {
            System.err.println("[ERROR] Exception in requestWithdrawal: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error processing withdrawal request: " + e.getMessage());
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getWithdrawalHistory() {
        try {
            org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("User not authenticated");
            }
            
            Object principal = authentication.getPrincipal();
            if (!(principal instanceof User)) {
                return ResponseEntity.status(401).body("Invalid user principal");
            }
            
            User user = (User) principal;
            List<WithdrawalRequest> history = withdrawalRequestRepository.findByUserId(user.getId());
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            System.err.println("[ERROR] Exception in getWithdrawalHistory: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching withdrawal history: " + e.getMessage());
        }
    }
} 