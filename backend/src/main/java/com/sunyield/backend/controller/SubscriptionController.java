package com.sunyield.backend.controller;

import com.sunyield.backend.entity.Project;
import com.sunyield.backend.entity.Subscription;
import com.sunyield.backend.entity.User;
import com.sunyield.backend.entity.CreditTransferLog;
import com.sunyield.backend.entity.RewardHistory;
import com.sunyield.backend.entity.Coupon;
import com.sunyield.backend.repository.ProjectRepository;
import com.sunyield.backend.repository.SubscriptionRepository;
import com.sunyield.backend.repository.UserRepository;
import com.sunyield.backend.repository.CreditTransferLogRepository;
import com.sunyield.backend.repository.RewardHistoryRepository;
import com.sunyield.backend.repository.CouponRepository;
import com.sunyield.backend.service.EmailService;
import com.sunyield.backend.service.CashfreeMockService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.context.annotation.Profile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {
    private static final Logger logger = LoggerFactory.getLogger(SubscriptionController.class);
    
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
    @Autowired
    private CouponRepository couponRepository;

    // Request body class for subscription
    public static class SubscriptionRequest {
        private String couponCode;
        private BigDecimal contributionAmount; // For flexible contributions
        private String subscriptionType; // FIXED or FLEXIBLE
        
        public String getCouponCode() { return couponCode; }
        public void setCouponCode(String couponCode) { this.couponCode = couponCode; }
        
        public BigDecimal getContributionAmount() { return contributionAmount; }
        public void setContributionAmount(BigDecimal contributionAmount) { this.contributionAmount = contributionAmount; }
        
        public String getSubscriptionType() { return subscriptionType; }
        public void setSubscriptionType(String subscriptionType) { this.subscriptionType = subscriptionType; }
        
        @Override
        public String toString() {
            return "SubscriptionRequest{" +
                    "couponCode='" + couponCode + '\'' +
                    ", contributionAmount=" + contributionAmount +
                    ", subscriptionType='" + subscriptionType + '\'' +
                    '}';
        }
    }

    // Test endpoint to check if request body parsing works (Development only)
    @PostMapping("/test")
    @Profile("!prod")
    public ResponseEntity<?> testSubscription(@RequestParam Long projectId, @RequestBody(required = false) SubscriptionRequest request) {
        return ResponseEntity.ok(Map.of("message", "Test successful", "projectId", projectId, "request", request != null ? request.toString() : "null"));
    }

    // Test endpoint with authentication (Development only)
    @PostMapping("/test-auth")
    @Profile("!prod")
    public ResponseEntity<?> testSubscriptionWithAuth(@RequestParam Long projectId, @RequestBody(required = false) SubscriptionRequest request, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(Map.of("message", "Test auth successful", "projectId", projectId, "request", request != null ? request.toString() : "null", "auth", auth != null ? auth.toString() : "null"));
    }

    // 1. Auto-subscribe to project (wallet-based)
    @PostMapping
    public ResponseEntity<?> subscribeToProject(@RequestParam Long projectId, @RequestBody(required = false) SubscriptionRequest request, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        logger.info("Subscription request - Project ID: {}, Request: {}", projectId, request);
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).body("User not authenticated");
            }
            
            String email;
            Object principal = auth.getPrincipal();
            if (principal instanceof com.sunyield.backend.entity.User) {
                email = ((com.sunyield.backend.entity.User) principal).getEmail();
            } else {
                email = principal.toString();
            }
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(401).body("User not found");
        
        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) return ResponseEntity.badRequest().body("Project not found");

        User user = userOpt.get();
        Project project = projectOpt.get();
        
        // Check if user already has an active subscription for this project
        List<Subscription> existingSubscriptions = subscriptionRepository.findByUser(user);
        boolean alreadySubscribed = existingSubscriptions.stream()
            .anyMatch(sub -> sub.getProject() != null && 
                           sub.getProject().getId().equals(projectId) && 
                           "SUCCESS".equals(sub.getPaymentStatus()));
        
        if (alreadySubscribed) {
            return ResponseEntity.badRequest().body("You have already subscribed to this project");
        }
        
        // Determine subscription type and amount
        String subscriptionType = "FIXED"; // Default to FIXED
        BigDecimal contributionAmount = project.getSubscriptionPrice(); // Default to project price
        
        if (request != null) {
            subscriptionType = "FLEXIBLE".equals(request.getSubscriptionType()) ? "FLEXIBLE" : "FIXED";
            if ("FLEXIBLE".equals(subscriptionType) && request.getContributionAmount() != null) {
                contributionAmount = request.getContributionAmount();
            }
        }
        
        // Validate contribution amount
        logger.info("Validation - Contribution amount: {}, Min contribution: {}, Project price: {}", 
                   contributionAmount, project.getMinContribution(), project.getSubscriptionPrice());
        if (contributionAmount.compareTo(project.getMinContribution()) < 0) {
            logger.warn("Contribution amount {} is less than minimum required {}", contributionAmount, project.getMinContribution());
            return ResponseEntity.badRequest().body("Contribution amount must be at least ₹" + project.getMinContribution());
        }
        
        BigDecimal finalPrice = contributionAmount;
        BigDecimal discountAmount = BigDecimal.ZERO;
        String appliedCouponCode = null;
        
        // Apply coupon if provided
        if (request != null && request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            Optional<Coupon> couponOpt = couponRepository.findByCodeIgnoreCase(request.getCouponCode().trim());
            if (couponOpt.isPresent()) {
                Coupon coupon = couponOpt.get();
                if (coupon.isValid()) {
                    discountAmount = BigDecimal.valueOf(coupon.calculateDiscount(contributionAmount.doubleValue()));
                    finalPrice = contributionAmount.subtract(discountAmount);
                    appliedCouponCode = coupon.getCode();
                    
                    // Increment coupon usage
                    coupon.setCurrentUsage(coupon.getCurrentUsage() + 1);
                    couponRepository.save(coupon);
                } else {
                    return ResponseEntity.badRequest().body("Invalid or expired coupon code");
                }
            } else {
                return ResponseEntity.badRequest().body("Coupon code not found");
            }
        }
        
        // Check wallet balance
        BigDecimal userBalance = getUserAvailableCredits(user);
        
        if (userBalance.compareTo(finalPrice) < 0) {
            return ResponseEntity.badRequest().body("Insufficient wallet balance. Available: ₹" + userBalance + ", Required: ₹" + finalPrice);
        }
        
        // Auto-approve subscription
        Subscription sub = new Subscription();
        sub.setUser(user);
        sub.setProject(project);
        sub.setContributionAmount(finalPrice);
        sub.setSubscriptionType(subscriptionType);
        
        // Calculate reserved capacity based on contribution amount
        // Base rate: ₹50 per watt (more realistic for solar projects)
        BigDecimal reservedCapacity = finalPrice.divide(new BigDecimal("50"), 2, java.math.RoundingMode.HALF_UP);
        sub.setReservedCapacity(reservedCapacity);
        
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
        investment.setAmount(finalPrice);
        investment.setType("SUBSCRIPTION");
        investment.setDate(LocalDateTime.now());
        String notes = "Auto-approved investment in " + project.getName();
        if (appliedCouponCode != null) {
            notes += " (Coupon applied: " + appliedCouponCode + ", Discount: ₹" + discountAmount + ")";
        }
        investment.setNotes(notes);
        creditTransferLogRepository.save(investment);
        
        // Send email notification to user
        String emailSubject = "🎉 Solar Project Contribution Successful - Energy Rewards Activated!";
        
        // Format date properly
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMMM yyyy 'at' hh:mm a");
        String formattedDate = LocalDateTime.now().format(formatter);
        
        // Calculate Energy Rewards (₹5 per kWh)
        BigDecimal monthlyEnergyRewards = finalPrice.multiply(new BigDecimal("0.01")); // 1% of contribution as monthly rewards
        BigDecimal annualEnergyRewards = monthlyEnergyRewards.multiply(new BigDecimal("12"));
        
        String emailBody = String.format(
            "Dear %s,\n\n" +
            "🌟 Congratulations! Your contribution to '%s' has been successfully processed!\n\n" +
            "📊 Contribution Details:\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
            "🏢 Project: %s\n" +
            "🏷️  Project Type: Solar Energy Project\n" +
            "💰 Contribution Amount: ₹%s\n" +
            "📋 Subscription Type: %s\n" +
            "📅 Date: %s\n" +
            "✅ Status: Auto-approved\n" +
            "%s\n\n" +
            "🌱 What happens next?\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
            "• Your contribution is now active and supporting clean energy\n" +
            "• You will earn Energy Rewards monthly based on actual energy generation\n" +
            "• Track your Energy Rewards in your dashboard\n" +
            "• Use rewards for bill payments or withdraw to your bank account\n\n" +
            "💡 Expected Monthly Energy Rewards: ₹%s\n" +
            "📈 Annual Energy Rewards: ₹%s\n\n" +
            "Thank you for supporting India's clean energy revolution! 🌞\n\n" +
            "Best regards,\nSunYield Team",
            user.getFullName(),
            project.getName(),
            project.getName(),
            finalPrice.toString(),
            subscriptionType,
            formattedDate,
            appliedCouponCode != null ? "- Coupon Applied: " + appliedCouponCode + " (Discount: ₹" + discountAmount + ")" : "",
            monthlyEnergyRewards.toString(),
            annualEnergyRewards.toString()
        );
        
        emailService.sendEmail(user.getEmail(), emailSubject, emailBody);
        
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Contribution successful");
        resp.put("projectName", project.getName());
        resp.put("projectType", project.getProjectType());
        resp.put("amount", finalPrice); // Changed from contributionAmount to amount
        resp.put("originalAmount", contributionAmount); // Add original amount before discount
        resp.put("reservedCapacity", reservedCapacity);
        resp.put("subscriptionType", subscriptionType);
        resp.put("efficiency", project.getEfficiency());
        resp.put("discountAmount", discountAmount);
        resp.put("appliedCoupon", appliedCouponCode);
        resp.put("newBalance", userBalance.subtract(finalPrice));
        return ResponseEntity.ok(resp);
        } catch (Exception e) {
            logger.error("Exception in subscribeToProject for project {}: {}", projectId, e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error processing subscription: " + e.getMessage());
        }
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

    // 3. Get user's subscription for a specific project
    @GetMapping
    public ResponseEntity<?> getUserSubscriptionForProject(@RequestParam Long projectId, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body("User not authenticated");
        }
        
        Object principal = auth.getPrincipal();
        if (!(principal instanceof User)) {
            return ResponseEntity.status(401).body("Invalid user principal");
        }
        
        User user = (User) principal;
        
        // Find subscription for this user and project
        List<Subscription> userSubscriptions = subscriptionRepository.findByUser(user);
        Optional<Subscription> projectSubscription = userSubscriptions.stream()
            .filter(sub -> sub.getProject() != null && sub.getProject().getId().equals(projectId))
            .findFirst();
        
        if (projectSubscription.isPresent()) {
            return ResponseEntity.ok(projectSubscription.get());
        } else {
            return ResponseEntity.ok(Map.of("message", "No subscription found for this project"));
        }
    }

    // 4. Get user's subscription history
    @GetMapping("/history")
    public ResponseEntity<?> getSubscriptionHistory(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body("User not authenticated");
        }
        
        Object principal = auth.getPrincipal();
        if (!(principal instanceof User)) {
            return ResponseEntity.status(401).body("Invalid user principal");
        }
        
        User user = (User) principal;
        
        List<Subscription> subs = subscriptionRepository.findByUser(user);
        
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