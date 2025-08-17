package com.solarcapital.backend.controller;

import com.solarcapital.backend.entity.Project;
import com.solarcapital.backend.entity.Subscription;
import com.solarcapital.backend.entity.User;
import com.solarcapital.backend.entity.CreditTransferLog;
import com.solarcapital.backend.entity.RewardHistory;
import com.solarcapital.backend.repository.ProjectRepository;
import com.solarcapital.backend.repository.SubscriptionRepository;
import com.solarcapital.backend.repository.UserRepository;
import com.solarcapital.backend.repository.CreditTransferLogRepository;
import com.solarcapital.backend.repository.RewardHistoryRepository;
import com.solarcapital.backend.service.EmailService;
import com.solarcapital.backend.service.CashfreeMockService;
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
@RequestMapping("/api/subscriptions")
public class SubscriptionController {
    @Autowired
    private SubscriptionRepository subscriptionRepository;
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CreditTransferLogRepository creditTransferLogRepository;
    @Autowired
    private RewardHistoryRepository rewardHistoryRepository;
    @Autowired
    private EmailService emailService;
    @Autowired
    private CashfreeMockService cashfreeMockService;

    // 1. Auto-subscribe to project (wallet-based)
    @PostMapping
    public ResponseEntity<?> subscribeToProject(@RequestParam Long projectId, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        System.out.println("[DEBUG] Authorization header: " + authHeader);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email;
        Object principal = auth.getPrincipal();
        if (principal instanceof com.solarcapital.backend.entity.User) {
            email = ((com.solarcapital.backend.entity.User) principal).getEmail();
        } else {
            email = principal.toString();
        }
        System.out.println("[DEBUG] Email from SecurityContext: " + email);
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(401).body("User not found");
        
        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) return ResponseEntity.badRequest().body("Project not found");

        User user = userOpt.get();
        Project project = projectOpt.get();
        BigDecimal projectPrice = project.getSubscriptionPrice();
        
        // Check wallet balance
        BigDecimal userBalance = getUserAvailableCredits(user);
        System.out.println("[DEBUG] User balance: " + userBalance + ", Project price: " + projectPrice);
        
        if (userBalance.compareTo(projectPrice) < 0) {
            return ResponseEntity.badRequest().body("Insufficient wallet balance. Available: ₹" + userBalance + ", Required: ₹" + projectPrice);
        }
        
        // Auto-approve subscription
        Subscription sub = new Subscription();
        sub.setUser(user);
        sub.setProject(project);
        // Generate a more readable order ID: SOLAR_YYYYMMDD_HHMMSS_XXX
        String timestamp = LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String randomSuffix = String.format("%03d", (int)(Math.random() * 1000));
        sub.setPaymentOrderId("SOLAR_" + timestamp + "_" + randomSuffix);
        sub.setPaymentStatus("SUCCESS");
        sub.setSubscribedAt(LocalDateTime.now());
        subscriptionRepository.save(sub);
        
        // Deduct from wallet and create transaction log
        CreditTransferLog investment = new CreditTransferLog();
        investment.setFromUser(user);
        investment.setToUser(null); // System/Project
        investment.setProject(project);
        investment.setAmount(projectPrice);
        investment.setType("SUBSCRIPTION");
        investment.setDate(LocalDateTime.now());
        investment.setNotes("Auto-approved investment in " + project.getName());
        creditTransferLogRepository.save(investment);
        
        // Send email notification to user
        String emailSubject = "Project Subscription Successful";
        String emailBody = String.format(
            "Dear %s,\n\n" +
            "Your subscription to '%s' has been successfully processed!\n\n" +
            "Transaction Details:\n" +
            "- Project: %s\n" +
            "- Amount: ₹%s\n" +
            "- Date: %s\n" +
            "- Status: Auto-approved\n\n" +
            "Your investment is now active. You can track your returns in your dashboard.\n\n" +
            "Thank you for investing in solar energy!\n\n" +
            "Best regards,\nSolar Capital Team",
            user.getFullName(),
            project.getName(),
            project.getName(),
            projectPrice.toString(),
            LocalDateTime.now().toString()
        );
        
