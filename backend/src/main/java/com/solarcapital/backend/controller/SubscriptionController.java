package com.solarcapital.backend.controller;

import com.solarcapital.backend.entity.Project;
import com.solarcapital.backend.entity.Subscription;
import com.solarcapital.backend.entity.User;
import com.solarcapital.backend.entity.CreditTransferLog;
import com.solarcapital.backend.repository.ProjectRepository;
import com.solarcapital.backend.repository.SubscriptionRepository;
import com.solarcapital.backend.repository.UserRepository;
import com.solarcapital.backend.repository.CreditTransferLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

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

    // 1. Initiate subscription (mock Cashfree order creation)
    @PostMapping
    public ResponseEntity<?> initiateSubscription(@RequestParam Long projectId, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        System.out.println("[DEBUG] Authorization header: " + authHeader); // DEBUG point
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email;
        Object principal = auth.getPrincipal();
        if (principal instanceof com.solarcapital.backend.entity.User) {
            email = ((com.solarcapital.backend.entity.User) principal).getEmail();
        } else {
            email = principal.toString();
        }
        System.out.println("[DEBUG] Email from SecurityContext: " + email); // DEBUG point
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(401).body("User not found");
        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) return ResponseEntity.badRequest().body("Project not found");

        // Simulate Cashfree order creation
        String fakeOrderId = "CF_ORDER_" + System.currentTimeMillis();
        String fakePaymentLink = "https://test.cashfree.com/payment/" + fakeOrderId;

        // Save subscription with PENDING status
        Subscription sub = new Subscription();
        sub.setUser(userOpt.get());
        sub.setProject(projectOpt.get());
        sub.setPaymentOrderId(fakeOrderId);
        sub.setPaymentStatus("PENDING");
        sub.setSubscribedAt(LocalDateTime.now());
        subscriptionRepository.save(sub);

        Map<String, String> resp = new HashMap<>();
        resp.put("paymentOrderId", fakeOrderId);
        resp.put("paymentLink", fakePaymentLink);
        return ResponseEntity.ok(resp);
    }

    // 2. Webhook endpoint to handle payment status (mocked)
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
        User user = (User) auth.getPrincipal();
        String email = user.getEmail();
        System.out.println("[DEBUG] Email from SecurityContext: " + email); // DEBUG point
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(401).body("User not found");
        List<Subscription> subs = subscriptionRepository.findByUser(userOpt.get());
        return ResponseEntity.ok(subs);
    }
} 