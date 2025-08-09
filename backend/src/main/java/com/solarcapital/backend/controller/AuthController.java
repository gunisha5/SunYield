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

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private EmailService emailService;
    @Autowired
    private JwtUtil jwtUtil;
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
        return ResponseEntity.ok("OTP verified. You can now log in.");
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
            
            String email = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body("User not found");
            }
            
            User user = userOpt.get();
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
} 