package com.solarcapital.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CashfreeMockService {

    @Value("${cashfree.mock.enabled:true}")
    private boolean mockEnabled;

    @Value("${cashfree.mock.app-id:TEST_APP_ID}")
    private String appId;

    @Value("${cashfree.mock.secret-key:TEST_SECRET_KEY}")
    private String secretKey;

    @Value("${cashfree.mock.success-rate:85}")
    private int successRate;

    @Value("${cashfree.mock.payment-delay-ms:2000}")
    private long paymentDelayMs;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, PaymentStatus> paymentStatuses = new ConcurrentHashMap<>();
    private final Map<String, PaymentOrder> paymentOrders = new ConcurrentHashMap<>();

    // Simulate payment order creation
    public Map<String, Object> createOrder(Map<String, Object> request) {
        if (!mockEnabled) {
            throw new RuntimeException("Cashfree mock is disabled");
        }

        try {
            // Validate required fields
            validateOrderRequest(request);

            String orderId = generateOrderId();
            BigDecimal amount = new BigDecimal(request.get("orderAmount").toString());
            String orderCurrency = (String) request.get("orderCurrency");
            String customerName = (String) request.get("customerName");
            String customerEmail = (String) request.get("customerEmail");
            String customerPhone = (String) request.get("customerPhone");

            // Create payment order
            PaymentOrder order = new PaymentOrder();
            order.setOrderId(orderId);
            order.setOrderAmount(amount);
            order.setOrderCurrency(orderCurrency);
            order.setCustomerName(customerName);
            order.setCustomerEmail(customerEmail);
            order.setCustomerPhone(customerPhone);
            order.setOrderNote((String) request.get("orderNote"));
            order.setCreatedAt(LocalDateTime.now());
            order.setStatus("PENDING");

            paymentOrders.put(orderId, order);
            paymentStatuses.put(orderId, PaymentStatus.PENDING);

            // Generate payment link
            String paymentLink = generatePaymentLink(orderId);

            Map<String, Object> response = new HashMap<>();
            response.put("cfOrderId", orderId);
            response.put("orderId", orderId);
            response.put("entity", "order");
            response.put("orderCurrency", orderCurrency);
            response.put("orderAmount", amount);
            response.put("orderStatus", "ACTIVE");
            response.put("paymentSessionId", generateSessionId());
            response.put("orderExpiryTime", LocalDateTime.now().plusHours(24).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            response.put("orderNote", order.getOrderNote());
            response.put("customerDetails", createCustomerDetails(customerName, customerEmail, customerPhone));
            response.put("paymentUrl", paymentLink);

            return response;

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "ERROR");
            errorResponse.put("message", e.getMessage());
            return errorResponse;
        }
    }

    // Simulate payment status check
    public Map<String, Object> getOrderStatus(String orderId) {
        if (!mockEnabled) {
            throw new RuntimeException("Cashfree mock is disabled");
        }

        PaymentOrder order = paymentOrders.get(orderId);
        if (order == null) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "ERROR");
            errorResponse.put("message", "Order not found");
            return errorResponse;
        }

        Map<String, Object> response = new HashMap<>();
        response.put("cfOrderId", orderId);
        response.put("orderId", orderId);
        response.put("entity", "order");
        response.put("orderCurrency", order.getOrderCurrency());
        response.put("orderAmount", order.getOrderAmount());
        response.put("orderStatus", order.getStatus());
        response.put("orderNote", order.getOrderNote());
        response.put("customerDetails", createCustomerDetails(
            order.getCustomerName(), 
            order.getCustomerEmail(), 
            order.getCustomerPhone()
        ));

        return response;
    }

    // Simulate payment processing
    public Map<String, Object> processPayment(String orderId, String paymentMethod, Map<String, Object> paymentDetails) {
        if (!mockEnabled) {
            throw new RuntimeException("Cashfree mock is disabled");
        }

        PaymentOrder order = paymentOrders.get(orderId);
        if (order == null) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "ERROR");
            errorResponse.put("message", "Order not found");
            return errorResponse;
        }

        // Simulate payment delay
        try {
            Thread.sleep(paymentDelayMs);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Determine payment success based on success rate
        boolean isSuccess = Math.random() * 100 < successRate;
        
        // Additional failure conditions
        if (paymentMethod.equals("CARD") && paymentDetails.containsKey("cardNumber")) {
            String cardNumber = paymentDetails.get("cardNumber").toString();
            if (cardNumber.endsWith("0000")) {
                isSuccess = false; // Force failure for test cards ending in 0000
            }
        }

        PaymentStatus status = isSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
        paymentStatuses.put(orderId, status);
        order.setStatus(status.name());
        order.setProcessedAt(LocalDateTime.now());

        Map<String, Object> response = new HashMap<>();
        response.put("cfOrderId", orderId);
        response.put("orderId", orderId);
        response.put("entity", "order");
        response.put("orderCurrency", order.getOrderCurrency());
        response.put("orderAmount", order.getOrderAmount());
        response.put("orderStatus", status.name());
        response.put("paymentStatus", status.name());
        response.put("transactionId", isSuccess ? generateTransactionId() : null);
        response.put("transactionAmount", isSuccess ? order.getOrderAmount() : BigDecimal.ZERO);
        response.put("transactionCurrency", order.getOrderCurrency());
        response.put("transactionTime", order.getProcessedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        response.put("paymentMethod", paymentMethod);
        response.put("orderNote", order.getOrderNote());

        return response;
    }

    // Simulate webhook notification
    public Map<String, Object> generateWebhookPayload(String orderId) {
        PaymentOrder order = paymentOrders.get(orderId);
        PaymentStatus status = paymentStatuses.get(orderId);

        Map<String, Object> webhookPayload = new HashMap<>();
        webhookPayload.put("orderId", orderId);
        webhookPayload.put("orderAmount", order.getOrderAmount());
        webhookPayload.put("orderCurrency", order.getOrderCurrency());
        webhookPayload.put("orderStatus", status.name());
        webhookPayload.put("transactionId", status == PaymentStatus.SUCCESS ? generateTransactionId() : null);
        webhookPayload.put("transactionAmount", status == PaymentStatus.SUCCESS ? order.getOrderAmount() : BigDecimal.ZERO);
        webhookPayload.put("transactionCurrency", order.getOrderCurrency());
        webhookPayload.put("transactionTime", order.getProcessedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        webhookPayload.put("customerEmail", order.getCustomerEmail());
        webhookPayload.put("customerPhone", order.getCustomerPhone());
        webhookPayload.put("orderNote", order.getOrderNote());

        return webhookPayload;
    }

    // Simulate payout order creation
    public Map<String, Object> createPayoutOrder(Map<String, Object> request) {
        if (!mockEnabled) {
            throw new RuntimeException("Cashfree mock is disabled");
        }

        try {
            // Validate required fields
            validatePayoutRequest(request);

            String orderId = generatePayoutOrderId();
            BigDecimal amount = new BigDecimal(request.get("orderAmount").toString());
            String orderCurrency = (String) request.get("orderCurrency");
            String customerName = (String) request.get("customerName");
            String customerEmail = (String) request.get("customerEmail");
            String customerPhone = (String) request.get("customerPhone");
            String payoutMethod = (String) request.get("payoutMethod");
            String upiId = (String) request.get("upiId");

            // Create payout order
            PaymentOrder order = new PaymentOrder();
            order.setOrderId(orderId);
            order.setOrderAmount(amount);
            order.setOrderCurrency(orderCurrency);
            order.setCustomerName(customerName);
            order.setCustomerEmail(customerEmail);
            order.setCustomerPhone(customerPhone);
            order.setOrderNote((String) request.get("orderNote"));
            order.setCreatedAt(LocalDateTime.now());
            order.setStatus("PENDING");

            paymentOrders.put(orderId, order);
            paymentStatuses.put(orderId, PaymentStatus.PENDING);

            Map<String, Object> response = new HashMap<>();
            response.put("cfOrderId", orderId);
            response.put("orderId", orderId);
            response.put("entity", "payout");
            response.put("orderCurrency", orderCurrency);
            response.put("orderAmount", amount);
            response.put("orderStatus", "PENDING");
            response.put("payoutMethod", payoutMethod);
            response.put("upiId", upiId);
            response.put("orderNote", order.getOrderNote());
            response.put("customerDetails", createCustomerDetails(customerName, customerEmail, customerPhone));

            return response;

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "ERROR");
            errorResponse.put("message", e.getMessage());
            return errorResponse;
        }
    }

    // Simulate payout status check
    public Map<String, Object> getPayoutStatus(String orderId) {
        if (!mockEnabled) {
            throw new RuntimeException("Cashfree mock is disabled");
        }

        PaymentOrder order = paymentOrders.get(orderId);
        if (order == null) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "ERROR");
            errorResponse.put("message", "Payout order not found");
            return errorResponse;
        }

        // Simulate payout processing delay and success/failure
        if (order.getStatus().equals("PENDING")) {
            // Simulate processing delay
            try {
                Thread.sleep(paymentDelayMs);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            // Determine payout success based on success rate
            boolean isSuccess = Math.random() * 100 < successRate;
            PaymentStatus status = isSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
            paymentStatuses.put(orderId, status);
            order.setStatus(status.name());
            order.setProcessedAt(LocalDateTime.now());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("cfOrderId", orderId);
        response.put("orderId", orderId);
        response.put("entity", "payout");
        response.put("orderCurrency", order.getOrderCurrency());
        response.put("orderAmount", order.getOrderAmount());
        response.put("orderStatus", order.getStatus());
        response.put("orderNote", order.getOrderNote());
        response.put("customerDetails", createCustomerDetails(
            order.getCustomerName(), 
            order.getCustomerEmail(), 
            order.getCustomerPhone()
        ));

        return response;
    }

    // Helper methods
    private void validateOrderRequest(Map<String, Object> request) {
        if (!request.containsKey("orderAmount") || !request.containsKey("orderCurrency") ||
            !request.containsKey("customerName") || !request.containsKey("customerEmail") ||
            !request.containsKey("customerPhone")) {
            throw new IllegalArgumentException("Missing required fields: orderAmount, orderCurrency, customerName, customerEmail, customerPhone");
        }
    }

    private void validatePayoutRequest(Map<String, Object> request) {
        if (!request.containsKey("orderAmount") || !request.containsKey("orderCurrency") ||
            !request.containsKey("customerName") || !request.containsKey("customerEmail") ||
            !request.containsKey("customerPhone") || !request.containsKey("payoutMethod")) {
            throw new IllegalArgumentException("Missing required fields: orderAmount, orderCurrency, customerName, customerEmail, customerPhone, payoutMethod");
        }
    }

    private String generateOrderId() {
        return "CF_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000);
    }

    private String generatePayoutOrderId() {
        return "PAYOUT_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000);
    }

    private String generateSessionId() {
        return "session_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 10000);
    }

    private String generateTransactionId() {
        return "txn_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 10000);
    }

    private String generatePaymentLink(String orderId) {
        return "http://localhost:3000/mock-payment?orderId=" + orderId + "&paymentType=wallet";
    }

    private Map<String, Object> createCustomerDetails(String name, String email, String phone) {
        Map<String, Object> customer = new HashMap<>();
        customer.put("customerName", name);
        customer.put("customerEmail", email);
        customer.put("customerPhone", phone);
        return customer;
    }

    // Get all orders for testing
    public List<PaymentOrder> getAllOrders() {
        return new ArrayList<>(paymentOrders.values());
    }

    // Clear all orders for testing
    public void clearAllOrders() {
        paymentOrders.clear();
        paymentStatuses.clear();
    }

    // Inner classes
    public static class PaymentOrder {
        private String orderId;
        private BigDecimal orderAmount;
        private String orderCurrency;
        private String customerName;
        private String customerEmail;
        private String customerPhone;
        private String orderNote;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime processedAt;

        // Getters and setters
        public String getOrderId() { return orderId; }
        public void setOrderId(String orderId) { this.orderId = orderId; }
        
        public BigDecimal getOrderAmount() { return orderAmount; }
        public void setOrderAmount(BigDecimal orderAmount) { this.orderAmount = orderAmount; }
        
        public String getOrderCurrency() { return orderCurrency; }
        public void setOrderCurrency(String orderCurrency) { this.orderCurrency = orderCurrency; }
        
        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }
        
        public String getCustomerEmail() { return customerEmail; }
        public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
        
        public String getCustomerPhone() { return customerPhone; }
        public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
        
        public String getOrderNote() { return orderNote; }
        public void setOrderNote(String orderNote) { this.orderNote = orderNote; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        
        public LocalDateTime getProcessedAt() { return processedAt; }
        public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
    }

    public enum PaymentStatus {
        PENDING, SUCCESS, FAILED, CANCELLED
    }

    // Update payout status (for testing)
    public void updatePayoutStatus(String orderId, String status) {
        PaymentOrder order = paymentOrders.get(orderId);
        if (order != null) {
            order.setStatus(status);
            order.setProcessedAt(LocalDateTime.now());
            paymentStatuses.put(orderId, PaymentStatus.valueOf(status));
        }
    }
}