        emailService.sendEmail(user.getEmail(), emailSubject, emailBody);
        
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Subscription successful");
        resp.put("projectName", project.getName());
        resp.put("amount", projectPrice);
        resp.put("newBalance", userBalance.subtract(projectPrice));
        return ResponseEntity.ok(resp);
    }
    
    // Helper method to calculate user's available credits
    private BigDecimal getUserAvailableCredits(User user) {
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

    // 2. Create Cashfree payment order
    @PostMapping("/create-payment-order")
    public ResponseEntity<?> createPaymentOrder(@RequestParam Long projectId, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        System.out.println("[DEBUG] Creating payment order for project: " + projectId);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email;
        Object principal = auth.getPrincipal();
        if (principal instanceof com.solarcapital.backend.entity.User) {
            email = ((com.solarcapital.backend.entity.User) principal).getEmail();
        } else {
            email = principal.toString();
        }
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(401).body("User not found");
        
        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) return ResponseEntity.badRequest().body("Project not found");

        User user = userOpt.get();
        Project project = projectOpt.get();
        BigDecimal projectPrice = project.getSubscriptionPrice();
        
        // Create Cashfree order request
        Map<String, Object> orderRequest = new HashMap<>();
        orderRequest.put("orderAmount", projectPrice);
        orderRequest.put("orderCurrency", "INR");
        orderRequest.put("customerName", user.getFullName());
        orderRequest.put("customerEmail", user.getEmail());
        orderRequest.put("customerPhone", user.getContact() != null ? user.getContact() : "9999999999");
        orderRequest.put("orderNote", "Investment in " + project.getName());
        
        try {
            Map<String, Object> cashfreeResponse = cashfreeMockService.createOrder(orderRequest);
            
            if (cashfreeResponse.containsKey("status") && "ERROR".equals(cashfreeResponse.get("status"))) {
                return ResponseEntity.badRequest().body(cashfreeResponse);
            }
            
            // Create subscription record with pending status
            Subscription sub = new Subscription();
            sub.setUser(user);
            sub.setProject(project);
            sub.setPaymentOrderId((String) cashfreeResponse.get("orderId"));
            sub.setPaymentStatus("PENDING");
            sub.setSubscribedAt(null); // Will be set when payment is successful
            subscriptionRepository.save(sub);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orderId", cashfreeResponse.get("orderId"));
            response.put("paymentUrl", cashfreeResponse.get("paymentUrl"));
            response.put("projectName", project.getName());
            response.put("amount", projectPrice);
            response.put("customerName", user.getFullName());
            response.put("customerEmail", user.getEmail());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to create payment order: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // 3. Webhook endpoint to handle payment status (mocked)
    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(@RequestParam String orderId, @RequestParam String status) {
        // status: "SUCCESS" or "FAILED"
        Optional<Subscription> subOpt = subscriptionRepository.findAll().stream()
                .filter(s -> orderId.equals(s.getPaymentOrderId()))
                .findFirst();
        if (subOpt.isEmpty()) return ResponseEntity.badRequest().body("Subscription not found");
        Subscription sub = subOpt.get();
        sub.setPaymentStatus(status);
        if ("SUCCESS".equals(status)) {
            sub.setSubscribedAt(LocalDateTime.now());
            
            // Create investment transaction record
            CreditTransferLog investment = new CreditTransferLog();
            investment.setFromUser(sub.getUser());
            investment.setToUser(null); // System/Project
            investment.setProject(sub.getProject());
            investment.setAmount(sub.getProject().getSubscriptionPrice());
            investment.setType("SUBSCRIPTION");
            investment.setDate(LocalDateTime.now());
            investment.setNotes("Investment in " + sub.getProject().getName());
            creditTransferLogRepository.save(investment);
        }
        subscriptionRepository.save(sub);
        return ResponseEntity.ok("Webhook processed");
    }

    // 3. Get user's subscription history
    @GetMapping("/history")
    public ResponseEntity<?> getSubscriptionHistory(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        System.out.println("[DEBUG] Authorization header: " + authHeader); // DEBUG point
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body("User not authenticated");
        }
        
        Object principal = auth.getPrincipal();
        if (!(principal instanceof User)) {
            return ResponseEntity.status(401).body("Invalid user principal");
        }
        
        User user = (User) principal;
        System.out.println("[DEBUG] User from SecurityContext: " + user.getEmail() + ", ID: " + user.getId()); // DEBUG point
        
        List<Subscription> subs = subscriptionRepository.findByUser(user);
        System.out.println("[DEBUG] Found " + subs.size() + " subscriptions for user: " + user.getEmail());
        
        // Sort by subscribedAt date descending (most recent first)
        subs.sort((s1, s2) -> {
            if (s1.getSubscribedAt() == null && s2.getSubscribedAt() == null) return 0;
            if (s1.getSubscribedAt() == null) return 1;
            if (s2.getSubscribedAt() == null) return -1;
            return s2.getSubscribedAt().compareTo(s1.getSubscribedAt());
        });
        
        return ResponseEntity.ok(subs);
    }
} 