package com.sunyield.backend.security;

import com.sunyield.backend.util.JwtUtil;
import com.sunyield.backend.repository.UserRepository;
import com.sunyield.backend.entity.User;
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
        
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String email = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                email = jwtUtil.extractEmail(token);
            } catch (Exception e) {
                System.err.println("[ERROR] Failed to extract email from token: " + e.getMessage());
                chain.doFilter(request, response);
                return;
            }
        }

        if (email != null && !email.equals("anonymousUser") && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                Optional<User> userOpt = userRepository.findByEmail(email);
                boolean tokenValid = jwtUtil.validateToken(token);
                
                if (userOpt.isPresent() && tokenValid) {
                    User user = userOpt.get();
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception e) {
                System.err.println("[ERROR] Exception in JwtFilter: " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        chain.doFilter(request, response);
    }
    
    private boolean isPublicEndpoint(String requestURI) {
        boolean isPublic = requestURI.startsWith("/auth/") || 
               requestURI.startsWith("/admin/login") ||
               requestURI.startsWith("/admin/generate-hash") ||
               requestURI.startsWith("/admin/test-auth") ||
               requestURI.startsWith("/swagger-ui/") ||
               requestURI.startsWith("/v3/api-docs") ||
               requestURI.equals("/swagger-ui.html") ||
               requestURI.equals("/api/energy/record") ||
               requestURI.startsWith("/api/projects/") ||
               requestURI.startsWith("/test/");
        
        System.out.println("[DEBUG] Checking URI: " + requestURI + " - Is public: " + isPublic);
        return isPublic;
    }
} 