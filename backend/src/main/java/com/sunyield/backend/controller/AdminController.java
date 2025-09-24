package com.sunyield.backend.controller;

import com.sunyield.backend.entity.*;
import com.sunyield.backend.repository.*;
import com.sunyield.backend.util.JwtUtil;
import com.sunyield.backend.service.NotificationService;
import com.sunyield.backend.service.EmailService;
import com.sunyield.backend.service.CouponService;
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
import org.springframework.security.core.context.SecurityContextHolder;

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
    
    @Autowired
    private CouponService couponService;
    
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    // Helper: get user's available credits (same logic as UserWalletController)
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
    
    // Test endpoint to check admin authentication
    @GetMapping("/test-auth")
    public ResponseEntity<?> testAuth() {
        System.out.println("[DEBUG] Test auth endpoint called");
        System.out.println("[DEBUG] Authentication: " + SecurityContextHolder.getContext().getAuthentication());
        
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            System.out.println("[DEBUG] Principal: " + principal);
            
            if (principal instanceof User) {
                User user = (User) principal;
                System.out.println("[DEBUG] User email: " + user.getEmail());
                System.out.println("[DEBUG] User role: " + user.getRole());
                
                if (user.getRole() == Role.ADMIN) {
                    return ResponseEntity.ok("Admin authentication successful");
                } else {
                    return ResponseEntity.status(403).body("Not an admin user");
                }
            }
        }
        
        return ResponseEntity.status(401).body("No authentication found");
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
        // Debug: Log authentication info
        System.out.println("[DEBUG] Get all users requested");
        System.out.println("[DEBUG] Authentication: " + SecurityContextHolder.getContext().getAuthentication());
        
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
        existingProject.setMinContribution(project.getMinContribution());
        existingProject.setEfficiency(project.getEfficiency());
        existingProject.setProjectType(project.getProjectType());
        existingProject.setOperationalValidityYear(project.getOperationalValidityYear());
        existingProject.setDescription(project.getDescription());
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
    
    // Upload project image
    @PostMapping("/projects/{id}/image")
    public ResponseEntity<String> uploadProjectImage(@PathVariable Long id, @RequestParam("image") org.springframework.web.multipart.MultipartFile file) {
        try {
            Optional<Project> opt = projectRepository.findById(id);
            if (opt.isEmpty()) return ResponseEntity.notFound().build();
            
            Project project = opt.get();
            
            // Delete old image if exists
            if (project.getImageUrl() != null) {
                // fileUploadService.deleteProjectImage(project.getImageUrl());
            }
            
            // Upload new image (simplified for now)
            String imageUrl = "uploads/projects/" + file.getOriginalFilename();
            project.setImageUrl(imageUrl);
            projectRepository.save(project);
            
            return ResponseEntity.ok(imageUrl);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to upload image: " + e.getMessage());
        }
    }
    
    // Pause project
    @PatchMapping("/projects/{id}/pause")
    public ResponseEntity<Project> pauseProject(@PathVariable Long id) {
        Optional<Project> opt = projectRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Project project = opt.get();
        project.setStatus("PAUSED");
        Project saved = projectRepository.save(project);
        return ResponseEntity.ok(saved);
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
        
        // Sort by ID descending (most recent first, since IDs are auto-incrementing)
        pendingKyc.sort((k1, k2) -> k2.getId().compareTo(k1.getId()));
        
        return ResponseEntity.ok(pendingKyc);
    }
    
    @GetMapping("/kyc/all")
    public ResponseEntity<?> getAllKyc() {
        List<KYC> allKyc = kycRepository.findAll();
        
        // Sort by ID descending (most recent first, since IDs are auto-incrementing)
        allKyc.sort((k1, k2) -> k2.getId().compareTo(k1.getId()));
        
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
            "₹%s has been added to your wallet.\n\n" +
            "Amount: ₹%s\n" +
            "Date: %s\n" +
            "Notes: %s\n\n" +
            "Thank you for choosing SunYield!\n\n" +
            "Best regards,\nSunYield Team",
            user.getFullName(),
            amount.toString(),
            amount.toString(),
            LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm")),
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
        String dateStr = (String) req.get("date");
        Project project = projectOpt.get();
        
        // Format the date properly - handle multiple date formats
        String formattedDate;
        java.time.LocalDate parsedDate;
        try {
            // Try different date formats
            if (dateStr.matches("\\d{4}-\\d{2}-\\d{2}")) {
                // ISO format: 2025-08-12
                parsedDate = java.time.LocalDate.parse(dateStr);
            } else if (dateStr.matches("\\d{2}/\\d{2}/\\d{4}")) {
                // US format: 08/12/2025
                parsedDate = java.time.LocalDate.parse(dateStr, java.time.format.DateTimeFormatter.ofPattern("MM/dd/yyyy"));
            } else if (dateStr.matches("\\d{2}-\\d{2}-\\d{4}")) {
                // DD-MM-YYYY format: 12-08-2025
                parsedDate = java.time.LocalDate.parse(dateStr, java.time.format.DateTimeFormatter.ofPattern("dd-MM-yyyy"));
            } else {
                // Try default ISO format
                parsedDate = java.time.LocalDate.parse(dateStr);
            }
            formattedDate = parsedDate.format(java.time.format.DateTimeFormatter.ofPattern("dd MMMM yyyy"));
        } catch (Exception e) {
            // Fallback to current date if parsing fails
            parsedDate = java.time.LocalDate.now();
            formattedDate = parsedDate.format(java.time.format.DateTimeFormatter.ofPattern("dd MMMM yyyy"));
            System.out.println("[WARNING] Date parsing failed for: " + dateStr + ", using current date");
        }
        
        // Energy entries are now allowed without any duplicate checking
        // Admins can add energy data freely for any date and amount
        
        // Add debugging to see what date is being processed
        System.out.println("[DEBUG] Processing energy data for date: " + parsedDate);
        System.out.println("[DEBUG] Formatted date: " + formattedDate);
        System.out.println("[DEBUG] Month: " + parsedDate.getMonthValue() + ", Year: " + parsedDate.getYear());
        
        // Check if energy data for this project and date has already been processed
        // This prevents accidental duplicate submissions
        List<RewardHistory> existingRewards = rewardHistoryRepository.findByProjectAndMonthAndYear(project, parsedDate.getMonthValue(), parsedDate.getYear());
        if (!existingRewards.isEmpty()) {
            // Check if any existing reward has the same energy amount (likely a duplicate)
            for (RewardHistory existing : existingRewards) {
                if (Math.abs(existing.getKWh() - energyProduced) < 0.01) {
                    return ResponseEntity.badRequest().body("Energy data for " + project.getName() + " with " + energyProduced + " kWh for " + formattedDate + " has already been processed. Please check if this is a duplicate submission.");
                }
            }
        }
        
        int usersRewarded = 0;
        BigDecimal totalRewardsDistributed = BigDecimal.ZERO;
        
        System.out.println("[DEBUG] Processing energy rewards for project: " + project.getName() + " - " + energyProduced + " kWh on " + formattedDate);
        
        // Create reward history entry for all users subscribed to this project
        List<Subscription> subscriptions = subscriptionRepository.findByProject(project);
        
        // Filter only successful subscriptions
        List<Subscription> successfulSubscriptions = subscriptions.stream()
            .filter(sub -> "SUCCESS".equals(sub.getPaymentStatus()))
            .collect(java.util.stream.Collectors.toList());
            
        System.out.println("[DEBUG] Found " + successfulSubscriptions.size() + " active subscriptions for this project");
            
        if (successfulSubscriptions.isEmpty()) {
            return ResponseEntity.badRequest().body("No active subscriptions found for project " + project.getName());
        }
        
        // Calculate total investment in this project using actual contribution amounts
        BigDecimal totalProjectInvestment = successfulSubscriptions.stream()
            .map(Subscription::getContributionAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        System.out.println("[DEBUG] Total project investment (actual contributions): " + totalProjectInvestment);
        
        for (Subscription sub : successfulSubscriptions) {
            // Calculate reward based on user's actual investment proportion
            // Each user gets a share of the total energy production based on their actual contribution amount
            BigDecimal userInvestment = sub.getContributionAmount(); // Use actual contribution amount
            BigDecimal userShare = userInvestment.divide(totalProjectInvestment, 4, BigDecimal.ROUND_HALF_UP);
            BigDecimal userEnergyShare = new BigDecimal(energyProduced).multiply(userShare);
            BigDecimal rewardAmount = userEnergyShare.multiply(new BigDecimal("5")); // ₹5 per kWh
            
            System.out.println("[DEBUG] User: " + sub.getUser().getEmail() + 
                             ", Investment: " + userInvestment + 
                             ", Share: " + userShare + 
                             ", Energy Share: " + userEnergyShare + 
                             ", Reward: " + rewardAmount);
                
                RewardHistory reward = new RewardHistory();
                reward.setUser(sub.getUser());
                reward.setProject(project);
                reward.setKWh(userEnergyShare.doubleValue());
                reward.setRewardAmount(rewardAmount);
                reward.setStatus("SUCCESS");
                reward.setReason("Energy production reward for " + project.getName());
                reward.setMonth(parsedDate.getMonthValue());
                reward.setYear(parsedDate.getYear());
                reward.setDate(parsedDate); // Set the actual date when energy was generated
                reward.setCreatedAt(LocalDateTime.now()); // Set createdAt
                
                // Debug: Print what we're setting
                System.out.println("[DEBUG] Creating reward for user: " + sub.getUser().getEmail());
                System.out.println("[DEBUG] Setting date to: " + parsedDate);
                System.out.println("[DEBUG] Setting month to: " + parsedDate.getMonthValue());
                System.out.println("[DEBUG] Setting year to: " + parsedDate.getYear());
                
                rewardHistoryRepository.save(reward);
                
                // Debug: Print what was saved
                System.out.println("[DEBUG] Saved reward with ID: " + reward.getId());
                System.out.println("[DEBUG] Saved reward date: " + reward.getDate());
                System.out.println("[DEBUG] Saved reward month: " + reward.getMonth());
                System.out.println("[DEBUG] Saved reward year: " + reward.getYear());
                
                // Send email notification to user
                String emailSubject = "Energy Reward - " + project.getName();
                String emailBody = String.format(
                    "Dear %s,\n\n" +
                    "Your solar investment in %s has generated %.2f kWh of energy (your share).\n\n" +
                    "Reward: ₹%.2f\n" +
                    "Date: %s\n\n" +
                    "Thank you for investing in solar energy!\n\n" +
                    "Best regards,\nSunYield Team",
                    sub.getUser().getFullName(),
                    project.getName(),
                    userEnergyShare.doubleValue(), // Show user's actual share
                    rewardAmount.doubleValue(),
                    LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm"))
                );
                
                emailService.sendEmail(sub.getUser().getEmail(), emailSubject, emailBody);
                
                usersRewarded++;
                totalRewardsDistributed = totalRewardsDistributed.add(rewardAmount);
                
                System.out.println("[DEBUG] Energy reward sent to user " + sub.getUser().getEmail() + ": ₹" + rewardAmount + " for " + userEnergyShare.doubleValue() + " kWh (share of " + energyProduced + " kWh total, ₹5/kWh rate) on " + formattedDate);
        }
        
        String responseMessage = String.format(
            "Energy data added successfully!\n" +
            "- Project: %s\n" +
            "- Energy Generated: %.2f kWh\n" +
            "- Users Rewarded: %d\n" +
            "- Total Rewards Distributed: ₹%.2f (₹5/kWh rate)\n" +
            "- Email notifications sent to all users\n" +
            "- Date: %s",
            project.getName(),
            energyProduced,
            usersRewarded,
            totalRewardsDistributed.doubleValue(),
            formattedDate
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
        
        // Sort by subscribedAt date descending (most recent first)
        allSubscriptions.sort((s1, s2) -> {
            if (s1.getSubscribedAt() == null && s2.getSubscribedAt() == null) return 0;
            if (s1.getSubscribedAt() == null) return 1;
            if (s2.getSubscribedAt() == null) return -1;
            return s2.getSubscribedAt().compareTo(s1.getSubscribedAt());
        });
        
        return ResponseEntity.ok(allSubscriptions);
    }
    
    // Get all subscription transactions (for admin monitoring)
    @GetMapping("/subscriptions/transactions")
    public ResponseEntity<?> getAllSubscriptionTransactions() {
        List<CreditTransferLog> transactions = creditTransferLogRepository.findAll().stream()
                .filter(t -> "SUBSCRIPTION".equals(t.getType()))
                .sorted((t1, t2) -> t2.getDate().compareTo(t1.getDate())) // Most recent first
                .collect(java.util.stream.Collectors.toList());
        
        return ResponseEntity.ok(transactions);
    }
    
    // Get user investment history (for admin monitoring)
    @GetMapping("/users/{userId}/investments")
    public ResponseEntity<?> getUserInvestmentHistory(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        
        List<CreditTransferLog> investments = creditTransferLogRepository.findByFromUserId(userId).stream()
                .filter(t -> "SUBSCRIPTION".equals(t.getType()) || "REINVEST".equals(t.getType()))
                .sorted((t1, t2) -> t2.getDate().compareTo(t1.getDate()))
                .collect(java.util.stream.Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("user", userOpt.get());
        response.put("investments", investments);
        response.put("totalInvested", investments.stream()
                .map(CreditTransferLog::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        
        return ResponseEntity.ok(response);
    }
    
    // Get project investment summary (for admin monitoring)
    @GetMapping("/projects/{projectId}/investments")
    public ResponseEntity<?> getProjectInvestmentSummary(@PathVariable Long projectId) {
        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Project not found");
        }
        
        List<CreditTransferLog> investments = creditTransferLogRepository.findAll().stream()
                .filter(t -> projectId.equals(t.getProject() != null ? t.getProject().getId() : null))
                .filter(t -> "SUBSCRIPTION".equals(t.getType()))
                .sorted((t1, t2) -> t2.getDate().compareTo(t1.getDate()))
                .collect(java.util.stream.Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("project", projectOpt.get());
        response.put("investments", investments);
        response.put("totalInvested", investments.stream()
                .map(CreditTransferLog::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        response.put("uniqueInvestors", investments.stream()
                .map(t -> t.getFromUser().getId())
                .distinct()
                .count());
        
        return ResponseEntity.ok(response);
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
        // Debug: Log authentication info
        System.out.println("[DEBUG] Dashboard stats requested");
        System.out.println("[DEBUG] Authentication: " + SecurityContextHolder.getContext().getAuthentication());
        
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalUsers", userRepository.count());
        stats.put("totalProjects", projectRepository.count());
        stats.put("pendingKycRequests", kycRepository.countByStatus(KYCStatus.PENDING));
        stats.put("totalSubscriptions", subscriptionRepository.count());
        stats.put("totalRevenue", 0.0); // TODO: Calculate from project subscription prices
        stats.put("pendingWithdrawals", 0L); // TODO: Implement withdrawal counting
        
        return ResponseEntity.ok(stats);
    }
    
    // ==================== COUPON MANAGEMENT ====================
    
    @GetMapping("/coupons")
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        List<Coupon> coupons = couponService.getAllActiveCoupons();
        return ResponseEntity.ok(coupons);
    }
    
    @PostMapping("/coupons")
    public ResponseEntity<?> createCoupon(@RequestBody Coupon coupon) {
        try {
            Coupon createdCoupon = couponService.createCoupon(coupon);
            return ResponseEntity.ok(createdCoupon);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/coupons/{id}")
    public ResponseEntity<?> updateCoupon(@PathVariable Long id, @RequestBody Coupon couponDetails) {
        try {
            Coupon updatedCoupon = couponService.updateCoupon(id, couponDetails);
            return ResponseEntity.ok(updatedCoupon);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id) {
        try {
            couponService.deleteCoupon(id);
            return ResponseEntity.ok("Coupon deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 