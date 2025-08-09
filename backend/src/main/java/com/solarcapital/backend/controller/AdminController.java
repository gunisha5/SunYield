package com.solarcapital.backend.controller;

import com.solarcapital.backend.entity.*;
import com.solarcapital.backend.repository.*;
import com.solarcapital.backend.util.JwtUtil;
import com.solarcapital.backend.service.NotificationService;
import com.solarcapital.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/admin")
public class AdminController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private KYCRepository kycRepository;
    
    @Autowired
    private SubscriptionRepository subscriptionRepository;
    
    @Autowired
    private RewardHistoryRepository rewardHistoryRepository;
    
    @Autowired
    private CreditTransferLogRepository creditTransferLogRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private SystemConfigRepository systemConfigRepository;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
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
            if ("ADMIN_CREDIT".equals(transfer.getType()) || "ADD_FUNDS".equals(transfer.getType())) {
                balance = balance.add(transfer.getAmount());
            }
        }
        
        // Subtract outflows (investments, withdrawals)
        List<CreditTransferLog> outflows = creditTransferLogRepository.findByFromUserId(user.getId());
        for (CreditTransferLog outflow : outflows) {
            if ("INVESTMENT".equals(outflow.getType()) || "SUBSCRIPTION".equals(outflow.getType()) || 
                "WITHDRAWAL".equals(outflow.getType())) {
                balance = balance.subtract(outflow.getAmount());
            }
        }
        
        return balance;
    }
    
    // ==================== ADMIN AUTHENTICATION ====================
    
    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> req) {
        String email = req.get("email");
        String password = req.get("password");
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Admin not found");
        }
        
        User user = userOpt.get();
        
        // Check if user is admin
        if (user.getRole() != Role.ADMIN) {
            return ResponseEntity.badRequest().body("Access denied. Admin privileges required.");
        }
        
        // Debug: Log the password comparison
        System.out.println("[DEBUG] Admin login attempt for: " + email);
        System.out.println("[DEBUG] Stored password hash: " + user.getPassword());
        System.out.println("[DEBUG] Password matches: " + passwordEncoder.matches(password, user.getPassword()));
        
        // Verify password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }
        
        // Generate admin token
        String token = jwtUtil.generateToken(email);
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("role", "ADMIN");
        
        return ResponseEntity.ok(response);
    }
    
    // Temporary endpoint to generate password hash (remove in production)
    @GetMapping("/generate-hash")
    public ResponseEntity<?> generateHash(@RequestParam String password) {
        String hash = passwordEncoder.encode(password);
        Map<String, String> response = new HashMap<>();
        response.put("password", password);
        response.put("hash", hash);
        return ResponseEntity.ok(response);
    }
    
    // ==================== USER MANAGEMENT ====================
    
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        return ResponseEntity.ok(userOpt.get());
    }
    
    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> req) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        
        User user = userOpt.get();
        String newRole = req.get("role");
        
        try {
            Role role = Role.valueOf(newRole.toUpperCase());
            user.setRole(role);
            userRepository.save(user);
            return ResponseEntity.ok("User role updated successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid role. Use USER or ADMIN");
        }
    }
    
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        
        userRepository.deleteById(id);
        return ResponseEntity.ok("User deleted successfully");
    }
    
    // ==================== PROJECT MANAGEMENT ====================
    
    @GetMapping("/projects")
    public ResponseEntity<?> getAllProjects() {
        List<Project> projects = projectRepository.findAll();
        return ResponseEntity.ok(projects);
    }
    
    @PostMapping("/projects")
    public ResponseEntity<?> createProject(@RequestBody Project project) {
        project.setId(null); // Ensure new project
        project.setStatus("ACTIVE");
        Project savedProject = projectRepository.save(project);
        return ResponseEntity.ok(savedProject);
    }
    
    @PutMapping("/projects/{id}")
    public ResponseEntity<?> updateProject(@PathVariable Long id, @RequestBody Project project) {
        Optional<Project> projectOpt = projectRepository.findById(id);
        if (projectOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Project not found");
        }
        
        Project existingProject = projectOpt.get();
        existingProject.setName(project.getName());
        existingProject.setLocation(project.getLocation());
        existingProject.setEnergyCapacity(project.getEnergyCapacity());
        existingProject.setSubscriptionPrice(project.getSubscriptionPrice());
        existingProject.setStatus(project.getStatus());
        
        Project savedProject = projectRepository.save(existingProject);
        return ResponseEntity.ok(savedProject);
    }
    
    @DeleteMapping("/projects/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        Optional<Project> projectOpt = projectRepository.findById(id);
        if (projectOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Project not found");
        }
        
        projectRepository.deleteById(id);
        return ResponseEntity.ok("Project deleted successfully");
    }
    
    @PatchMapping("/projects/{id}/status")
    public ResponseEntity<?> updateProjectStatus(@PathVariable Long id, @RequestBody Map<String, String> req) {
        Optional<Project> projectOpt = projectRepository.findById(id);
        if (projectOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Project not found");
        }
        
        Project project = projectOpt.get();
        String status = req.get("status");
        if ("ACTIVE".equals(status) || "PAUSED".equals(status)) {
            project.setStatus(status);
            projectRepository.save(project);
            return ResponseEntity.ok("Project status updated successfully");
        } else {
            return ResponseEntity.badRequest().body("Invalid status. Use ACTIVE or PAUSED");
        }
    }
    
    // ==================== KYC MANAGEMENT ====================
    
    @GetMapping("/kyc/pending")
    public ResponseEntity<?> getPendingKyc() {
        List<KYC> pendingKyc = kycRepository.findByStatus(KYCStatus.PENDING);
        return ResponseEntity.ok(pendingKyc);
    }
    
    @GetMapping("/kyc/all")
    public ResponseEntity<?> getAllKyc() {
        List<KYC> allKyc = kycRepository.findAll();
        return ResponseEntity.ok(allKyc);
    }
    
    // ==================== WALLET MANAGEMENT ====================
    
    @PostMapping("/users/{id}/add-credits")
    public ResponseEntity<?> addCreditsToUser(@PathVariable Long id, @RequestBody Map<String, Object> req) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        
        BigDecimal amount = new BigDecimal(req.get("amount").toString());
        String notes = (String) req.get("notes");
        User user = userOpt.get();
        
        // Create credit transfer log
        CreditTransferLog transfer = new CreditTransferLog();
        transfer.setFromUser(null); // System/admin transfer
        transfer.setToUser(user);
        transfer.setAmount(amount);
        transfer.setType("ADMIN_CREDIT");
        transfer.setDate(LocalDateTime.now());
        transfer.setNotes(notes);
        
        creditTransferLogRepository.save(transfer);
        
        // Send email notification to user
        String emailSubject = "Funds Added to Your Wallet";
        String emailBody = String.format(
            "Dear %s,\n\n" +
            "Your wallet has been credited with ₹%s.\n\n" +
            "Transaction Details:\n" +
            "- Amount: ₹%s\n" +
            "- Type: Admin Credit\n" +
            "- Date: %s\n" +
            "- Notes: %s\n\n" +
            "Your new wallet balance will be updated in your dashboard. You can now use these funds to invest in solar projects or withdraw them.\n\n" +
            "Thank you for choosing Solar Capital!\n\n" +
            "Best regards,\nSolar Capital Team",
            user.getFullName(),
            amount.toString(),
            amount.toString(),
            LocalDateTime.now().toString(),
            notes != null ? notes : "No additional notes"
        );
        
        emailService.sendEmail(user.getEmail(), emailSubject, emailBody);
        
        System.out.println("[DEBUG] Admin credit sent to user " + user.getEmail() + ": ₹" + amount);
        
        return ResponseEntity.ok("Credits added successfully and email notification sent to user");
    }
    
    // ==================== ENERGY DATA MANAGEMENT ====================
    
    @PostMapping("/projects/{id}/add-energy")
    public ResponseEntity<?> addEnergyData(@PathVariable Long id, @RequestBody Map<String, Object> req) {
        Optional<Project> projectOpt = projectRepository.findById(id);
        if (projectOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Project not found");
        }
        
        double energyProduced = Double.parseDouble(req.get("energyProduced").toString());
        String date = (String) req.get("date");
        Project project = projectOpt.get();
        
        int usersRewarded = 0;
        BigDecimal totalRewardsDistributed = BigDecimal.ZERO;
        
        // Create reward history entry for all users subscribed to this project
        List<Subscription> subscriptions = subscriptionRepository.findByProject(project);
        for (Subscription sub : subscriptions) {
            if ("SUCCESS".equals(sub.getPaymentStatus())) {
                BigDecimal rewardAmount = new BigDecimal(energyProduced * 10); // ₹10 per kWh
                
                RewardHistory reward = new RewardHistory();
                reward.setUser(sub.getUser());
                reward.setProject(project);
                reward.setKWh(energyProduced);
                reward.setRewardAmount(rewardAmount);
                reward.setStatus("SUCCESS");
                reward.setReason("Energy production reward for " + project.getName());
                reward.setMonth(java.time.LocalDate.now().getMonthValue());
                reward.setYear(java.time.LocalDate.now().getYear());
                rewardHistoryRepository.save(reward);
                
                // Send email notification to user
                String emailSubject = "Energy Reward Added - " + project.getName();
                String emailBody = String.format(
                    "Dear %s,\n\n" +
                    "Great news! Your solar investment in %s has generated %s kWh of energy.\n\n" +
                    "Reward Details:\n" +
                    "- Project: %s\n" +
                    "- Energy Generated: %s kWh\n" +
                    "- Reward Amount: ₹%s\n" +
                    "- Date: %s\n\n" +
                    "Your reward has been added to your wallet balance. You can now withdraw these funds or reinvest them in other projects.\n\n" +
                    "Thank you for investing in solar energy!\n\n" +
                    "Best regards,\nSolar Capital Team",
                    sub.getUser().getFullName(),
                    project.getName(),
                    energyProduced,
                    project.getName(),
                    energyProduced,
                    rewardAmount.toString(),
                    date
                );
                
                emailService.sendEmail(sub.getUser().getEmail(), emailSubject, emailBody);
                
                usersRewarded++;
                totalRewardsDistributed = totalRewardsDistributed.add(rewardAmount);
                
                System.out.println("[DEBUG] Reward sent to user " + sub.getUser().getEmail() + ": ₹" + rewardAmount);
            }
        }
        
        String responseMessage = String.format(
            "Energy data added successfully!\n" +
            "- Project: %s\n" +
            "- Energy Generated: %s kWh\n" +
            "- Users Rewarded: %d\n" +
            "- Total Rewards Distributed: ₹%s\n" +
            "- Email notifications sent to all users",
            project.getName(),
            energyProduced,
            usersRewarded,
            totalRewardsDistributed.toString()
        );
        
        return ResponseEntity.ok(responseMessage);
    }
    
    // ==================== SYSTEM CONFIGURATION MANAGEMENT ====================
    
    @GetMapping("/config")
    public ResponseEntity<?> getSystemConfig() {
        List<SystemConfig> configs = systemConfigRepository.findAll();
        return ResponseEntity.ok(configs);
    }
    
    @PostMapping("/config/monthly-withdrawal-cap")
    public ResponseEntity<?> updateMonthlyWithdrawalCap(@RequestBody Map<String, Object> req) {
        BigDecimal newCap = new BigDecimal(req.get("amount").toString());
        
        Optional<SystemConfig> existingConfig = systemConfigRepository.findByConfigKey("MONTHLY_WITHDRAWAL_CAP");
        SystemConfig config;
        
        if (existingConfig.isPresent()) {
            config = existingConfig.get();
        } else {
            config = new SystemConfig();
            config.setConfigKey("MONTHLY_WITHDRAWAL_CAP");
            config.setDescription("Monthly withdrawal limit for users");
        }
        
        config.setConfigValue(newCap.toString());
        systemConfigRepository.save(config);
        
        System.out.println("[DEBUG] Monthly withdrawal cap updated to: ₹" + newCap);
        return ResponseEntity.ok("Monthly withdrawal cap updated to ₹" + newCap);
    }
    
    @GetMapping("/config/monthly-withdrawal-cap")
    public ResponseEntity<?> getMonthlyWithdrawalCap() {
        Optional<SystemConfig> config = systemConfigRepository.findByConfigKey("MONTHLY_WITHDRAWAL_CAP");
        if (config.isPresent()) {
            return ResponseEntity.ok(Map.of("amount", config.get().getConfigValue()));
        } else {
            // Default value if not set
            return ResponseEntity.ok(Map.of("amount", "3000"));
        }
    }
    
    // ==================== PAYMENT MANAGEMENT ====================
    
    @GetMapping("/subscriptions/pending")
    public ResponseEntity<?> getPendingSubscriptions() {
        List<Subscription> allSubscriptions = subscriptionRepository.findAll();
        return ResponseEntity.ok(allSubscriptions);
    }
    
    @PostMapping("/subscriptions/{orderId}/approve")
    public ResponseEntity<?> approveSubscription(@PathVariable String orderId) {
        Optional<Subscription> subscriptionOpt = subscriptionRepository.findAll().stream()
                .filter(s -> orderId.equals(s.getPaymentOrderId()))
                .findFirst();
        
        if (subscriptionOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Subscription not found");
        }
        
        Subscription subscription = subscriptionOpt.get();
        subscription.setPaymentStatus("SUCCESS");
        subscription.setSubscribedAt(LocalDateTime.now());
        subscriptionRepository.save(subscription);
        
        // Create investment transaction record
        CreditTransferLog investment = new CreditTransferLog();
        investment.setFromUser(subscription.getUser());
        investment.setToUser(null); // System/Project
        investment.setProject(subscription.getProject());
        investment.setAmount(subscription.getProject().getSubscriptionPrice());
        investment.setType("SUBSCRIPTION");
        investment.setDate(LocalDateTime.now());
        investment.setNotes("Investment in " + subscription.getProject().getName());
        creditTransferLogRepository.save(investment);
        
        return ResponseEntity.ok("Subscription approved successfully");
    }
    
    @PostMapping("/subscriptions/{orderId}/reject")
    public ResponseEntity<?> rejectSubscription(@PathVariable String orderId) {
        Optional<Subscription> subscriptionOpt = subscriptionRepository.findAll().stream()
                .filter(s -> orderId.equals(s.getPaymentOrderId()))
                .findFirst();
        
        if (subscriptionOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Subscription not found");
        }
        
        Subscription subscription = subscriptionOpt.get();
        subscription.setPaymentStatus("FAILED");
        subscriptionRepository.save(subscription);
        
        return ResponseEntity.ok("Subscription rejected successfully");
    }
    
    // ==================== DASHBOARD STATISTICS ====================
    
    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalUsers", userRepository.count());
        stats.put("totalProjects", projectRepository.count());
        stats.put("pendingKyc", kycRepository.countByStatus(KYCStatus.PENDING));
        stats.put("totalSubscriptions", subscriptionRepository.count());
        
        return ResponseEntity.ok(stats);
    }
} 