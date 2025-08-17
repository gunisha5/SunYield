package com.solarcapital.backend.security;

import com.solarcapital.backend.util.JwtUtil;
import com.solarcapital.backend.repository.UserRepository;
import com.solarcapital.backend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;
import java.util.Collections;
import org.springframework.security.core.Authentication;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String requestURI = request.getRequestURI();
        
        // Skip JWT filter for OPTIONS requests (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            chain.doFilter(request, response);
            return;
        }
        
        // Skip JWT filter for public endpoints
        if (isPublicEndpoint(requestURI)) {
            chain.doFilter(request, response);
            return;
        }
        
        System.out.println("[DEBUG] JwtFilter running for request: " + requestURI); // DEBUG point
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String email = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                email = jwtUtil.extractEmail(token);
                System.out.println("[DEBUG] Extracted email from JWT: " + email); // DEBUG point
            } catch (Exception e) {
                System.err.println("[ERROR] Failed to extract email from token: " + e.getMessage());
                chain.doFilter(request, response);
                return;
            }
        } else {
            System.out.println("[DEBUG] No Authorization header found or invalid format");
        }

        if (email != null && !email.equals("anonymousUser") && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                Optional<User> userOpt = userRepository.findByEmail(email);
                if (userOpt.isPresent() && jwtUtil.validateToken(token)) {
                    User user = userOpt.get();
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println("[DEBUG] Authentication set for user: " + user.getEmail() + ", ID: " + user.getId()); // DEBUG point
                } else {
                    System.out.println("[DEBUG] User not found or token invalid for email: " + email);
                }
            } catch (Exception e) {
                System.err.println("[ERROR] Exception in JwtFilter: " + e.getMessage());
            }
        } else {
            System.out.println("[DEBUG] Email is null, anonymousUser, or authentication already exists");
        }
        
        chain.doFilter(request, response);
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("[DEBUG] Authentication in SecurityContext after filter: " + 
            (auth != null ? auth.getPrincipal() : "null")); // DEBUG point
    }
    
    private boolean isPublicEndpoint(String requestURI) {
        return requestURI.startsWith("/auth/") || 
               requestURI.startsWith("/admin/login") ||
               requestURI.startsWith("/admin/generate-hash") ||
               requestURI.startsWith("/admin/test-auth") ||
               requestURI.startsWith("/swagger-ui/") ||
               requestURI.startsWith("/v3/api-docs") ||
               requestURI.equals("/swagger-ui.html") ||
               requestURI.equals("/api/energy/record") ||
               requestURI.equals("/api/projects/active") ||
               requestURI.startsWith("/api/projects/images/");
    }
} 