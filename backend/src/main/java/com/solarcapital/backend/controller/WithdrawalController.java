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
import com.solarcapital.backend.entity.KYCStatus;
import com.solarcapital.backend.service.CashfreeMockService;
import java.util.HashMap;

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
    @Autowired
    private CashfreeMockService cashfreeMockService; // To be implemented

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

    // Get withdrawal cap information for user
    @GetMapping("/cap-info")
    public ResponseEntity<?> getWithdrawalCapInfo() {
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
            
            // Get monthly withdrawal cap
            BigDecimal monthlyCap = getMonthlyWithdrawalCap();
            
            // Calculate total withdrawals for this month
            YearMonth now = YearMonth.now();
            LocalDateTime start = now.atDay(1).atStartOfDay();
            LocalDateTime end = now.atEndOfMonth().atTime(23,59,59);
            List<WithdrawalRequest> monthlyWithdrawals = withdrawalRequestRepository.findByUserIdAndStatusAndRequestDateBetween(
                user.getId(), "PAID", start, end);
            BigDecimal totalThisMonth = monthlyWithdrawals.stream().map(WithdrawalRequest::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Calculate remaining amount
            BigDecimal remainingAmount = monthlyCap.subtract(totalThisMonth);
            if (remainingAmount.compareTo(BigDecimal.ZERO) < 0) {
                remainingAmount = BigDecimal.ZERO;
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("monthlyCap", monthlyCap);
            response.put("totalWithdrawnThisMonth", totalThisMonth);
            response.put("remainingAmount", remainingAmount);
            response.put("currentMonth", now.getMonth().toString() + " " + now.getYear());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("[ERROR] Exception in getWithdrawalCapInfo: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error getting withdrawal cap info: " + e.getMessage());
        }
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
            System.out.println("[DEBUG] Withdrawal request received: " + request);
            org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("User not authenticated");
            }
            
            Object principal = authentication.getPrincipal();
            if (!(principal instanceof User)) {
                return ResponseEntity.status(401).body("Invalid user principal");
            }
            
            User user = (User) principal;
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            
            // Check KYC status
            if (user.getKycStatus() != KYCStatus.APPROVED) {
                return ResponseEntity.badRequest().body("KYC approval required for withdrawals. Please complete your KYC verification first.");
            }
            
            // Check minimum withdrawal amount
            BigDecimal minWithdrawal = new BigDecimal("100");
            if (amount.compareTo(minWithdrawal) < 0) {
                return ResponseEntity.badRequest().body("Minimum withdrawal amount is ₹" + minWithdrawal);
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
            
            // Create Cashfree payout order
            Map<String, Object> payoutRequest = new HashMap<>();
            payoutRequest.put("orderAmount", amount);
            payoutRequest.put("orderCurrency", "INR");
            payoutRequest.put("customerName", user.getFullName());
            payoutRequest.put("customerEmail", user.getEmail());
            payoutRequest.put("customerPhone", user.getContact() != null ? user.getContact() : "9999999999");
            payoutRequest.put("orderNote", "Withdrawal payout - " + user.getEmail());
            payoutRequest.put("payoutMethod", request.getOrDefault("payoutMethod", "UPI"));
            payoutRequest.put("upiId", request.getOrDefault("upiId", user.getEmail() + "@upi"));
            
            try {
                // Create payout order
                Map<String, Object> cashfreeResponse = cashfreeMockService.createPayoutOrder(payoutRequest);
                
                if (cashfreeResponse.containsKey("status") && "ERROR".equals(cashfreeResponse.get("status"))) {
                    return ResponseEntity.badRequest().body(cashfreeResponse);
                }
                
                String orderId = (String) cashfreeResponse.get("orderId");
                
                // Process payout immediately (like add funds)
                Map<String, Object> payoutStatus = cashfreeMockService.getPayoutStatus(orderId);
                String status = (String) payoutStatus.get("orderStatus");
                
                // Create withdrawal request
                WithdrawalRequest req = new WithdrawalRequest();
                req.setUser(user);
                req.setAmount(amount);
                req.setRequestDate(LocalDateTime.now());
                req.setStatus("SUCCESS".equals(status) ? "PAID" : "FAILED");
                req.setPayoutMethod((String) request.getOrDefault("payoutMethod", "UPI"));
                req.setUpiId((String) request.getOrDefault("upiId", user.getEmail() + "@upi"));
                req.setPaymentReferenceId(orderId);
                
                WithdrawalRequest saved = withdrawalRequestRepository.save(req);
                
                if ("SUCCESS".equals(status)) {
                    // Deduct from wallet
                    CreditTransferLog log = new CreditTransferLog();
                    log.setFromUser(user);
                    log.setAmount(amount);
                    log.setType("WITHDRAWAL");
                    log.setDate(LocalDateTime.now());
                    log.setNotes("Withdrawal processed successfully. Order: " + orderId + " - Status: PAID");
                    creditTransferLogRepository.save(log);
                    
                    // Send success email
                    String emailSubject = "Withdrawal Processed Successfully";
                    String emailBody = String.format(
                        "Dear %s,\n\n" +
                        "Your withdrawal has been processed successfully!\n\n" +
                        "Payout Details:\n" +
                        "- Amount: ₹%s\n" +
                        "- Payment Method: %s\n" +
                        "- Order ID: %s\n" +
                        "- Date: %s\n" +
                        "- Status: PAID\n\n" +
                        "The amount has been transferred to your account. Please check your bank statement.\n\n" +
                        "Thank you for using Solar Capital!\n\n" +
                        "Best regards,\nSolar Capital Team",
                        user.getFullName(),
                        amount.toString(),
                        saved.getPayoutMethod(),
                        orderId,
                        LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm"))
                    );
                    
                    emailService.sendEmail(user.getEmail(), emailSubject, emailBody);
                    
                    System.out.println("[DEBUG] Withdrawal processed successfully: " + orderId);
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "Withdrawal processed successfully! Amount: ₹" + amount);
                    response.put("orderId", orderId);
                    response.put("amount", amount);
                    response.put("status", "PAID");
                    
                    return ResponseEntity.ok(response);
                    
                } else {
                    // Send failure email
                    String emailSubject = "Withdrawal Failed";
                    String emailBody = String.format(
                        "Dear %s,\n\n" +
                        "Your withdrawal request has failed.\n\n" +
                        "Details:\n" +
                        "- Amount: ₹%s\n" +
                        "- Order ID: %s\n" +
                        "- Status: FAILED\n\n" +
                        "No amount has been deducted from your wallet.\n\n" +
                        "If you continue to face issues, please contact our support team.\n\n" +
                        "Best regards,\nSolar Capital Team",
                        user.getFullName(),
                        amount.toString(),
                        orderId
                    );
                    
                    emailService.sendEmail(user.getEmail(), emailSubject, emailBody);
                    
                    System.out.println("[DEBUG] Withdrawal failed: " + orderId);
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", "Withdrawal failed. Please try again.");
                    response.put("orderId", orderId);
                    response.put("amount", amount);
                    response.put("status", "FAILED");
                    
                    return ResponseEntity.ok(response);
                }
                
            } catch (Exception e) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Failed to create payout order: " + e.getMessage());
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
        } catch (Exception e) {
            System.err.println("[ERROR] Exception in requestWithdrawal: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error processing withdrawal request: " + e.getMessage());
        }
    }

    // Process payout (called by webhook or admin)
    @PostMapping("/process-payout")
    public ResponseEntity<?> processPayout(@RequestParam String orderId) {
        try {
            // Get payout status from Cashfree
            Map<String, Object> payoutStatus = cashfreeMockService.getPayoutStatus(orderId);
            
            if (payoutStatus.containsKey("status") && "ERROR".equals(payoutStatus.get("status"))) {
                return ResponseEntity.badRequest().body("Payout order not found");
            }
            
            String status = (String) payoutStatus.get("orderStatus");
            
            // Find withdrawal request by order ID
            List<WithdrawalRequest> withdrawals = withdrawalRequestRepository.findByPaymentReferenceId(orderId);
            if (withdrawals.isEmpty()) {
                return ResponseEntity.badRequest().body("Withdrawal request not found for order: " + orderId);
            }
            
            WithdrawalRequest withdrawal = withdrawals.get(0);
            
            if ("SUCCESS".equals(status)) {
                // Update withdrawal status
                withdrawal.setStatus("PAID");
                withdrawalRequestRepository.save(withdrawal);
                
                // Update transaction log
                List<CreditTransferLog> logs = creditTransferLogRepository.findByFromUserIdAndTypeAndNotesContaining(
                    withdrawal.getUser().getId(), "WITHDRAWAL", orderId);
                
                if (!logs.isEmpty()) {
                    CreditTransferLog log = logs.get(0);
                    log.setNotes("Withdrawal processed successfully. Order: " + orderId + " - Status: PAID");
                    creditTransferLogRepository.save(log);
                }
                
                // Send success email
                String emailSubject = "Withdrawal Processed Successfully";
                String emailBody = String.format(
                    "Dear %s,\n\n" +
                    "Your withdrawal has been processed successfully!\n\n" +
                    "Payout Details:\n" +
                    "- Amount: ₹%s\n" +
                    "- Payment Method: %s\n" +
                    "- Order ID: %s\n" +
                    "- Date: %s\n" +
                    "- Status: PAID\n\n" +
                    "The amount has been transferred to your account. Please check your bank statement.\n\n" +
                    "Thank you for using Solar Capital!\n\n" +
                    "Best regards,\nSolar Capital Team",
                    withdrawal.getUser().getFullName(),
                    withdrawal.getAmount().toString(),
                    withdrawal.getPayoutMethod(),
                    orderId,
                    LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm"))
                );
                
                emailService.sendEmail(withdrawal.getUser().getEmail(), emailSubject, emailBody);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Payout processed successfully");
                response.put("orderId", orderId);
                response.put("status", "PAID");
                
                return ResponseEntity.ok(response);
                
            } else if ("FAILED".equals(status)) {
                // Update withdrawal status
                withdrawal.setStatus("FAILED");
                withdrawalRequestRepository.save(withdrawal);
                
                // Refund the amount back to wallet
                CreditTransferLog refund = new CreditTransferLog();
                refund.setFromUser(null); // System refund
                refund.setToUser(withdrawal.getUser());
                refund.setAmount(withdrawal.getAmount());
                refund.setType("WITHDRAWAL_REFUND");
                refund.setDate(LocalDateTime.now());
                refund.setNotes("Withdrawal failed. Refunded to wallet. Order: " + orderId);
                creditTransferLogRepository.save(refund);
                
                // Send failure email
                String emailSubject = "Withdrawal Failed";
                String emailBody = String.format(
                    "Dear %s,\n\n" +
                    "Your withdrawal request has failed.\n\n" +
                    "Details:\n" +
                    "- Amount: ₹%s\n" +
                    "- Order ID: %s\n" +
                    "- Status: FAILED\n\n" +
                    "The amount has been refunded to your wallet. You can try withdrawing again.\n\n" +
                    "If you continue to face issues, please contact our support team.\n\n" +
                    "Best regards,\nSolar Capital Team",
                    withdrawal.getUser().getFullName(),
                    withdrawal.getAmount().toString(),
                    orderId
                );
                
                emailService.sendEmail(withdrawal.getUser().getEmail(), emailSubject, emailBody);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Payout failed. Amount refunded to wallet.");
                response.put("orderId", orderId);
                response.put("status", "FAILED");
                
                return ResponseEntity.badRequest().body(response);
            }
            
            return ResponseEntity.ok("Payout status: " + status);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error processing payout: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
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
            
            // Sort by requestDate descending (most recent first)
            history.sort((w1, w2) -> {
                if (w1.getRequestDate() == null && w2.getRequestDate() == null) return 0;
                if (w1.getRequestDate() == null) return 1;
                if (w2.getRequestDate() == null) return -1;
                return w2.getRequestDate().compareTo(w1.getRequestDate());
            });
            
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            System.err.println("[ERROR] Exception in getWithdrawalHistory: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching withdrawal history: " + e.getMessage());
        }
    }
} 