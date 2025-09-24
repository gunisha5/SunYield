package com.sunyield.backend.controller;

import com.sunyield.backend.entity.User;
import com.sunyield.backend.entity.RewardHistory;
import com.sunyield.backend.entity.CreditTransferLog;
import com.sunyield.backend.entity.Subscription;
import com.sunyield.backend.repository.UserRepository;
import com.sunyield.backend.repository.RewardHistoryRepository;
import com.sunyield.backend.repository.CreditTransferLogRepository;
import com.sunyield.backend.repository.SubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.sunyield.backend.service.EmailService;
import java.util.Optional;
import com.sunyield.backend.service.CashfreeMockService;

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
    
    @Autowired
    private CashfreeMockService cashfreeMockService;
    
    // Helper method to get current user from authentication context
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        
        Object principal = authentication.getPrincipal();
        User user = null;
        
        if (principal instanceof User) {
            user = (User) principal;
        } else if (principal instanceof String) {
            String email = (String) principal;
            
            // Handle anonymousUser case
            if ("anonymousUser".equals(email)) {
                throw new RuntimeException("User not authenticated - anonymousUser detected. Please login first.");
            }
            
            // If principal is email string, fetch user from database
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                user = userOpt.get();
            } else {
                throw new RuntimeException("User not found for email: " + email);
            }
        } else {
            throw new RuntimeException("Unexpected principal type: " + principal.getClass().getName());
        }
        
        return user;
    }
    
    // Get wallet data for dashboard
    @GetMapping
    public ResponseEntity<?> getWallet() {
        try {
            User user = getCurrentUser();
            
            // Calculate wallet data
            BigDecimal balance = calculateBalance(user);
            BigDecimal totalEarnings = calculateTotalEarnings(user);
            BigDecimal totalInvested = calculateTotalInvested(user);
            
            
            Map<String, Object> wallet = new HashMap<>();
            wallet.put("id", 1); // Mock ID
            wallet.put("user", user);
            wallet.put("balance", balance.doubleValue());
            wallet.put("totalEarnings", totalEarnings.doubleValue());
            wallet.put("totalInvested", totalInvested.doubleValue());
            
            
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
        
        // Create Cashfree order for adding funds
        Map<String, Object> orderRequest = new HashMap<>();
        orderRequest.put("orderAmount", amount);
        orderRequest.put("orderCurrency", "INR");
        orderRequest.put("customerName", user.getFullName());
        orderRequest.put("customerEmail", user.getEmail());
        orderRequest.put("customerPhone", user.getContact() != null ? user.getContact() : "9999999999");
        orderRequest.put("orderNote", "Add funds to wallet - " + user.getEmail());
        
        try {
            Map<String, Object> cashfreeResponse = cashfreeMockService.createOrder(orderRequest);
            
            if (cashfreeResponse.containsKey("status") && "ERROR".equals(cashfreeResponse.get("status"))) {
                return ResponseEntity.badRequest().body(cashfreeResponse);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orderId", cashfreeResponse.get("orderId"));
            response.put("paymentUrl", cashfreeResponse.get("paymentUrl") + "&userEmail=" + user.getEmail() + "&amount=" + amount);
            response.put("amount", amount);
            response.put("customerName", user.getFullName());
            response.put("customerEmail", user.getEmail());
            response.put("message", "Payment order created successfully. Please complete the payment to add funds to your wallet.");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to create payment order: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Process payment for adding funds (called after successful payment)
    @PostMapping("/add-funds/process-payment")
    public ResponseEntity<?> processAddFundsPayment(@RequestParam String orderId) {
        try {
            
            // Get order status from Cashfree
            Map<String, Object> orderStatus = cashfreeMockService.getOrderStatus(orderId);
            
            if (orderStatus.containsKey("status") && "ERROR".equals(orderStatus.get("status"))) {
                return ResponseEntity.badRequest().body("Order not found");
            }
            
            String paymentStatus = (String) orderStatus.get("orderStatus");
            BigDecimal amount = new BigDecimal(orderStatus.get("orderAmount").toString());
            
            // If status is PENDING, simulate payment processing
            if ("PENDING".equals(paymentStatus)) {
                // Simulate payment processing with success
                Map<String, Object> paymentResult = cashfreeMockService.processPayment(orderId, "CARD", new HashMap<>());
                paymentStatus = (String) paymentResult.get("orderStatus");
            }
            
            if ("SUCCESS".equals(paymentStatus)) {
                // Get current user
                User user = getCurrentUser();
                
                // Create credit transfer log
                CreditTransferLog transfer = new CreditTransferLog();
                transfer.setFromUser(null); // System/admin transfer
                transfer.setToUser(user);
                transfer.setAmount(amount);
                transfer.setType("ADD_FUNDS");
                transfer.setDate(java.time.LocalDateTime.now());
                transfer.setNotes("Funds added via payment gateway. Order: " + orderId);
                
                creditTransferLogRepository.save(transfer);
                
                // Send email notification to user
                String emailSubject = "Funds Added to Your Wallet";
                String emailBody = String.format(
                    "Dear %s,\n\n" +
                    "₹%s has been successfully added to your wallet!\n\n" +
                    "Payment Details:\n" +
                    "- Amount: ₹%s\n" +
                    "- Order ID: %s\n" +
                    "- Date: %s\n" +
                    "- Status: Payment Successful\n\n" +
                    "Your wallet balance has been updated. You can now use these funds for investments.\n\n" +
                    "Thank you for choosing SunYield!\n\n" +
                    "Best regards,\nSunYield Team",
                    user.getFullName(),
                    amount.toString(),
                    amount.toString(),
                    orderId,
                    java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm"))
                );
                
                emailService.sendEmail(user.getEmail(), emailSubject, emailBody);
                
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Funds added successfully to your wallet");
                response.put("amount", amount);
                response.put("orderId", orderId);
                
                return ResponseEntity.ok(response);
                
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Payment was not successful. Status: " + paymentStatus);
                response.put("orderId", orderId);
                
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error processing payment: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Debug endpoint to check orders
    @GetMapping("/debug/orders")
    public ResponseEntity<?> debugOrders() {
        try {
            List<CashfreeMockService.PaymentOrder> orders = cashfreeMockService.getAllOrders();
            Map<String, Object> response = new HashMap<>();
            response.put("totalOrders", orders.size());
            response.put("orders", orders.stream().map(order -> {
                Map<String, Object> orderInfo = new HashMap<>();
                orderInfo.put("orderId", order.getOrderId());
                orderInfo.put("status", order.getStatus());
                orderInfo.put("amount", order.getOrderAmount());
                orderInfo.put("customerEmail", order.getCustomerEmail());
                return orderInfo;
            }).collect(java.util.stream.Collectors.toList()));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Get comprehensive wallet history including all transactions and rewards
    @GetMapping("/history")
    public ResponseEntity<?> getWalletHistory() {
        try {
            User user = getCurrentUser();
            
            // Get all credit transfer transactions
            List<CreditTransferLog> fromTransactions = creditTransferLogRepository.findByFromUserId(user.getId());
            List<CreditTransferLog> toTransactions = creditTransferLogRepository.findByToUserId(user.getId());
            
            // Get all reward history for this user - use user-specific query
            List<RewardHistory> rewards = rewardHistoryRepository.findByUser(user);
            
            
            // Debug: Check for duplicate rewards
            java.util.Set<Long> rewardIds = new java.util.HashSet<>();
            for (RewardHistory reward : rewards) {
                if (rewardIds.contains(reward.getId())) {
                }
                rewardIds.add(reward.getId());
            }
            
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
            java.util.Set<Long> processedRewardIds = new java.util.HashSet<>();
            for (RewardHistory reward : rewards) {
                // Skip if we've already processed this reward ID
                if (processedRewardIds.contains(reward.getId())) {
                    continue;
                }
                processedRewardIds.add(reward.getId());
                
                Map<String, Object> entry = new java.util.HashMap<>();
                entry.put("id", reward.getId());
                entry.put("type", "REWARD");
                entry.put("transactionType", "ENERGY_REWARD");
                entry.put("amount", reward.getRewardAmount() != null ? reward.getRewardAmount().doubleValue() : 0.0);
                
                // Use the createdAt timestamp for accurate time, otherwise use the date field
                if (reward.getCreatedAt() != null) {
                    entry.put("date", reward.getCreatedAt()); // Use actual creation timestamp
                } else if (reward.getDate() != null) {
                    entry.put("date", reward.getDate().atStartOfDay()); // Fallback to date at midnight
                } else {
                    entry.put("date", java.time.LocalDateTime.of(reward.getYear(), reward.getMonth(), 1, 0, 0));
                }
                
                entry.put("notes", reward.getReason());
                entry.put("direction", "INCOMING");
                entry.put("project", reward.getProject() != null ? reward.getProject().getName() : null);
                entry.put("kwh", reward.getKWh());
                entry.put("status", reward.getStatus());
                entry.put("createdAt", reward.getCreatedAt()); // Add createdAt for proper sorting
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
        
        // Add rewards (earnings) - use user-specific query
        List<RewardHistory> rewards = rewardHistoryRepository.findByUser(user);
        for (RewardHistory reward : rewards) {
            if ("SUCCESS".equals(reward.getStatus())) {
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
        
        // Use user-specific query instead of fetching all rewards
        List<RewardHistory> rewards = rewardHistoryRepository.findByUser(user);
        for (RewardHistory reward : rewards) {
            if ("SUCCESS".equals(reward.getStatus())) {
                if (reward.getRewardAmount() != null) {
                    totalEarnings = totalEarnings.add(reward.getRewardAmount());
                }
            }
        }
        
        return totalEarnings;
    }
    
    private BigDecimal calculateTotalInvested(User user) {
        BigDecimal totalInvested = BigDecimal.ZERO;
        
        // Calculate total invested from successful subscriptions (using actual contribution amounts)
        List<Subscription> successfulSubscriptions = subscriptionRepository.findByUser(user);
        System.out.println("[DEBUG] Total Invested Calculation for user " + user.getEmail());
        System.out.println("[DEBUG] Found " + successfulSubscriptions.size() + " subscriptions");
        
        for (Subscription subscription : successfulSubscriptions) {
            if ("SUCCESS".equals(subscription.getPaymentStatus())) {
                BigDecimal contributionAmount = subscription.getContributionAmount();
                if (contributionAmount != null) {
                    totalInvested = totalInvested.add(contributionAmount);
                    System.out.println("[DEBUG] Added subscription contribution: ₹" + contributionAmount + " for project " + subscription.getProject().getName());
                } else {
                    System.out.println("[DEBUG] WARNING: Null contribution amount for subscription " + subscription.getId());
                }
            }
        }
        
        // Add reinvestments from engagement activities
        List<CreditTransferLog> reinvestments = creditTransferLogRepository.findByFromUserId(user.getId());
        System.out.println("[DEBUG] Found " + reinvestments.size() + " credit transfer logs");
        
        for (CreditTransferLog reinvestment : reinvestments) {
            if ("REINVEST".equals(reinvestment.getType()) && reinvestment.getAmount() != null) {
                totalInvested = totalInvested.add(reinvestment.getAmount());
                System.out.println("[DEBUG] Added reinvestment: ₹" + reinvestment.getAmount() + " for project " + (reinvestment.getProject() != null ? reinvestment.getProject().getName() : "Unknown"));
            }
        }
        
        System.out.println("[DEBUG] Final total invested: ₹" + totalInvested);
        return totalInvested;
    }
} 