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
import java.util.Optional;
import com.solarcapital.backend.service.CashfreeMockService;
import java.util.List;

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
            System.out.println("[DEBUG] Wallet request for user: " + user.getEmail() + ", ID: " + user.getId());
            
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
        
        // Create Cashfree order for adding funds
        Map<String, Object> orderRequest = new HashMap<>();
        orderRequest.put("orderAmount", amount);
        orderRequest.put("orderCurrency", "INR");
        orderRequest.put("customerName", user.getFullName());
        orderRequest.put("customerEmail", user.getEmail());
        orderRequest.put("customerPhone", user.getContact() != null ? user.getContact() : "9999999999");
        orderRequest.put("orderNote", "Add funds to wallet - " + user.getEmail());
        
        try {
            System.out.println("[DEBUG] Creating Cashfree order with request: " + orderRequest);
            Map<String, Object> cashfreeResponse = cashfreeMockService.createOrder(orderRequest);
            System.out.println("[DEBUG] Cashfree response: " + cashfreeResponse);
            
            if (cashfreeResponse.containsKey("status") && "ERROR".equals(cashfreeResponse.get("status"))) {
                System.out.println("[DEBUG] Error creating order: " + cashfreeResponse);
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
            System.out.println("[DEBUG] Processing payment for order: " + orderId);
            
            // Get order status from Cashfree
            Map<String, Object> orderStatus = cashfreeMockService.getOrderStatus(orderId);
            System.out.println("[DEBUG] Order status response: " + orderStatus);
            
            if (orderStatus.containsKey("status") && "ERROR".equals(orderStatus.get("status"))) {
                System.out.println("[DEBUG] Order not found: " + orderId);
                return ResponseEntity.badRequest().body("Order not found");
            }
            
            String paymentStatus = (String) orderStatus.get("orderStatus");
            BigDecimal amount = new BigDecimal(orderStatus.get("orderAmount").toString());
            System.out.println("[DEBUG] Payment status: " + paymentStatus + ", Amount: " + amount);
            
            // If status is PENDING, simulate payment processing
            if ("PENDING".equals(paymentStatus)) {
                System.out.println("[DEBUG] Processing pending payment...");
                // Simulate payment processing with success
                Map<String, Object> paymentResult = cashfreeMockService.processPayment(orderId, "CARD", new HashMap<>());
                paymentStatus = (String) paymentResult.get("orderStatus");
                System.out.println("[DEBUG] Payment processed, new status: " + paymentStatus);
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
                    "Thank you for choosing Solar Capital!\n\n" +
                    "Best regards,\nSolar Capital Team",
                    user.getFullName(),
                    amount.toString(),
                    amount.toString(),
                    orderId,
                    java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm"))
                );
                
                emailService.sendEmail(user.getEmail(), emailSubject, emailBody);
                
                System.out.println("[DEBUG] Funds added via payment: " + user.getEmail() + " - ₹" + amount + " - Order: " + orderId);
                
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
            System.out.println("[DEBUG] Exception in processAddFundsPayment: " + e.getMessage());
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
            
            System.out.println("[DEBUG] Wallet history for user: " + user.getEmail() + " - Found " + rewards.size() + " rewards, " + fromTransactions.size() + " outgoing, " + toTransactions.size() + " incoming transactions");
            
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