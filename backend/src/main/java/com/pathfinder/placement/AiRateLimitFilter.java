package com.pathfinder.placement;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class AiRateLimitFilter extends OncePerRequestFilter {
    private static final long WINDOW_MILLIS = Duration.ofMinutes(15).toMillis();
    private static final int REQUEST_LIMIT = 5;

    private final ConcurrentHashMap<String, RequestWindow> windows = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    public AiRateLimitFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        if (!"POST".equals(request.getMethod()) || !request.getRequestURI().startsWith("/api/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String key = request.getRemoteAddr() + ":" + request.getRequestURI();
        long now = System.currentTimeMillis();
        AtomicBoolean limited = new AtomicBoolean();
        windows.compute(key, (_key, current) -> {
            if (current == null || now - current.startedAt() >= WINDOW_MILLIS) {
                return new RequestWindow(now, 1);
            }
            if (current.count() >= REQUEST_LIMIT) {
                limited.set(true);
                return current;
            }
            return new RequestWindow(current.startedAt(), current.count() + 1);
        });

        if (limited.get()) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            objectMapper.writeValue(response.getWriter(),
                    java.util.Map.of("error", "Too many AI requests. Try again in 15 minutes."));
            return;
        }
        filterChain.doFilter(request, response);
    }

    private record RequestWindow(long startedAt, int count) {}
}
