package com.solarcapital.backend.controller;

import com.solarcapital.backend.entity.User;
import com.solarcapital.backend.repository.UserRepository;
import com.solarcapital.backend.service.EmailService;
import com.solarcapital.backend.util.JwtUtil;
import com.solarcapital.backend.util.OtpUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.solarcapital.backend.repository.CreditTransferLogRepository;
import com.solarcapital.backend.repository.RewardHistoryRepository;
import com.solarcapital.backend.repository.SubscriptionRepository;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private EmailService emailService;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private SubscriptionRepository subscriptionRepository;
    @Autowired
    private RewardHistoryRepository rewardHistoryRepository;
    @Autowired
    private CreditTransferLogRepository creditTransferLogRepository;
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Registration endpoint
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> req) {
        String email = req.get("email");
        String password = req.get("password");
        String fullName = req.get("fullName");
        String contact = req.get("contact");
        
        System.out.println("[DEBUG] Registration - Email: " + email + ", FullName: " + fullName + ", Contact: " + contact);
        
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFullName(fullName);
        user.setContact(contact);
        user.setVerified(false);
        String otp = OtpUtil.generateOtp(6);
        user.setOtp(otp);
        user.setOtpGeneratedTime(Instant.now().toEpochMilli());
        userRepository.save(user);
        
        System.out.println("[DEBUG] User saved - ID: " + user.getId() + ", Email: " + user.getEmail() + ", FullName: " + user.getFullName() + ", Contact: " + user.getContact());
        
        emailService.sendOtpEmail(email, otp);
        return ResponseEntity.ok("Registration successful. OTP sent to email.");
    }

    // OTP verification endpoint
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> req) {
        String email = req.get("email");
        String otp = req.get("otp");
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        User user = userOpt.get();
        // OTP valid for 10 minutes
        long now = Instant.now().toEpochMilli();
        if (user.getOtp() == null || !user.getOtp().equals(otp) || now - user.getOtpGeneratedTime() > 10 * 60 * 1000) {
            return ResponseEntity.badRequest().body("Invalid or expired OTP");
        }
        user.setVerified(true);
        user.setOtp(null);
        user.setOtpGeneratedTime(null);
        userRepository.save(user);
        
        // Generate token and return user data
        String token = jwtUtil.generateToken(email);
        
        Map<String, Object> resp = new HashMap<>();
        resp.put("token", token);
        resp.put("user", Map.of(
            "id", user.getId(),
            "email", user.getEmail(),
            "fullName", user.getFullName(),
            "contact", user.getContact(),
            "kycStatus", user.getKycStatus(),
            "isVerified", user.isVerified(),
            "role", user.getRole()
        ));
        
        return ResponseEntity.ok(resp);
    }

    // Resend OTP endpoint
    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> req) {
        String email = req.get("email");
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        User user = userOpt.get();
        
        // Check if user is already verified
        if (user.isVerified()) {
            return ResponseEntity.badRequest().body("User is already verified");
        }
        
        // Generate new OTP
        String otp = OtpUtil.generateOtp(6);
        user.setOtp(otp);
        user.setOtpGeneratedTime(Instant.now().toEpochMilli());
        userRepository.save(user);
        
        // Send new OTP via email
        emailService.sendOtpEmail(email, otp);
        
        return ResponseEntity.ok("New OTP sent to your email.");
    }

    // Login endpoint
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> req) {
        String email = req.get("email");
        String password = req.get("password");
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        User user = userOpt.get();
        if (!user.isVerified()) {
            return ResponseEntity.badRequest().body("User not verified. Please verify OTP.");
        }
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }
        String token = jwtUtil.generateToken(email);
        
        Map<String, Object> resp = new HashMap<>();
        resp.put("token", token);
        resp.put("user", Map.of(
            "id", user.getId(),
            "email", user.getEmail(),
            "fullName", user.getFullName(),
            "contact", user.getContact(),
            "kycStatus", user.getKycStatus(),
            "isVerified", user.isVerified(),
            "role", user.getRole()
        ));
        
        return ResponseEntity.ok(resp);
    }

    // Get current user endpoint
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            // Get user from SecurityContext (set by JwtFilter)
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("Not authenticated");
            }
            
            // Get user object from authentication
            User user = (User) authentication.getPrincipal();
            System.out.println("[DEBUG] getCurrentUser - User data: " + user.getEmail() + ", " + user.getFullName() + ", " + user.getContact());
            
            Map<String, Object> userData = Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "fullName", user.getFullName(),
                "contact", user.getContact(),
                "kycStatus", user.getKycStatus(),
                "isVerified", user.isVerified(),
                "role", user.getRole()
            );
            
            System.out.println("[DEBUG] getCurrentUser - Response: " + userData);
            return ResponseEntity.ok(userData);
        } catch (Exception e) {
            System.err.println("[ERROR] getCurrentUser exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching user data");
        }
    }

    // Debug endpoint to test user-specific data
    @GetMapping("/debug/user-data")
    public ResponseEntity<?> debugUserData() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("Not authenticated");
            }
            
            Object principal = authentication.getPrincipal();
            User user = null;
            
            if (principal instanceof User) {
                user = (User) principal;
            } else if (principal instanceof String) {
                String email = (String) principal;
                
                // Handle anonymousUser case
                if ("anonymousUser".equals(email)) {
                    return ResponseEntity.status(401).body("User not authenticated - anonymousUser detected. Please login first.");
                }
                
                // If principal is email string, fetch user from database
                Optional<User> userOpt = userRepository.findByEmail(email);
                if (userOpt.isPresent()) {
                    user = userOpt.get();
                } else {
                    return ResponseEntity.status(404).body("User not found for email: " + email);
                }
            } else {
                return ResponseEntity.status(500).body("Unexpected principal type: " + principal.getClass().getName());
            }
            
            // Get user-specific data counts
            long subscriptionCount = subscriptionRepository.findByUser(user).size();
            long rewardCount = rewardHistoryRepository.findByUser(user).size();
            long fromTransactionCount = creditTransferLogRepository.findByFromUserId(user.getId()).size();
            long toTransactionCount = creditTransferLogRepository.findByToUserId(user.getId()).size();
            
            Map<String, Object> debugData = new HashMap<>();
            debugData.put("user", Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "fullName", user.getFullName()
            ));
            debugData.put("dataCounts", Map.of(
                "subscriptions", subscriptionCount,
                "rewards", rewardCount,
                "outgoingTransactions", fromTransactionCount,
                "incomingTransactions", toTransactionCount
            ));
            debugData.put("authenticationInfo", Map.of(
                "principalType", principal.getClass().getName(),
                "principalValue", principal.toString(),
                "isAuthenticated", authentication.isAuthenticated()
            ));
            
            return ResponseEntity.ok(debugData);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error in debug endpoint: " + e.getMessage());
        }
    }
} 